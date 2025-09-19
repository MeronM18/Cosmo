import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppColors } from '../../../theme/appTheme';
import Stars from './Stars';
import { LinearGradient } from 'expo-linear-gradient';

interface CosmicBackgroundProps {
  children?: React.ReactNode;
}

export default function CosmicBackground({ children }: CosmicBackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${AppColors.primaryVariant}CC`, AppColors.background, AppColors.overlay]}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={StyleSheet.absoluteFill}
      />
      <Stars count={100} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
});


