import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CosmicBackground from './components/CosmicBackground';
import type { StepScreenProps } from './types';
import { AppColors, Typography } from '../../theme/appTheme';

interface CompleteStepProps extends StepScreenProps {
  onFinish: () => void;
}

export default function CompleteStep({ onFinish, back, data }: CompleteStepProps) {
  const handleCompleteSetup = () => {
    // Validate required data before proceeding
    if (!data.fullName || !data.birthDate || !data.birthPlace) {
      console.log('🔴 CompleteStep: Missing required data, cannot proceed');
      // TODO: Show error message to user
      return;
    }
    
    console.log('🔴 CompleteStep: Complete Setup button clicked');
    console.log('🔴 CompleteStep: Data validated, proceeding to login');
    onFinish();
  };

  return (
    <CosmicBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Journey Complete</Text>
        <Text style={styles.subtitle}>Your cosmic profile is ready.</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleCompleteSetup}>
            <Text style={styles.continueButtonText}>Complete Setup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 80 },
  title: { ...Typography.headline, textAlign: 'center' },
  subtitle: { ...Typography.body, textAlign: 'center', marginTop: 8 },
  buttonContainer: { position: 'absolute', left: 0, right: 0, bottom: 14, paddingBottom: 34, paddingTop: 20, paddingHorizontal: 20 },
  continueButton: { backgroundColor: AppColors.secondary, borderRadius: 15, marginBottom: 16, overflow: 'hidden' },
  continueButtonText: { color: AppColors.onSurface, fontSize: 18, fontWeight: '600', paddingVertical: 18, textAlign: 'center' },
});


