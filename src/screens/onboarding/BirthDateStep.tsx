import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CosmicBackground from './components/CosmicBackground';
import type { StepScreenProps } from './types';
import { AppColors, Typography } from '../../theme/appTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function BirthDateStep({ data, update, next, back }: StepScreenProps) {
  const [tempDate, setTempDate] = useState<Date>(data.birthDate || new Date(1990, 0, 1));
  const [show, setShow] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validate = (date: Date) => {
    const now = new Date();
    const min = new Date(1900, 0, 1);
    if (date > now) return 'Birth date cannot be in the future';
    const thirteenYearsAgo = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
    if (date > thirteenYearsAgo) return 'You must be at least 13 years old';
    if (date < min) return 'Please enter a valid birth date';
    return '';
  };

  const onContinue = () => {
    const v = validate(tempDate);
    if (v) { 
      setError(v); 
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return; 
    }
    setError('');
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    update({ birthDate: tempDate });
    
    setTimeout(() => {
      setIsLoading(false);
      next();
    }, 500);
  };

  return (
    <CosmicBackground>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backCircle} onPress={back} activeOpacity={0.8}>
                <Ionicons name="chevron-back" size={22} color={AppColors.onSurface} />
              </TouchableOpacity>
              <View style={styles.stepContainer}>
                <Text style={styles.stepText}>Step 2 of 4</Text>
                {/* Progress */}
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[AppColors.secondary, AppColors.secondaryVariant]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[styles.progressFill, { width: '50%' }]}
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={back}
              style={styles.closeButton}
              activeOpacity={0.8}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.centerBlock}>
            <Text style={styles.title}>WHEN WERE YOU{"\n"}BORN?</Text>
            <Text style={styles.subtitle}>This helps us read your stars</Text>
            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.pickerCard}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.select({ ios: 'spinner', android: 'calendar' }) as any}
                onChange={(e, d) => { if (d) { setTempDate(d); setError(''); } }}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                themeVariant="dark"
              />
            </View>
          </View>

          {/* Bottom Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.continueButton, isLoading && styles.continueBtnDisabled]}
              onPress={onContinue}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[AppColors.secondary, AppColors.secondaryVariant]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.continueButtonGradient}
              >
                <Text style={styles.continueButtonText}>{isLoading ? '...' : 'Continue'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 75 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepContainer: { marginLeft: 0, width: 120 },
  backCircle: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  stepText: { color: AppColors.textSecondary, fontSize: 16 },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: AppColors.onSurface, fontSize: 16, fontWeight: '700' },
  progressBar: { width: '100%', height: 8, backgroundColor: 'rgba(107,76,122,0.3)', borderRadius: 8, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', borderRadius: 8, shadowColor: AppColors.secondary, shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center', color: AppColors.onSurface, fontSize: 32, fontWeight: '700', letterSpacing: 0.5, marginTop: -200, marginBottom: 12, textTransform: 'uppercase', fontFamily: 'Cinzel_700Bold' },
  subtitle: { textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 22, marginBottom: 36, paddingHorizontal: 32 },
  errorText: { color: AppColors.error, marginTop: 8, alignSelf: 'flex-start' },
  pickerCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', shadowColor: AppColors.secondary, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, marginTop: -10 },
  buttonContainer: { position: 'absolute', left: 0, right: 0, bottom: 14, paddingBottom: 34, paddingTop: 20, paddingHorizontal: 20 },
  continueButton: { borderRadius: 15, marginBottom: 16, overflow: 'hidden' },
  continueButtonGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  continueBtnDisabled: { opacity: 0.5 },
  continueButtonText: { color: AppColors.onSurface, fontSize: 18, fontWeight: '600' },
});


