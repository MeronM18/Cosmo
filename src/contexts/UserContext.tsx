import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/auth';
import { UserProfile } from '../types';
import { ZodiacSigns } from '../utils/constants';

// Enhanced user interface with calculated fields
export interface PersonalizedUser {
  // Core profile data
  id: string;
  email: string;
  fullName: string;
  birthDate: string;
  birthTime?: string;
  birthPlace: string;
  timezone: string;
  gender?: 'male' | 'female';
  subscriptionStatus: 'free' | 'premium';
  
  // Calculated astrological data
  zodiacSign: string;
  zodiacSymbol: string;
  age: number;
  nextBirthday: Date;
  daysUntilBirthday: number;
  
  // Additional calculated fields
  isPremium: boolean;
  hasBirthTime: boolean;
  hasCompleteProfile: boolean;
}

interface UserContextType {
  user: PersonalizedUser | null;
  isLoading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

// Zodiac sign calculation utility
const calculateZodiacSign = (birthDate: string): { sign: string; symbol: string } => {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  
  // Zodiac date ranges
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { sign: 'Aries', symbol: '♈' };
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { sign: 'Taurus', symbol: '♉' };
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { sign: 'Gemini', symbol: '♊' };
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { sign: 'Cancer', symbol: '♋' };
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { sign: 'Leo', symbol: '♌' };
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { sign: 'Virgo', symbol: '♍' };
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { sign: 'Libra', symbol: '♎' };
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { sign: 'Scorpio', symbol: '♏' };
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { sign: 'Sagittarius', symbol: '♐' };
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return { sign: 'Capricorn', symbol: '♑' };
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { sign: 'Aquarius', symbol: '♒' };
  } else {
    return { sign: 'Pisces', symbol: '♓' };
  }
};

// Calculate age and next birthday
const calculateAgeAndBirthday = (birthDate: string): { age: number; nextBirthday: Date; daysUntilBirthday: number } => {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  // Calculate next birthday
  const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday <= today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return { age, nextBirthday, daysUntilBirthday };
};

// Transform UserProfile to PersonalizedUser
const transformUserProfile = (profile: UserProfile): PersonalizedUser => {
  const zodiacData = calculateZodiacSign(profile.birth_date || profile.birthDate);
  const ageData = calculateAgeAndBirthday(profile.birth_date || profile.birthDate);
  
  return {
    // Core profile data
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name || profile.fullName || 'User',
    birthDate: profile.birth_date || profile.birthDate,
    birthTime: profile.birth_time || profile.birthTime,
    birthPlace: profile.birth_place || profile.birthPlace,
    timezone: profile.timezone,
    gender: profile.gender,
    subscriptionStatus: profile.subscription_status || profile.subscriptionStatus,
    
    // Calculated astrological data
    zodiacSign: zodiacData.sign,
    zodiacSymbol: zodiacData.symbol,
    age: ageData.age,
    nextBirthday: ageData.nextBirthday,
    daysUntilBirthday: ageData.daysUntilBirthday,
    
    // Additional calculated fields
    isPremium: (profile.subscription_status || profile.subscriptionStatus) === 'premium',
    hasBirthTime: !!(profile.birth_time || profile.birthTime),
    hasCompleteProfile: !!(profile.full_name || profile.fullName) && !!(profile.birth_date || profile.birthDate) && !!(profile.birth_place || profile.birthPlace),
  };
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<PersonalizedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const profile = await AuthService.getCurrentUserProfile();
      if (profile) {
        const personalizedUser = transformUserProfile(profile);
        setUser(personalizedUser);
      } else {
        // No profile exists yet - user needs to complete onboarding
        setUser(null);
        setError(null); // Don't treat this as an error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      // TODO: Implement profile update in AuthService
      // For now, just refresh the data
      await refreshUserData();
    } catch (err) {
      throw err;
    }
  };

  // Load user data on mount
  useEffect(() => {
    refreshUserData();
  }, []);

  const value: UserContextType = {
    user,
    isLoading,
    error,
    refreshUserData,
    updateUserProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Utility hooks for common user data access
export const useUserName = (): string => {
  const { user } = useUser();
  return user?.fullName || 'User';
};

export const useUserZodiac = (): { sign: string; symbol: string } => {
  const { user } = useUser();
  return {
    sign: user?.zodiacSign || 'Unknown',
    symbol: user?.zodiacSymbol || '?'
  };
};

export const useUserBirthData = () => {
  const { user } = useUser();
  return {
    birthDate: user?.birthDate || '',
    birthTime: user?.birthTime || '',
    birthPlace: user?.birthPlace || '',
    hasBirthTime: user?.hasBirthTime || false,
  };
};

export const useUserGreeting = (): string => {
  const { user } = useUser();
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? "Good morning" : currentTime < 18 ? "Good afternoon" : "Good evening";
  const name = user?.fullName || 'User';
  return `${greeting}, ${name}`;
};
