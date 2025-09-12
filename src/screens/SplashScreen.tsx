import React, { useEffect, useState, useRef } from 'react';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ImageBackground,
  StatusBar,
} from 'react-native';
import * as Haptics from 'expo-haptics'; // Make sure to install expo-haptics

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
  autoTransition?: boolean;
}

export default function SplashScreen({ onFinish, autoTransition }: SplashScreenProps) {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'COSMO';
  const timeoutsRef = useRef<number[]>([]);

  const INITIAL_DELAY_MS = 500;
  const LETTER_DELAY_MS = 140;

  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    StatusBar.setHidden(true, 'fade');

    const scheduleTyping = () => {
      for (let i = 0; i < fullText.length; i++) {
        const timeoutId = setTimeout(() => {
          setDisplayedText(fullText.slice(0, i + 1));
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

          if (i === fullText.length - 1) {
            if (autoTransition && onFinish) {
              const afterDoneId = setTimeout(() => {
                StatusBar.setHidden(false, 'fade');
                onFinish();
              }, 1000);
              timeoutsRef.current.push(afterDoneId as unknown as number);
            }
          }
        }, i * LETTER_DELAY_MS) as unknown as number;
        timeoutsRef.current.push(timeoutId);
      }
    };

    const initialDelayId = setTimeout(scheduleTyping, INITIAL_DELAY_MS) as unknown as number;
    timeoutsRef.current.push(initialDelayId);

    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
      StatusBar.setHidden(false, 'fade');
    };
  }, [fontsLoaded]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/starry-clouds.png')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* App Title */}
        <View style={styles.textContainer}>
          <Text style={[
            styles.appName,
            fontsLoaded && { fontFamily: 'Cinzel_700Bold' },
          ]}
          >
            {displayedText}
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  background: { 
    flex: 1, 
    width: '100%', 
    height: '100%' 
  },
  textContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -80 }], // Shift 30pts higher than before
  },
  appName: {
    fontSize: 56,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 3,
  },
});