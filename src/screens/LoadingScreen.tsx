import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, TouchableOpacity, Text } from 'react-native';
const LottieView = require('lottie-react-native').default;
import { AppColors } from '../theme/appTheme';
import Stars from './onboarding/components/Stars';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  onComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  onComplete
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Initial fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      {/* Background Stars */}
      <Stars count={60} />
      
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Lottie Animation */}
        <View style={styles.animationContainer}>
          <LottieView
            source={{ uri: 'https://lottie.host/dc6b3c3e-6723-4276-a9e5-367412c24c42/cP4jvvVngh.lottie' }}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </View>

      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: 300,
    height: 300,
  },
});

export default LoadingScreen;
