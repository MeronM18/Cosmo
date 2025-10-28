import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/auth';

const { width, height } = Dimensions.get('window');

interface LoginSignupScreenProps {
  onBack?: () => void;
  onLoginSuccess?: () => void;
}

const LoginSignupScreen: React.FC<LoginSignupScreenProps> = ({ onBack, onLoginSuccess }) => {
  const [fontsLoaded] = useFonts({ Cinzel_700Bold, Cinzel_400Regular });
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Button animation
    setTimeout(() => {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 300);
  }, []);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    
    try {
      console.log(isSignUpMode ? 'Google sign-up attempt' : 'Google sign-in attempt');
      const result = await AuthService.signInWithGoogle();
      
      if (result?.user) {
        console.log('🎉 Google authentication successful:', result.user.email);
        onLoginSuccess?.();
      }
    } catch (error: any) {
      console.error('💥 Google authentication error:', error);
      // Only show alert if it's not a user cancellation
      if (!error.message?.includes('cancelled') && !error.message?.includes('OAuth cancelled by user')) {
        Alert.alert(
          'Authentication Error',
          error.message || 'Failed to sign in with Google. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (isAppleLoading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAppleLoading(true);
    
    // Animate loader in
    Animated.timing(loaderOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    try {
      console.log(isSignUpMode ? 'Apple sign-up attempt' : 'Apple sign-in attempt');
      const result = await AuthService.signInWithApple();
      
      if (result?.user) {
        console.log('🎉 Apple authentication successful:', result.user.email);
        onLoginSuccess?.();
      }
    } catch (error: any) {
      console.error('💥 Apple authentication error:', error);
      // Only show alert if it's not a user cancellation
      if (!error.message?.includes('cancelled') && !error.message?.includes('Sign in was cancelled')) {
        Alert.alert(
          'Authentication Error',
          error.message || 'Failed to sign in with Apple. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      // Animate loader out
      Animated.timing(loaderOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsAppleLoading(false);
      });
    }
  };

  const toggleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSignUpMode(!isSignUpMode);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background */}
      <LinearGradient
        colors={['#0B0B2F', '#1A0B3A', '#2D1B69']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Back Button */}
      <Animated.View 
        style={[
          styles.backButtonContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Main Card */}
      <Animated.View 
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.brandName, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
              Cosmo
            </Text>
            <Text style={[styles.subtitle, fontsLoaded && { fontFamily: 'System' }]}>
              {isSignUpMode ? 'Sign Up to continue' : 'Sign In to continue'}
            </Text>
          </View>

          {/* Sign In Buttons */}
          <Animated.View 
            style={[
              styles.buttonContainer,
              { opacity: buttonOpacity }
            ]}
          >
            {/* Apple Sign In */}
            <TouchableOpacity 
              style={[styles.appleButton, isAppleLoading && styles.buttonDisabled]} 
              onPress={handleAppleSignIn}
              disabled={isAppleLoading}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text style={[styles.appleButtonText, fontsLoaded && { fontFamily: 'System' }]}>
                  {isSignUpMode ? 'Sign up with Apple' : 'Continue with Apple'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Google Sign In */}
            <TouchableOpacity 
              style={[styles.googleButton, isLoading && styles.buttonDisabled]} 
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="logo-google" size={20} color="#4285F4" />
                <Text style={[styles.googleButtonText, fontsLoaded && { fontFamily: 'System' }]}>
                  {isLoading ? (isSignUpMode ? 'Signing up...' : 'Signing in...') : (isSignUpMode ? 'Sign up with Google' : 'Continue with Google')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={[styles.dividerText, fontsLoaded && { fontFamily: 'System' }]}>
                or
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Bottom Link */}
            <View style={styles.bottomLink}>
              <TouchableOpacity onPress={toggleMode}>
                <Text style={[styles.bottomText, fontsLoaded && { fontFamily: 'System' }]}>
                  {isSignUpMode ? "Have an account? " : "Don't have an account? "}
                  <Text style={styles.registerLink}>
                    {isSignUpMode ? 'Log in' : 'Register'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Apple Sign In Loader Overlay */}
      {isAppleLoading && (
        <Animated.View style={[styles.loaderOverlay, { opacity: loaderOpacity }]}>
          <LinearGradient
            colors={['rgba(11, 11, 47, 0.95)', 'rgba(26, 11, 58, 0.95)', 'rgba(45, 27, 105, 0.95)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color="#8B7FE8" />
            <Text style={[styles.loaderText, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
              {isSignUpMode ? 'Creating your account...' : 'Signing you in...'}
            </Text>
          </View>
        </Animated.View>
      )}

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
    position: 'relative',
  },
  logoLayer: {
    position: 'absolute',
    width: 32,
    height: 8,
    borderRadius: 4,
  },
  logoLayerTop: {
    backgroundColor: '#8B7FE8',
    top: 0,
  },
  logoLayerMiddle: {
    backgroundColor: '#A595F0',
    top: 12,
  },
  logoLayerBottom: {
    backgroundColor: '#8B7FE8',
    top: 24,
  },
  brandName: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#B8A9C9',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 12,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '700',
    marginLeft: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#B8A9C9',
  },
  dividerText: {
    fontSize: 14,
    color: '#B8A9C9',
    marginHorizontal: 16,
  },
  bottomLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  bottomText: {
    fontSize: 14,
    color: '#B8A9C9',
    textAlign: 'center',
  },
  registerLink: {
    color: '#8B7FE8',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loaderText: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  loaderSubtext: {
    fontSize: 16,
    color: '#B8A9C9',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default LoginSignupScreen;
