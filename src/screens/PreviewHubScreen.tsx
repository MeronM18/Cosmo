import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LandingScreen from './LandingScreen';
import SplashScreen from './SplashScreen';
import OnboardingScreen from './OnboardingScreen';
import PaywallScreen from './PaywallScreen';
import LoadingScreen from './LoadingScreen';
import HomeScreen from './HomeScreen';
import LoginSignupScreen from './LoginSignupScreen';

interface PreviewHubScreenProps {
  onClose?: () => void;
}

type Mode = 'menu' | 'landing' | 'splash' | 'onboarding' | 'paywall' | 'loading' | 'home' | 'login';

export default function PreviewHubScreen({ onClose }: PreviewHubScreenProps) {
  const [mode, setMode] = useState<Mode>('menu');

  if (mode === 'landing') {
    return (
      <View style={{ flex: 1 }}>
        <LandingScreen />
      </View>
    );
  }

  if (mode === 'splash') {
    return (
      <View style={{ flex: 1 }}>
        <SplashScreen autoTransition={false} />
      </View>
    );
  }

  if (mode === 'onboarding') {
    return (
      <View style={{ flex: 1 }}>
        <OnboardingScreen onComplete={() => setMode('menu')} />
      </View>
    );
  }

  if (mode === 'paywall') {
    return (
      <View style={{ flex: 1 }}>
        <PaywallScreen />
      </View>
    );
  }

  if (mode === 'loading') {
    return (
      <View style={{ flex: 1 }}>
        <LoadingScreen 
          message="Loading your cosmic journey..." 
          onComplete={() => setMode('menu')}
        />
      </View>
    );
  }

  if (mode === 'home') {
    return (
      <View style={{ flex: 1 }}>
        <HomeScreen 
          onClose={() => setMode('menu')} 
          onLogout={() => {
            // Logout and return to preview hub menu
            setMode('menu');
          }}
        />
      </View>
    );
  }

  if (mode === 'login') {
    return (
      <View style={{ flex: 1 }}>
        <LoginSignupScreen 
          onBack={() => setMode('menu')}
          onLoginSuccess={() => setMode('menu')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.topClose} onPress={onClose} activeOpacity={0.7}>
        <Text style={styles.topCloseText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Screen Preview Hub</Text>
      <Text style={styles.subtitle}>Open any screen in full-screen preview</Text>

      <View style={styles.buttonStack}>
        <TouchableOpacity style={styles.button} onPress={() => setMode('splash')}>
          <Text style={styles.buttonText}>Splash</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setMode('landing')}>
          <Text style={styles.buttonText}>Landing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setMode('login')}>
          <Text style={styles.buttonText}>Sign In/Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setMode('onboarding')}>
          <Text style={styles.buttonText}>Onboarding</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setMode('paywall')}>
          <Text style={styles.buttonText}>Paywall</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setMode('home')}>
          <Text style={styles.buttonText}>Homepage</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setMode('loading')}>
          <Text style={styles.buttonText}>Loading</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#a5b4fc',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  buttonStack: {
    marginTop: 20,
    gap: 12,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 104,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  topClose: {
    position: 'absolute',
    top: 70,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  topCloseText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});


