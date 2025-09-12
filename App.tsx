import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking';
import { dismissBrowser } from 'expo-web-browser';
import AppNavigator from './src/components/AppNavigator';
import { supabase } from './src/services/supabase';

export default function App() {
  useEffect(() => {
    // Handle deep links when app is already open
    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      console.log('URL contains auth callback:', url.includes('/auth/callback'));
      
      // Handle OAuth callback
      if (url.includes('/auth/callback')) {
        console.log('OAuth callback detected - processing with Supabase');
        try {
          // Extract the authorization code from the URL
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get('code');
          
          if (code) {
            console.log('Found authorization code, exchanging for session...');
            
            // Exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('Error exchanging code for session:', error);
            } else {
              console.log('OAuth callback processed successfully:', data.user?.email);
              
              // Close the browser after successful authentication
              try {
                await dismissBrowser();
                console.log('Browser dismissed after successful authentication');
              } catch (dismissError) {
                console.log('Could not dismiss browser:', dismissError);
              }
            }
          } else {
            console.error('No authorization code found in callback URL');
          }
        } catch (error) {
          console.error('Error handling OAuth callback:', error);
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

  return (
    <View style={styles.container}>
      <AppNavigator />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});