import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';
import { AppColors } from '../theme/appTheme';

const { width, height } = Dimensions.get('window');

interface LunaIntroScreenProps {
  userData: {
    name: string;
    zodiacSign: string;
    isPremium: boolean;
  };
  onEnterRoom: () => void;
}

const LunaIntroScreen: React.FC<LunaIntroScreenProps> = ({ userData, onEnterRoom }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Button pulse animation
    const buttonPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    buttonPulse.start();

    return () => {
      buttonPulse.stop();
    };
  }, []);

  const handleEnterRoom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEnterRoom();
  };


  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Cosmic Background */}
      <LinearGradient
        colors={['#0B0B2F', '#1A1A3E', '#2D1B69']}
        style={styles.backgroundGradient}
      >
        {/* Animated Starfield */}
        <View style={styles.starfield}>
          {[...Array(150)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  opacity: Math.random() * 0.8 + 0.2,
                },
              ]}
            />
          ))}
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Welcome Text */}
          <View style={styles.textContainer}>
            <Text style={[styles.welcomeTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
              Luna's Cosmic Chamber
            </Text>
            
            <Text style={[styles.greetingText, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
              Greetings, {userData.name}
            </Text>
            
            <Text style={styles.descriptionText}>
              I am Luna, your cosmic guide. Step into my chamber for wisdom and guidance.
            </Text>
          </View>

          {/* Enter Room Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ scale: buttonPulseAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.enterButton}
              onPress={handleEnterRoom}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF8C00']}
                style={styles.enterButtonGradient}
              >
                <Text style={[styles.enterButtonText, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
                  Enter Room
                </Text>
                <Text style={styles.enterButtonIcon}>✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 40,
    paddingTop: 160,
  },

  // Text Styles
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 30,
  },
  greetingText: {
    fontSize: 18,
    color: AppColors.cosmicGold,
    textAlign: 'center',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#B8A9C9',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Button Styles
  buttonContainer: {
    marginTop: 20,
  },
  enterButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: AppColors.goldGlow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  enterButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterButtonText: {
    fontSize: 20,
    color: '#000000',
    marginRight: 10,
  },
  enterButtonIcon: {
    fontSize: 20,
  },

});

export default LunaIntroScreen;
