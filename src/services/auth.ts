import { supabase } from './supabase';
import * as Linking from 'expo-linking';
import { openAuthSessionAsync, openBrowserAsync, dismissBrowser } from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';

// Keep a process-wide set of processed OAuth authorization codes
const processedOAuthCodes = new Set<string>();
import * as AppleAuthentication from 'expo-apple-authentication';


export class AuthService {
    static async signInWithApple() {
        try {
          console.log('Using native Apple Sign In');
          
          // Always use native Apple Sign In for better reliability
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
    
          console.log('Apple credential received:', {
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
            console.error('Supabase Apple sign in error:', error);
            
            // Handle specific audience error for Expo development
            if (error.message?.includes('Unacceptable audience')) {
              throw new Error(`Apple Sign In configuration error: ${error.message}\n\nTo fix this:\n1. Go to Supabase Dashboard → Authentication → Providers → Apple\n2. In the "Apple Service ID" field, add: host.exp.Exponent\n3. Or use your production bundle ID: VengeanceIntelligence.Cosmo\n4. Save the configuration and try again.`);
            }
            
            throw error;
          }
    
          console.log('Apple sign in successful:', data.user?.email);
          return data;
        } catch (error: any) {
          if (error.code === 'ERR_REQUEST_CANCELED') {
            console.log('Apple Sign In was cancelled by user');
            throw new Error('Sign in was cancelled');
          }
          console.error('Apple Sign In error:', error);
          throw error;
        }
      }

  static async signInWithGoogle() {
    try {
      console.log('🔄 Starting Google OAuth (openAuthSessionAsync) for Expo Go...');

      // Use the canonical Expo Go return URL that our handler understands
      const returnUrl = Linking.createURL('/--/auth/callback');
      console.log('📍 Return URL:', returnUrl);

      // Kick off OAuth with Supabase using the same return URL
      const { data, error } = await supabase.auth.signInWithOAuth({
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

      if (error) throw error;
      if (!data?.url) throw new Error('No OAuth URL received from Supabase');

      console.log('🌐 Opening OAuth auth session...');
      const result = await openAuthSessionAsync(data.url, returnUrl);
      console.log('🔍 Auth session result:', result);

      if (result.type === 'success' && result.url) {
        // Parse code from the returned URL and exchange immediately
        const urlObj = new URL(result.url);
        const code = urlObj.searchParams.get('code');
        const err = urlObj.searchParams.get('error');

        if (err) throw new Error(`OAuth error: ${err}`);
        if (!code) throw new Error('No authorization code found in callback URL');

        console.log('🔑 Exchanging authorization code for session...');
        const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;

        console.log('🎉 Google OAuth completed:', sessionData.user?.email);
        return { user: sessionData.user, session: sessionData.session };
      }

      if (result.type === 'cancel') throw new Error('OAuth cancelled by user');

      // As a fallback, check for a session in case auth state changed
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) return { user: session.user, session };

      throw new Error(`OAuth failed: ${result.type}`);
    } catch (error: any) {
      console.error('💥 Google OAuth error:', error);
      throw error;
    }
  }

  static async handleAuthCallback(url: string) {
    try {
      console.log('Processing auth callback with URL:', url);
      
      // Extract parameters from the URL
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const codeVerifier = await SecureStore.getItemAsync('supabase.code_verifier');
      const error = urlObj.searchParams.get('error');
      const errorDescription = urlObj.searchParams.get('error_description');
      
      // Check for OAuth errors first
      if (error) {
        console.error('OAuth error received:', error, errorDescription);
        throw new Error(`OAuth error: ${error} - ${errorDescription || 'Unknown error'}`);
      }
      
      if (!code) {
        throw new Error('No authorization code found in callback URL');
      }
      
      console.log('Processing auth callback with code:', code.substring(0, 8) + '...');

      // Global de-dupe: don't exchange the same code twice
      if (processedOAuthCodes.has(code)) {
        console.log('Auth code already processed, skipping exchange.');
        return { user: supabase.auth.getUser() } as any;
      }
      processedOAuthCodes.add(code);
      
      // Close the browser immediately when callback is received
      try {
        await dismissBrowser();
        console.log('Browser dismissed');
      } catch (e) {
        console.log('Could not dismiss browser:', e);
      }
      
      // Exchange the code for a session using Supabase's exchangeCodeForSession
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Token exchange error:', exchangeError);
        throw exchangeError;
      }
      
      console.log('Token exchange successful, user:', data.user?.email);
      return data;
    } catch (error: any) {
      console.error('Handle auth callback error:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      console.log('Sign out successful');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
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
        console.error('Profile upsert error:', error);
        
        // If it's an RLS policy error, provide helpful message
        if (error.message?.includes('row-level security policy')) {
          throw new Error(`Profile creation blocked by security policy. Please check your Supabase RLS settings for the user_profiles table. Error: ${error.message}`);
        }
        
        throw error;
      }
      
      console.log('Profile upsert successful:', data?.[0]?.id);
      return data?.[0] ?? null;
    } catch (error: any) {
      console.error('Profile upsert failed:', error);
      throw error;
    }
  }

  static async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found in hasCompletedOnboarding');
        return false;
      }

      console.log('Checking onboarding for user:', user.id);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, birth_date, birth_place')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('Error fetching user profile:', error.message);
        return false;
      }

      if (!data) {
        console.log('No user profile found');
        return false;
      }

      console.log('User profile data:', data);
      // Check if required fields are filled
      const isComplete = !!(data.full_name && data.birth_date && data.birth_place);
      console.log('Onboarding complete:', isComplete);
      return isComplete;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
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
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  static onAuthChanged(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'no user');
      
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
}