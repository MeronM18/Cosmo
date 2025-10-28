import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../utils/constants';
import { UserProfile } from '../types';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(Config.supabaseUrl, Config.supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    storage: ExpoSecureStoreAdapter,
    storageKey: 'cosmo-auth',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // We handle OAuth callbacks manually in App.tsx
  },
  global: {
    // Use React Native's polyfilled fetch explicitly
    fetch: (...args) => fetch(...args),
    headers: {
      'X-Client-Info': 'cosmo-app',
    },
  },
});

export class SupabaseService {
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      return false;
    }
  }

  static async checkNetworkConnectivity(): Promise<boolean> {
    try {
      // Create a timeout promise with longer timeout for better reliability
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Network timeout')), 10000); // Increased to 10 seconds
      });
      
      // Create the fetch promise with better error handling
      const fetchPromise = fetch('https://httpbin.org/status/200', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      return response.ok;
    } catch (error) {
      // Silently fail network checks - don't block the app
      return false;
    }
  }

  static async generateHoroscope(zodiacSign: string, isPremium: boolean) {
    const { data, error } = await supabase.functions.invoke('generate-horoscope', {
      body: {
        zodiacSign,
        birthDate: new Date().toISOString(),
        isPremium
      }
    });
    
    if (error) throw error;
    return data;
  }

  static async createUserProfile(profile: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile);
    
    if (error) throw error;
    return data;
  }
}