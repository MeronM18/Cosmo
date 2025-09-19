import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CosmicBackground from './components/CosmicBackground';
import type { StepScreenProps } from './types';
import { AppColors, Typography } from '../../theme/appTheme';

interface CompleteStepProps extends StepScreenProps {
  onFinish: () => void;
}

export default function CompleteStep({ onFinish, back }: CompleteStepProps) {
  return (
    <CosmicBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Journey Complete</Text>
        <Text style={styles.subtitle}>Your cosmic profile is ready.</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={back}>
            <Text style={styles.secondaryText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={onFinish}>
            <Text style={styles.primaryText}>Explore Chart</Text>
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
  row: { flexDirection: 'row', gap: 12, marginTop: 24 },
  secondaryBtn: { flex: 1, borderColor: AppColors.secondary, borderWidth: 1.5, borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  secondaryText: { color: AppColors.secondary, fontWeight: '600' },
  primaryBtn: { flex: 2, backgroundColor: AppColors.secondary, borderRadius: 12, alignItems: 'center', paddingVertical: 14 },
  primaryText: { color: AppColors.onSecondary, fontWeight: '700' },
});


