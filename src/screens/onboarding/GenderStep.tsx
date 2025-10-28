import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CosmicBackground from './components/CosmicBackground';
import type { StepScreenProps, GenderOption } from './types';
import { AppColors, Typography } from '../../theme/appTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function GenderStep({ data, update, next, back }: StepScreenProps) {
  const [selectedGender, setSelectedGender] = useState<GenderOption>(data.gender);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenderSelect = (gender: GenderOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGender(gender);
  };

  const onContinue = () => {
    if (!selectedGender || selectedGender === '') {
      return;
    }
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    update({ gender: selectedGender });
    setTimeout(() => {
      setIsLoading(false);
      next();
    }, 300);
  };

  return (
    <CosmicBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backCircle} onPress={back} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={22} color={AppColors.onSurface} />
            </TouchableOpacity>
            <View style={styles.stepContainer}>
              <Text style={styles.stepText}>Step 2 of 5</Text>
              {/* Progress */}
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[AppColors.secondary, AppColors.secondaryVariant]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.progressFill, { width: '40%' }]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.centerBlock}>
          <Text style={styles.title}>WHAT'S YOUR{"\n"}GENDER?</Text>
          <Text style={styles.subtitle}>This helps us personalize your cosmic experience</Text>

          {/* Gender Selection Buttons */}
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                selectedGender === 'male' && styles.genderButtonSelected,
              ]}
              onPress={() => handleGenderSelect('male')}
              activeOpacity={0.8}
            >
              <View style={styles.genderIconContainer}>
                <Ionicons
                  name="male"
                  size={48}
                  color={selectedGender === 'male' ? AppColors.secondary : AppColors.onSurfaceVariant}
                />
              </View>
              <Text style={[
                styles.genderLabel,
                selectedGender === 'male' && styles.genderLabelSelected,
              ]}>
                Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                selectedGender === 'female' && styles.genderButtonSelected,
              ]}
              onPress={() => handleGenderSelect('female')}
              activeOpacity={0.8}
            >
              <View style={styles.genderIconContainer}>
                <Ionicons
                  name="female"
                  size={48}
                  color={selectedGender === 'female' ? AppColors.secondary : AppColors.onSurfaceVariant}
                />
              </View>
              <Text style={[
                styles.genderLabel,
                selectedGender === 'female' && styles.genderLabelSelected,
              ]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedGender || selectedGender === '' || isLoading) && styles.continueBtnDisabled,
            ]}
            onPress={onContinue}
            disabled={!selectedGender || selectedGender === '' || isLoading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[AppColors.secondary, AppColors.secondaryVariant]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>
                {isLoading ? '...' : 'Continue'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 80 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepContainer: { marginLeft: 0, width: 120 },
  stepText: { ...Typography.body, color: AppColors.onSurfaceVariant, marginBottom: 4 },
  progressBar: { 
    width: '100%', 
    height: 8, 
    backgroundColor: 'rgba(107,76,122,0.3)', 
    borderRadius: 8, 
    overflow: 'hidden', 
    marginTop: 4,
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 8, 
    shadowColor: AppColors.secondary, 
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    shadowOffset: { width: 0, height: 1 },
  },
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { 
    textAlign: 'center', 
    color: AppColors.onSurface, 
    fontSize: 32, 
    fontWeight: '700', 
    letterSpacing: 0.5, 
    marginTop: -340, 
    marginBottom: 12, 
    textTransform: 'uppercase', 
    fontFamily: 'Cinzel_700Bold',
  },
  subtitle: { 
    textAlign: 'center', 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 16, 
    lineHeight: 22, 
    marginBottom: 36, 
    paddingHorizontal: 32,
  },
  genderContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 15,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderButtonSelected: {
    borderColor: AppColors.secondary,
    backgroundColor: `${AppColors.secondary}15`,
  },
  genderIconContainer: {
    marginBottom: 12,
  },
  genderLabel: {
    ...Typography.body,
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.onSurfaceVariant,
  },
  genderLabelSelected: {
    color: AppColors.secondary,
  },
  buttonContainer: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    bottom: 14, 
    paddingBottom: 34, 
    paddingTop: 20, 
    paddingHorizontal: 20,
  },
  continueButton: { borderRadius: 15, marginBottom: 16, overflow: 'hidden' },
  continueButtonGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  continueBtnDisabled: { opacity: 0.5 },
  continueButtonText: { color: AppColors.onSurface, fontSize: 18, fontWeight: '600' },
});

