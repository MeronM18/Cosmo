import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  ImageBackground,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../services/supabase';
import { AuthService } from '../services/auth';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 6; // welcome, name, date, time, location, gender -> summary/save occurs on gender step CTA

  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: null,
    birthTime: null,
    birthPlace: '',
    gender: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Shared date and time bottom-sheet pickers (reuse existing app patterns)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());
  const [datePickerKey, setDatePickerKey] = useState(0);
  const [timePickerKey, setTimePickerKey] = useState(0);

  const dateSheetY = useRef(new Animated.Value(320)).current;
  const timeSheetY = useRef(new Animated.Value(320)).current;
  const dateOverlayOpacity = useRef(new Animated.Value(0)).current;
  const timeOverlayOpacity = useRef(new Animated.Value(0)).current;

  const normalizeTime = (input) => {
    const d = new Date();
    d.setHours(input.getHours(), input.getMinutes(), 0, 0);
    return d;
  };

  useEffect(() => {
    if (showDatePicker) {
      setTempDate(formData.birthDate || new Date());
      setDatePickerKey((k) => k + 1);
      dateSheetY.setValue(320);
      Animated.parallel([
        Animated.spring(dateSheetY, { toValue: 0, useNativeDriver: true, mass: 0.6, stiffness: 140, damping: 18 }),
        Animated.timing(dateOverlayOpacity, { toValue: 1, duration: 150, easing: Easing.linear, useNativeDriver: true }),
      ]).start();
    }
  }, [showDatePicker]);

  useEffect(() => {
    if (showTimePicker) {
      setTempTime(formData.birthTime ? normalizeTime(formData.birthTime) : normalizeTime(new Date()));
      setTimePickerKey((k) => k + 1);
      timeSheetY.setValue(320);
      Animated.parallel([
        Animated.spring(timeSheetY, { toValue: 0, useNativeDriver: true, mass: 0.6, stiffness: 140, damping: 18 }),
        Animated.timing(timeOverlayOpacity, { toValue: 1, duration: 150, easing: Easing.linear, useNativeDriver: true }),
      ]).start();
    }
  }, [showTimePicker]);

  const closeDateSheet = () => {
    Animated.parallel([
      Animated.timing(dateSheetY, { toValue: 320, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(dateOverlayOpacity, { toValue: 0, duration: 160, easing: Easing.linear, useNativeDriver: true }),
    ]).start(() => setShowDatePicker(false));
  };

  const closeTimeSheet = () => {
    Animated.parallel([
      Animated.timing(timeSheetY, { toValue: 320, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(timeOverlayOpacity, { toValue: 0, duration: 160, easing: Easing.linear, useNativeDriver: true }),
    ]).start(() => setShowTimePicker(false));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // name
        return formData.fullName.trim().length > 0;
      case 2: // birth date
        if (!formData.birthDate) return false;
        if (formData.birthDate > new Date()) return false;
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 120);
        return formData.birthDate >= minDate;
      case 3: // birth time
        return !!formData.birthTime;
      case 4: // location
        return formData.birthPlace.trim().length > 0;
      case 5: // gender
        return !!formData.gender;
      default:
        return true;
    }
  };

  const goNext = async () => {
    if (!validateCurrentStep()) {
      Alert.alert('Incomplete', 'Please complete this step before continuing.');
      return;
    }

    // If on final step, submit
    if (currentStep === totalSteps - 1) {
      await handleSubmit();
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const birthTimeString = formData.birthTime
        ? formData.birthTime.toTimeString().split(' ')[0]
        : null;

      const profileData = {
        id: user.id,
        email: user.email || '',
        full_name: formData.fullName.trim(),
        birth_date: formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : null,
        birth_time: birthTimeString,
        birth_place: formData.birthPlace.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        gender: formData.gender,
        subscription_status: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;

      // Mark onboarding complete using existing app flow
      try {
        await AuthService.setCompletedOnboarding?.(true);
      } catch (_) {
        // optional helper may not exist; navigator also checks profile presence
      }

      onComplete?.();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const StepHeader = () => (
    <View style={styles.header}>
      <Text style={styles.progressText}>Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}</Text>
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${((currentStep + 1) / totalSteps) * 100}%` }]} />
      </View>
    </View>
  );

  const WelcomeStep = () => (
    <View style={{ flex: 1 }}>
      <ImageBackground source={require('../../assets/starry-clouds.png')} style={styles.welcomeBg} resizeMode="cover">
        <View style={styles.welcomeOverlay} />
        <View style={styles.welcomeCenter}>
          <Text style={styles.welcomeTitle}>Welcome to Cosmo</Text>
          <Text style={styles.welcomeSubtitle}>Your journey among the stars begins here.</Text>
          <TouchableOpacity style={styles.primaryCta} onPress={() => setCurrentStep(1)}>
            <Text style={styles.primaryCtaText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );

  const NameStep = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StepHeader />
      <Text style={styles.title}>What should we call you?</Text>
      <Text style={styles.subtitle}>Enter your full name.</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.fullName}
          onChangeText={(text) => setFormData((p) => ({ ...p, fullName: text }))}
          placeholder="Enter your full name"
          autoCapitalize="words"
        />
      </View>
      <FooterNav onBack={goBack} onNext={goNext} nextDisabled={!validateCurrentStep()} />
    </ScrollView>
  );

  const BirthDateStep = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StepHeader />
      <Text style={styles.title}>When were you born?</Text>
      <Text style={styles.subtitle}>Select your birth date.</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Birth Date *</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={[styles.dateButtonText, !formData.birthDate && styles.placeholderText]}>
            {formData.birthDate ? formatDate(formData.birthDate) : 'Select birth date'}
          </Text>
        </TouchableOpacity>
      </View>
      <FooterNav onBack={goBack} onNext={goNext} nextDisabled={!validateCurrentStep()} />
    </ScrollView>
  );

  const BirthTimeStep = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StepHeader />
      <Text style={styles.title}>What time were you born?</Text>
      <Text style={styles.subtitle}>Approximate time is okay if unsure.</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Birth Time *</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
          <Text style={[styles.dateButtonText, !formData.birthTime && styles.placeholderText]}>
            {formData.birthTime ? formatTime(formData.birthTime) : 'Select time'}
          </Text>
        </TouchableOpacity>
      </View>
      <FooterNav onBack={goBack} onNext={goNext} nextDisabled={!validateCurrentStep()} />
    </ScrollView>
  );

  const BirthLocationStep = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StepHeader />
      <Text style={styles.title}>Where were you born?</Text>
      <Text style={styles.subtitle}>City, Country format works best.</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Birth Place *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.birthPlace}
          onChangeText={(text) => setFormData((p) => ({ ...p, birthPlace: text }))}
          placeholder="e.g., New York, USA"
          autoCapitalize="words"
        />
      </View>
      <FooterNav onBack={goBack} onNext={goNext} nextDisabled={!validateCurrentStep()} />
    </ScrollView>
  );

  const GenderStep = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StepHeader />
      <Text style={styles.title}>How do you identify?</Text>
      <Text style={styles.subtitle}>Select one option.</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.genderContainer}>
          {[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer_not_to_say', label: 'Prefer not to say' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.genderButton, formData.gender === option.value && styles.genderButtonSelected]}
              onPress={() => setFormData((p) => ({ ...p, gender: option.value }))}
            >
              <Text style={[styles.genderButtonText, formData.gender === option.value && styles.genderButtonTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.submitButton, (!validateCurrentStep() || isSaving) && styles.submitButtonDisabled]}
        disabled={!validateCurrentStep() || isSaving}
        onPress={goNext}
      >
        <Text style={styles.submitButtonText}>{isSaving ? 'Saving...' : 'Complete Setup'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backLink} onPress={goBack}>
        <Text style={styles.backLinkText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const FooterNav = ({ onBack, onNext, nextDisabled }) => (
    <View style={styles.footerNav}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.nextButton, nextDisabled && styles.nextButtonDisabled]}
        onPress={onNext}
        disabled={nextDisabled}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <NameStep />;
      case 2:
        return <BirthDateStep />;
      case 3:
        return <BirthTimeStep />;
      case 4:
        return <BirthLocationStep />;
      case 5:
        return <GenderStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderStep()}

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="none" onRequestClose={() => setShowDatePicker(false)}>
        <Animated.View style={[styles.modalOverlay, { opacity: dateOverlayOpacity }]}>
          <TouchableWithoutFeedback onPress={closeDateSheet}>
            <View style={styles.overlayTapCatcher} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.pickerModal, { transform: [{ translateY: dateSheetY }] }]}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={closeDateSheet}>
                <Text style={styles.pickerCancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Birth Date</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={() => {
                  setFormData((p) => ({ ...p, birthDate: tempDate }));
                  closeDateSheet();
                }}
              >
                <Text style={styles.pickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                key={datePickerKey}
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(e, d) => d && setTempDate(d)}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                style={styles.nativePicker}
                textColor="#ffffff"
                themeVariant="dark"
              />
            </View>
            <View style={styles.pickerFooterSpacer} />
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="none" onRequestClose={() => setShowTimePicker(false)}>
        <Animated.View style={[styles.modalOverlay, { opacity: timeOverlayOpacity }]}>
          <TouchableWithoutFeedback onPress={closeTimeSheet}>
            <View style={styles.overlayTapCatcher} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.pickerModal, { transform: [{ translateY: timeSheetY }] }]}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={closeTimeSheet}>
                <Text style={styles.pickerCancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Birth Time</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={() => {
                  setFormData((p) => ({ ...p, birthTime: normalizeTime(tempTime) }));
                  closeTimeSheet();
                }}
              >
                <Text style={styles.pickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                key={timePickerKey}
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={(e, t) => t && setTempTime(normalizeTime(t))}
                style={styles.nativePicker}
                textColor="#ffffff"
                themeVariant="dark"
                minuteInterval={1}
              />
            </View>
            <View style={styles.pickerFooterSpacer} />
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left',
    lineHeight: 22,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  genderButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#666',
  },
  genderButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#6366f1',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
    marginTop: 12,
  },
  backLinkText: {
    color: '#666',
    fontSize: 14,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  pickerModal: {
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 0,
    marginBottom: 0,
    minHeight: 340,
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  pickerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  pickerCancelButton: {
    color: '#FF9F0A',
    fontSize: 17,
    fontWeight: '600',
  },
  pickerDoneButton: {
    color: '#0A84FF',
    fontSize: 17,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#000',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  nativePicker: {
    backgroundColor: '#000',
    height: 290,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTapCatcher: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pickerFooterSpacer: {
    height: 40,
    backgroundColor: '#000',
    width: '100%',
  },
  welcomeBg: {
    flex: 1,
    width: '100%',
  },
  welcomeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  welcomeCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryCta: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: Math.min(320, width - 48),
    alignItems: 'center',
  },
  primaryCtaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});


