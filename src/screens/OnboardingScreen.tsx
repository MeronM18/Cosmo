import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Modal,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthService } from '../services/auth';
import { supabase } from '../services/supabase';
import type { UserProfile } from '../types';

interface OnboardingData {
  fullName: string;
  birthDate: Date | null;
  birthTime: Date | null;
  birthPlace: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
}

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: '',
    birthDate: null, // No predetermined date
    birthTime: null,
    birthPlace: '',
    gender: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [tempTime, setTempTime] = useState<Date>(new Date());
  const [timePickerKey, setTimePickerKey] = useState<number>(0);
  const [datePickerKey, setDatePickerKey] = useState<number>(0);

  const normalizeTime = (input: Date): Date => {
    const d = new Date();
    d.setHours(input.getHours(), input.getMinutes(), 0, 0);
    return d;
  };

  // Animated sheet translate for smooth appearance
  const dateSheetY = useRef(new Animated.Value(320)).current;
  const timeSheetY = useRef(new Animated.Value(320)).current;
  const dateOverlayOpacity = useRef(new Animated.Value(0)).current;
  const timeOverlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showDatePicker) {
      setTempDate(formData.birthDate || new Date());
      setDatePickerKey(k => k + 1);
      dateSheetY.setValue(320);
      Animated.parallel([
        Animated.spring(dateSheetY, {
          toValue: 0,
          useNativeDriver: true,
          mass: 0.6,
          stiffness: 140,
          damping: 18,
        }),
        Animated.timing(dateOverlayOpacity, {
          toValue: 1,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showDatePicker]);

  useEffect(() => {
    if (showTimePicker) {
      const seed = formData.birthTime ? normalizeTime(formData.birthTime) : normalizeTime(new Date());
      setTempTime(seed);
      setTimePickerKey(k => k + 1);
      timeSheetY.setValue(320);
      Animated.parallel([
        Animated.spring(timeSheetY, {
          toValue: 0,
          useNativeDriver: true,
          mass: 0.6,
          stiffness: 140,
          damping: 18,
        }),
        Animated.timing(timeOverlayOpacity, {
          toValue: 1,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showTimePicker]);

  const closeDateSheet = () => {
    Animated.parallel([
      Animated.timing(dateSheetY, {
        toValue: 320,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(dateOverlayOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => setShowDatePicker(false));
  };

  const closeTimeSheet = () => {
    Animated.parallel([
      Animated.timing(timeSheetY, {
        toValue: 320,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(timeOverlayOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => setShowTimePicker(false));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
    // Don't auto-close on iOS, let user tap Done
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setTempTime(normalizeTime(selectedTime));
    }
    // Don't auto-close on iOS, let user tap Done
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    if (!formData.birthPlace.trim()) {
      Alert.alert('Error', 'Please enter your birth place');
      return false;
    }

    if (!formData.gender) {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }

    // Check if birth date is selected
    if (!formData.birthDate) {
      Alert.alert('Error', 'Please select your birth date');
      return false;
    }

    // Check if birth date is not in the future
    if (formData.birthDate > new Date()) {
      Alert.alert('Error', 'Birth date cannot be in the future');
      return false;
    }

    // Check if birth date is not too far in the past (reasonable age limit)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    if (formData.birthDate < minDate) {
      Alert.alert('Error', 'Please enter a valid birth date');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Format birth time for database
      const birthTimeString = formData.birthTime 
        ? formData.birthTime.toTimeString().split(' ')[0] // HH:MM:SS format
        : null;

      // Create user profile data (using snake_case for database)
      const profileData = {
        id: user.id,
        email: user.email || '',
        full_name: formData.fullName.trim(),
        birth_date: formData.birthDate!.toISOString().split('T')[0], // YYYY-MM-DD format
        birth_time: birthTimeString || null,
        birth_place: formData.birthPlace.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        gender: formData.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say',
        subscription_status: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save to Supabase
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('Profile save error:', error);
        throw error;
      }

      console.log('Profile saved successfully:', data);
      Alert.alert('Success', 'Your profile has been saved!', [
        { text: 'OK', onPress: () => {
          // Call the onComplete callback to navigate to main app
          onComplete?.();
        }}
      ]);

    } catch (error: any) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', `Failed to save profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Cosmo</Text>
        <Text style={styles.subtitle}>Tell us about yourself to get personalized readings</Text>
      </View>

      <View style={styles.form}>
        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.fullName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />
        </View>

        {/* Birth Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birth Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[
              styles.dateButtonText,
              !formData.birthDate && styles.placeholderText
            ]}>
              {formData.birthDate ? formatDate(formData.birthDate) : 'Select birth date'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Birth Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birth Time *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={[
              styles.dateButtonText,
              !formData.birthTime && styles.placeholderText
            ]}>
              {formData.birthTime ? formatTime(formData.birthTime) : 'Select time'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Birth Place */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birth Place *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.birthPlace}
            onChangeText={(text) => setFormData(prev => ({ ...prev, birthPlace: text }))}
            placeholder="City, Country (e.g., New York, USA)"
            autoCapitalize="words"
          />
        </View>

        {/* Gender */}
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
                style={[
                  styles.genderButton,
                  formData.gender === option.value && styles.genderButtonSelected,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, gender: option.value as any }))}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    formData.gender === option.value && styles.genderButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="none"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: dateOverlayOpacity }] }>
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
                onPress={() => { setFormData(prev => ({ ...prev, birthDate: tempDate })); closeDateSheet(); }}>
                <Text style={styles.pickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                key={datePickerKey}
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
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
      <Modal
        visible={showTimePicker}
        transparent
        animationType="none"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: timeOverlayOpacity }] }>
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
                  setFormData(prev => ({ ...prev, birthTime: normalizeTime(tempTime) }));
                  closeTimeSheet();
                }}>
                <Text style={styles.pickerDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                key={timePickerKey}
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
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
    </ScrollView>
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
    marginBottom: 40,
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    flex: 1,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // dim instantly
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  pickerModal: {
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 0, // Remove white space at bottom
    marginBottom: 0,
    minHeight: 340, // +30pt taller again
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
    color: '#FF9F0A', // iOS orange
    fontSize: 17,
    fontWeight: '600',
  },
  pickerDoneButton: {
    color: '#0A84FF', // iOS blue
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
    height: 290, // taller wheels for the new sheet height
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
});
