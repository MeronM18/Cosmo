import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppColors } from '../../../theme/appTheme';

interface ProgressProps {
  current: number; // 1-based
  total: number;
}

export default function Progress({ current, total }: ProgressProps) {
  const widthFactor = Math.max(0, Math.min(1, current / total));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${widthFactor * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(107,76,122,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: AppColors.secondary,
  },
});


