import { supabase } from './supabase';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
const { openAuthSessionAsync, openBrowserAsync, dismissBrowser } = require('expo-web-browser');
const SecureStore = require('expo-secure-store');
import * as AuthSession from 'expo-auth-session';
import { logger } from '../utils/logger';

// Keep a process-wide set of processed OAuth authorization codes
const processedOAuthCodes = new Set<string>();
const AppleAuthentication = require('expo-apple-authentication');


export class AuthService {
    static async signInWithApple() {
        try {
          logger.log('Using native Apple Sign In');
          
          // Always use native Apple Sign In for better reliability
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
    
          logger.log('Apple credential received:', {
            user: credential.user,
            email: credential.email,
            fullName: credential.fullName,
          });
    
          if (!credential.identityToken) {
            throw new Error('No identity token received from Apple');
          }
    
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
          });
    
          if (error) {
            logger.error('Supabase Apple sign in error:', error);
            
            // Handle specific audience error for Expo development
            if (error.message?.includes('Unacceptable audience')) {
              throw new Error(`Apple Sign In configuration error: ${error.message}\n\nTo fix this:\n1. Go to Supabase Dashboard → Authentication → Providers → Apple\n2. In the "Apple Service ID" field, add: host.exp.Exponent\n3. Or use your production bundle ID: VengeanceIntelligence.Cosmo\n4. Save the configuration and try again.`);
            }
            
            throw error;
          }
    
