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
});

export class SupabaseService {
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      console.log('Supabase test:', { data, error });
      return !error;
    } catch (error) {
      console.error('Supabase connection failed:', error);
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