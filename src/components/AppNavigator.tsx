import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthService } from '../services/auth';
import TestScreen from '../screens/TestScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MainAppScreen from '../screens/MainAppScreen';
import AIChatScreen from '../screens/AIChatScreen';
import LandingScreen from '../screens/LandingScreen';
import PreviewHubScreen from '../screens/PreviewHubScreen';

type AppState = 'landing' | 'loading' | 'unauthenticated' | 'onboarding' | 'authenticated' | 'ai-chat' | 'preview-hub';

export default function AppNavigator() {
  const [appState, setAppState] = useState<AppState>('landing');

  useEffect(() => {
    // Prepare auth subscription immediately
    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthChanged(async (event, session) => {
      console.log('Auth state changed in navigator:', event);
      await checkAuthState();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state...');
      
      // Check if user is authenticated
      const user = await AuthService.getCurrentUser();
      console.log('Current user:', user?.email || 'No user');
      
      if (!user) {
        console.log('No user found, setting state to unauthenticated');
        setAppState('unauthenticated');
        return;
      }

      // Check if user has completed onboarding
      console.log('Checking onboarding status...');
      const hasCompletedOnboarding = await AuthService.hasCompletedOnboarding();
      console.log('Has completed onboarding:', hasCompletedOnboarding);
      
      if (hasCompletedOnboarding) {
        console.log('User has completed onboarding, setting state to authenticated');
        setAppState('authenticated');
      } else {
        console.log('User needs onboarding, setting state to onboarding');
        setAppState('onboarding');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setAppState('unauthenticated');
    }
  };

  const handleLandingComplete = async () => {
    setAppState('loading');
    await checkAuthState();
  };

  const renderCurrentScreen = () => {
    switch (appState) {
      case 'landing':
        return <LandingScreen onAnimationComplete={handleLandingComplete} />;
      case 'loading':
        return (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        );
      case 'unauthenticated':
        return (
          <TestScreen 
            onNavigateToChat={() => setAppState('ai-chat')} 
            onOpenPreviewHub={() => setAppState('preview-hub')}
          />
        );
      
      case 'onboarding':
        return <OnboardingScreen onComplete={() => setAppState('authenticated')} />;
      
      case 'authenticated':
        return <MainAppScreen onNavigateToChat={() => setAppState('ai-chat')} />;
      
      case 'ai-chat':
        return <AIChatScreen onGoBack={() => setAppState('authenticated')} />;
      
      case 'preview-hub':
        return <PreviewHubScreen onClose={() => setAppState('unauthenticated')} />;
      
      default:
        return <TestScreen onNavigateToChat={() => setAppState('ai-chat')} />;
    }
  };

  return renderCurrentScreen();
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});