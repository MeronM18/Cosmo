// src/types/horoscopeExtensions.ts

// 1. Astro Journal & Reflection
export interface Goal {
  id: string;
  text: string;
  targetDate: Date;
  isCompleted: boolean;
  astrologicalTiming: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: Date;
  prompt: string;
  response: string;
  mood: number; // 1-5 scale
  planetaryInfluence: string;
  goals: Goal[];
  gratitudeItems: string[];
}

// 2. Seasonal & Celestial Events
export interface CelestialEvent {
  id: string;
  name: string;
  type: 'eclipse' | 'retrograde' | 'station' | 'seasonal' | 'moon_phase' | 'meteor_shower' | 'supermoon';
  startDate: Date;
  endDate?: Date;
  description: string;
  impactLevel: 'low' | 'medium' | 'high';
  preparationTips: string[];
  affectedSigns: string[];
  isRealTime?: boolean;
}

// 3. Daily Rituals & Practices
export interface RitualStep {
  id: string;
  description: string;
  duration: number; // in minutes
  isOptional: boolean;
  materials?: string[];
}

export interface Ritual {
  id: string;
  name: string;
  type: 'morning' | 'evening' | 'cleansing' | 'grounding' | 'energizing';
  duration: number; // in minutes
  steps: RitualStep[];
  zodiacAlignment: string[];
  planetaryAlignment: string[];
  difficulty: 'easy' | 'moderate' | 'advanced';
}

export interface RitualSession {
  id: string;
  ritualId: string;
  userId: string;
  completedAt: Date;
  rating: number;
  notes?: string;
}

// Common interfaces for all sections
export interface SectionProps {
  userData: {
    name: string;
    zodiacSign: string;
    zodiacSymbol: string;
    isPremium: boolean;
    readingStreak: number;
    cosmicRating: number;
    luckyNumbers: number[];
    compatibleSigns: string[];
  };
  onPremiumUpgrade?: () => void;
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
