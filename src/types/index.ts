import { ZodiacSigns } from "../utils/constants";

export interface UserProfile {
    id: string;
    email: string;
    fullName?: string;
    full_name?: string; // Database column name
    birthDate: string;
    birth_date?: string; // Database column name
    birthTime?: string;
    birth_time?: string; // Database column name
    birthPlace: string;
    birth_place?: string; // Database column name
    timezone: string;
    gender?: 'male' | 'female';
    subscriptionStatus: 'free' | 'premium';
    subscription_status?: 'free' | 'premium'; // Database column name
    createdAt: string;
    created_at?: string; // Database column name
    updatedAt: string;
    updated_at?: string; // Database column name
  }
  
  export interface Reading {
    id: string;
    userId: string;
    readingType: 'daily' | 'weekly' | 'monthly';
    content: string;
    aiModelUsed: string;
    createdAt: string;
    expiresAt?: string;
  }
  
  export type ZodiacSign = typeof ZodiacSigns[number];