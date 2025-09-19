import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CosmicBackground from './components/CosmicBackground';
import type { StepScreenProps } from './types';
import { AppColors, Typography } from '../../theme/appTheme';
import Progress from './components/Progress';

export default function WelcomeStep({ next }: StepScreenProps) {
  return (
    <CosmicBackground>
      <View style={styles.container}>
        <Progress current={1} total={5} />
        <Text style={styles.title}>Welcome to Cosmo</Text>
        <Text style={styles.subtitle}>Your personalized astrology journey begins here.</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={next}>
            <Text style={styles.primaryText}>Begin Reading</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  title: { ...Typography.headline, textAlign: 'center', marginTop: 16 },
  subtitle: { ...Typography.body, textAlign: 'center', marginTop: 8 },
  actions: {
    marginTop: 40,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: AppColors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryText: {
    color: AppColors.onSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});