          logger.log('Apple sign in successful:', data.user?.email);
          return data;
        } catch (error: any) {
          if (error.code === 'ERR_REQUEST_CANCELED') {
            logger.log('Apple Sign In was cancelled by user');
            throw new Error('Sign in was cancelled');
          }
          logger.error('Apple Sign In error:', error);
          throw error;
        }
      }

  static async signInWithGoogle() {
    // Use different return URLs for simulator vs real device
    const isSimulator = __DEV__ && Platform.OS === 'ios';
    
    try {
      logger.log('🔄 Starting Google OAuth (openAuthSessionAsync) for Expo Go...');
      let returnUrl, fallbackReturnUrl;
      
      if (isSimulator) {
        // For iOS Simulator, use localhost
        returnUrl = 'exp://localhost:8082/--/auth/callback';
        fallbackReturnUrl = 'exp://127.0.0.1:8082/--/auth/callback';
      } else {
        // For real devices, use the network IP
        returnUrl = Linking.createURL('--/auth/callback');
        fallbackReturnUrl = 'exp://localhost:8082/--/auth/callback';
      }
      
      logger.log('📍 Return URL:', returnUrl);
      logger.log('📍 Fallback Return URL:', fallbackReturnUrl);

      // Kick off OAuth with Supabase using the same return URL
      let { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: returnUrl,
          scopes: 'email profile openid',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      // If the first attempt fails, try with fallback URL
      if (error && error.message?.includes('redirect')) {
        logger.log('🔄 Retrying with fallback return URL...');
        const retryResult = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: fallbackReturnUrl,
            scopes: 'email profile openid',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) throw error;
      if (!data?.url) throw new Error('No OAuth URL received from Supabase');

      logger.log('🌐 Opening OAuth auth session...');
      
      // Add timeout to prevent hanging on OAuth (longer for simulator)
      const timeoutDuration = isSimulator ? 90000 : 45000; // 90s for simulator, 45s for device
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OAuth session timeout')), timeoutDuration);
      });
      
      const authSessionPromise = openAuthSessionAsync(data.url, returnUrl);
      const result = await Promise.race([authSessionPromise, timeoutPromise]);
      logger.log('🔍 Auth session result:', result);

      if (result.type === 'success' && result.url) {
        // Parse code from the returned URL and exchange immediately
        const urlObj = new URL(result.url);
        const code = urlObj.searchParams.get('code');
        const err = urlObj.searchParams.get('error');

        if (err) throw new Error(`OAuth error: ${err}`);
        if (!code) throw new Error('No authorization code found in callback URL');

        logger.log('🔑 Exchanging authorization code for session...');
        const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;

        logger.log('🎉 Google OAuth completed:', sessionData.user?.email);
        return { user: sessionData.user, session: sessionData.session };
      }

      if (result.type === 'cancel') throw new Error('OAuth cancelled by user');

      // As a fallback, check for a session in case auth state changed
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) return { user: session.user, session };

      throw new Error(`OAuth failed: ${result.type}`);
    } catch (error: any) {
      logger.error('💥 Google OAuth error:', error);
      
      // Handle specific network errors
      if (error.message?.includes('Network request failed') || 
          error.message?.includes('network connection was lost') ||
          error.message?.includes('OAuth session timeout')) {
        
        if (isSimulator) {
          throw new Error('OAuth failed in simulator. This is a known issue with iOS Simulator. Please try on a real device or check your Supabase redirect URL configuration.');
        } else {
          throw new Error('Network connection lost during sign-in. Please check your internet connection and try again.');
        }
      }
      
      throw error;
    }
  }

  static async handleAuthCallback(url: string) {
    try {
      logger.log('Processing auth callback with URL:', url);
      
      // Extract parameters from the URL
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const codeVerifier = await SecureStore.getItemAsync('supabase.code_verifier');
      const error = urlObj.searchParams.get('error');
      const errorDescription = urlObj.searchParams.get('error_description');
      
      // Check for OAuth errors first
      if (error) {
        logger.error('OAuth error received:', error, errorDescription);
        throw new Error(`OAuth error: ${error} - ${errorDescription || 'Unknown error'}`);
      }
      
      if (!code) {
        throw new Error('No authorization code found in callback URL');
      }
      
      logger.log('Processing auth callback with code:', code.substring(0, 8) + '...');

      // Global de-dupe: don't exchange the same code twice
      if (processedOAuthCodes.has(code)) {
        logger.log('Auth code already processed, skipping exchange.');
        return { user: supabase.auth.getUser() } as any;
      }
      processedOAuthCodes.add(code);
      
      // Close the browser immediately when callback is received
      try {
        await dismissBrowser();
        logger.log('Browser dismissed');
      } catch (e) {
        logger.log('Could not dismiss browser:', e);
      }
      
      // Exchange the code for a session using Supabase's exchangeCodeForSession
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        logger.error('Token exchange error:', exchangeError);
        throw exchangeError;
      }
      
      logger.log('Token exchange successful, user:', data.user?.email);
      return data;
    } catch (error: any) {
      logger.error('Handle auth callback error:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Sign out error:', error);
        throw error;
      }
      logger.log('Sign out successful');
    } catch (error: any) {
      logger.error('Sign out error:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        logger.error('Error getting current user:', error);
        return null;
      }
      return user;
    } catch (error) {
      logger.error('Network error getting current user:', error);
      return null;
    }
  }

  static async upsertUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const profile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      birth_date: '1990-01-01',
      birth_place: 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      subscription_status: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profile, { onConflict: 'id' })
        .select();
      
      if (error) {
        logger.error('Profile upsert error:', error);
        
        // If it's an RLS policy error, provide helpful message
        if (error.message?.includes('row-level security policy')) {
          throw new Error(`Profile creation blocked by security policy. Please check your Supabase RLS settings for the user_profiles table. Error: ${error.message}`);
        }
        
        throw error;
      }
      
      logger.log('Profile upsert successful:', data?.[0]?.id);
      return data?.[0] ?? null;
    } catch (error: any) {
      logger.error('Profile upsert failed:', error);
      throw error;
    }
  }

  static async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.log('No user found in hasCompletedOnboarding');
        return false;
      }

      logger.log('Checking onboarding for user:', user.id);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, birth_date, birth_place')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        logger.log('Error fetching user profile:', error.message);
        return false;
      }

      if (!data) {
        logger.log('No user profile found');
        return false;
      }

      logger.log('User profile data:', data);
      // Check if required fields are filled
      const isComplete = !!(data.full_name && data.birth_date && data.birth_place);
      logger.log('Onboarding complete:', isComplete);
      return isComplete;
    } catch (error) {
      logger.error('Network error checking onboarding status:', error);
      // Return false for network errors so user can retry
      return false;
    }
  }

  static async getCurrentUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

      if (error) {
        logger.error('Error fetching user profile:', error);
        return null;
      }

      // Return null if no profile exists (new user who hasn't completed onboarding)
      if (!data) {
        logger.log('No user profile found - user needs to complete onboarding');
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Network error getting user profile:', error);
      return null;
    }
  }

  static onAuthChanged(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      logger.log('Auth state changed:', event, session?.user?.email || 'no user');
      
      // Don't automatically create profile - wait for onboarding completion
      // try {
      //   if (event === 'SIGNED_IN' && session?.user) {
      //     await AuthService.upsertUserProfile();
      //   }
      // } catch (e) {
      //   console.log('Profile upsert error:', (e as any)?.message || e);
      // }
      
      callback(event, session);
    });
  }

  // Mark onboarding as completed (no-op placeholder since profile upsert is authoritative)
  static async setCompletedOnboarding(): Promise<void> {
    // Profile upsert during onboarding is the source of truth.
    // This method exists to satisfy control flow after persistence.
    return;
  }

  static async saveOnboardingData(data: any): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.log('No authenticated user found for saving onboarding data');
        return false;
      }

      logger.log('Saving onboarding data for user:', user.id);
      
      // Convert birthTime Date to TIME format (HH:MM:SS) for PostgreSQL
      let birthTimeFormatted = null;
      if (data.birthTime) {
        const birthTimeDate = new Date(data.birthTime);
        birthTimeFormatted = `${birthTimeDate.getHours().toString().padStart(2, '0')}:${birthTimeDate.getMinutes().toString().padStart(2, '0')}:00`;
      }
      
      // Get user's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: data.fullName,
          birth_date: data.birthDate,
          birth_place: data.birthPlace,
          birth_time: birthTimeFormatted,
          gender: data.gender || null,
          timezone: timezone,
          email: user.email,
          subscription_status: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Error saving onboarding data:', error);
        return false;
      }

      logger.log('Onboarding data saved successfully');
      return true;
    } catch (error) {
      logger.error('Error in saveOnboardingData:', error);
      return false;
    }
  }
}