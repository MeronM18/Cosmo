// Import logger first to disable console logs in production
import './src/utils/logger';

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking';
import { dismissBrowser } from 'expo-web-browser';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/components/AppNavigator';
import { supabase } from './src/services/supabase';
import { useFonts as useCinzel, Cinzel_400Regular, Cinzel_600SemiBold, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { useFonts as useInter, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { logger } from './src/utils/logger';

export default function App() {
  const [cinzelLoaded] = useCinzel({ Cinzel_400Regular, Cinzel_600SemiBold, Cinzel_700Bold });
  const [interLoaded] = useInter({ Inter_400Regular, Inter_500Medium });

  useEffect(() => {
    // Handle deep links when app is already open
    const handleDeepLink = async (url: string) => {
      logger.log('🔗 Deep link received:', url);
      
      // Handle OAuth callback - check for both development build and Expo Go patterns
      if (url.includes('/auth/callback') || url.includes('--/auth/callback')) {
        logger.log('🚀 OAuth callback detected - processing with Supabase');
        try {
          // For Expo Go URLs, we need to handle the URL format differently
          let urlToProcess = url;
          
          // If it's an Expo Go URL (exp://), convert it to a proper URL for parsing
          if (url.startsWith('exp://')) {
            logger.log('📱 Processing Expo Go URL format');
            // Extract the query parameters from the Expo URL
            const parts = url.split('?');
            if (parts.length > 1) {
              urlToProcess = `https://dummy.com?${parts[1]}`;
            } else {
              logger.warn('⚠️ No query parameters found in Expo URL');
              return;
            }
          }
          
          // Extract the authorization code from the URL
          const urlObj = new URL(urlToProcess);
          const code = urlObj.searchParams.get('code');
          const error = urlObj.searchParams.get('error');
          
          if (error) {
            logger.error('❌ OAuth error received:', error);
            return;
          }
          
          if (code) {
            logger.log('🔑 Found authorization code, exchanging for session...');
            
            // Exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              logger.error('💥 Error exchanging code for session:', error);
            } else {
              logger.log('✅ OAuth callback processed successfully:', data.user?.email);
              
              // Close the browser after successful authentication
              try {
                await dismissBrowser();
                logger.log('🔐 Browser dismissed after successful authentication');
              } catch (dismissError) {
                logger.log('⚠️ Could not dismiss browser:', dismissError);
              }
            }
          } else {
            logger.error('🚫 No authorization code found in callback URL');
          }
        } catch (error) {
          logger.error('💥 Error handling OAuth callback:', error);
        }
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Handle deep link when app is opened from closed state
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription?.remove();
  }, []);

  if (!cinzelLoaded || !interLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <AppNavigator />
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});