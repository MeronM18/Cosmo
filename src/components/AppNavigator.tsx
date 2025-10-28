import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import LandingScreen from '../screens/LandingScreen';
import LoginSignupScreen from '../screens/LoginSignupScreen';
import SplashScreen from '../screens/SplashScreen';
import LoadingScreen from '../screens/LoadingScreen';
import PaywallScreen from '../screens/PaywallScreen';
import { AuthService } from '../services/auth';
import { SupabaseService } from '../services/supabase';
import { supabase } from '../services/supabase';
import type { OnboardingData } from '../screens/onboarding/types';
import { UserProvider, useUser } from '../contexts/UserContext';

type AppState = 'splash' | 'landing' | 'onboarding' | 'login' | 'loading' | 'paywall' | 'authenticated';

// Inner component that has access to UserContext
function AppNavigatorInner() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [temporaryOnboardingData, setTemporaryOnboardingData] = useState<OnboardingData | null>(null);
  const [loadingFromOnboarding, setLoadingFromOnboarding] = useState<boolean>(false);
  const [onboardingStartStep, setOnboardingStartStep] = useState<number>(1);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [cameFromOnboarding, setCameFromOnboarding] = useState<boolean>(false);
  const [isCheckingUserStatus, setIsCheckingUserStatus] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Get user data from UserContext
  const { user, isLoading: userLoading } = useUser();

  // Check user status immediately when component mounts
  // This will determine the correct screen to show after splash
  useEffect(() => {
    let isMounted = true;
    
    const initializeApp = async () => {
      try {
        await checkUserStatus();
      } catch (error) {
        console.log('Error during app initialization:', error);
      }
    };
    
    if (isMounted) {
      initializeApp();
    }
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'no user');
      if (isMounted) {
        // Re-check user status when auth state changes
        checkUserStatus();
      }
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Update authentication state when user data changes
  useEffect(() => {
    if (user) {
      console.log('User data updated - isPremium:', user.isPremium, 'hasCompleteProfile:', user.hasCompleteProfile);
      setIsPremium(user.isPremium);
      setHasCompletedOnboarding(user.hasCompleteProfile);
    }
  }, [user]);

  const checkUserStatus = async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingUserStatus) {
      return;
    }
    
    setIsCheckingUserStatus(true);
    
    try {
      // First, try to get the current session from Supabase directly
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log('Session error:', sessionError.message);
        setIsAuthenticated(false);
        setIsPremium(false);
        setHasCompletedOnboarding(false);
        return;
      }
      
      if (!session?.user) {
        console.log('No active session found');
        setIsAuthenticated(false);
        setIsPremium(false);
        setHasCompletedOnboarding(false);
        return;
      }
      
      console.log('Active session found for user:', session.user.email);
      setIsAuthenticated(true);
      
      // Use UserContext data if available, otherwise check profile
      if (user) {
        console.log('Using UserContext data - isPremium:', user.isPremium, 'hasCompleteProfile:', user.hasCompleteProfile);
        setIsPremium(user.isPremium);
        setHasCompletedOnboarding(user.hasCompleteProfile);
      } else {
        // Fallback: Check if user has completed onboarding (has profile)
        try {
          const hasProfile = await AuthService.hasCompletedOnboarding();
          setHasCompletedOnboarding(hasProfile);
          
          if (hasProfile) {
            // User is authenticated and has profile, fetch full profile to check premium status
            const profile = await AuthService.getCurrentUserProfile();
            const userPremium = profile?.subscription_status === 'premium';
            setIsPremium(userPremium);
            console.log('User premium status from profile:', userPremium);
          }
        } catch (profileError) {
          console.log('Error checking profile:', profileError);
          // If profile check fails, assume no profile
          setHasCompletedOnboarding(false);
          setIsPremium(false);
        }
      }
      
    } catch (error) {
      console.log('Error in checkUserStatus:', error);
      // Handle all errors gracefully - default to unauthenticated state
      setIsAuthenticated(false);
      setIsPremium(false);
      setHasCompletedOnboarding(false);
    } finally {
      setIsCheckingUserStatus(false);
    }
  };

  const handleSplashComplete = () => {
    // Create a smooth transition with a brief fade
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Navigate to the correct screen after fade
      if (isAuthenticated && !hasCompletedOnboarding) {
        setAppState('onboarding');
      } else if (isAuthenticated && hasCompletedOnboarding && isPremium) {
        setAppState('authenticated');
      } else if (isAuthenticated && hasCompletedOnboarding && !isPremium) {
        setAppState('paywall');
      } else {
        setAppState('landing');
      }
      
      // Fade back in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleGetStarted = () => {
    setOnboardingStartStep(1); // Start from Step 1 for new users
    setAppState('onboarding');
  };

  const handleBackToOnboardingStep4 = () => {
    setOnboardingStartStep(5); // Start from Step 5 when coming back from login
    setAppState('onboarding');
  };

  const handleLogin = () => {
    setCameFromOnboarding(false); // Coming from landing page, not onboarding
    setAppState('login');
  };

  const handleBackToLanding = () => {
    setAppState('landing');
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    // Store onboarding data ONLY in memory (temporary)
    // Rule 1: Never save without account
    setTemporaryOnboardingData(data);
    
    // Show loading screen for 3 seconds, then go to login
    setLoadingFromOnboarding(true);
    setCameFromOnboarding(true); // Track that we came from onboarding
    setAppState('loading');
    
    setTimeout(() => {
      setLoadingFromOnboarding(false);
      setAppState('login');
    }, 3000);
  };

  const handleLoginSuccess = async () => {
    // Show loading screen while saving data
    setAppState('loading');
    
    try {
      // Rule 2: Save only after login success
      if (temporaryOnboardingData) {
        // Save onboarding data to Supabase
        const success = await AuthService.saveOnboardingData(temporaryOnboardingData);
        
        if (success) {
          setTemporaryOnboardingData(null); // Clear temporary data after saving
        }
      }
      
      // Check premium status after saving data
      // TODO: Check if user is premium
      // For now, assume user is not premium
      setIsAuthenticated(true);
      setIsPremium(false);
      setAppState('paywall');
    } catch (error) {
      // Handle error appropriately
      setAppState('paywall'); // Fallback to paywall
    }
  };

  const handlePaywallComplete = () => {
    setIsPremium(true);
    setAppState('authenticated');
  };

  const handleAccountDeleted = () => {
    // Reset all authentication state
    setIsAuthenticated(false);
    setIsPremium(false);
    setTemporaryOnboardingData(null);
    // Navigate to landing page
    setAppState('landing');
  };

  // Handle app state changes (app going to background, etc.)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // If user exits app before creating account, clear temporary data
        if (appState === 'login' && temporaryOnboardingData) {
          setTemporaryOnboardingData(null);
        }
      }
    };

    // TODO: Add AppState listener
    // AppState.addEventListener('change', handleAppStateChange);
    
    // return () => {
    //   AppState.removeEventListener('change', handleAppStateChange);
    // };
  }, [appState, temporaryOnboardingData]);

  const renderCurrentScreen = () => {
    // Only log state changes, not every render
    // console.log('AppNavigator: Current appState is:', appState);
    switch (appState) {
      case 'splash':
        return (
          <SplashScreen 
            onFinish={handleSplashComplete}
            autoTransition={true}
          />
        );
      case 'landing':
        return (
          <LandingScreen 
            onGetStarted={handleGetStarted}
            onLogin={handleLogin}
          />
        );
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} onBackToLanding={handleBackToLanding} startStep={onboardingStartStep} initialData={temporaryOnboardingData} />;
      
      case 'login':
        return (
          <LoginSignupScreen 
            onBack={cameFromOnboarding ? handleBackToOnboardingStep4 : handleBackToLanding}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      
      case 'loading':
        return (
          <LoadingScreen 
            message={loadingFromOnboarding ? "Preparing your cosmic journey..." : "Creating your cosmic profile..."} 
            onComplete={loadingFromOnboarding ? undefined : handlePaywallComplete}
          />
        );
      
      case 'paywall':
        return (
          <PaywallScreen 
            onStartTrial={handlePaywallComplete}
          />
        );
      
      case 'authenticated':
        return (
          <HomeScreen onAccountDeleted={handleAccountDeleted} onLogout={handleAccountDeleted} />
        );
      
      default:
        return (
          <SplashScreen 
            onFinish={handleSplashComplete}
            autoTransition={true}
          />
        );
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {renderCurrentScreen()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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

// Main AppNavigator component that provides UserContext
export default function AppNavigator() {
  return (
    <UserProvider>
      <AppNavigatorInner />
    </UserProvider>
  );
}