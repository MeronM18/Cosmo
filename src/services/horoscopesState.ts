import AsyncStorage from '@react-native-async-storage/async-storage';

// Core state interfaces
export interface User {
  zodiacSign: string;
  birthDate: Date;
  birthTime: Date;
  birthLocation: string;
  subscriptionLevel: 'free' | 'premium';
}

export interface HoroscopeData {
  id: string;
  content: {
    main: string;
    categories: {
      love: string;
      career: string;
      health: string;
      growth: string;
      social: string;
      spirituality: string;
    };
    cosmicEnergy: number; // 1-5 rating
    luckyElements: {
      color: string;
      number: number;
      time: string;
      direction: string;
    };
    keyPlanets: string[];
    mood: string;
    wordOfDay: string;
  };
  metadata: {
    generatedAt: Date;
    period: string;
    expiresAt: Date;
  };
}

export interface UserPreferences {
  readingStyle: 'gentle' | 'direct' | 'mystical';
  readingLength: 'brief' | 'standard' | 'extended';
  focusAreas: Array<'love' | 'career' | 'health' | 'growth'>;
  notificationTime: Date;
}

export interface MoodData {
  date: Date;
  mood: number; // 1-5 scale
  horoscopeAccuracy: number; // 1-5 scale
  horoscopeId: string;
}

export interface CompletedReading {
  id: string;
  horoscopeId: string;
  readDate: Date;
  period: 'today' | 'yesterday' | 'tomorrow' | 'weekly' | 'monthly';
  moodRating?: number;
  accuracyRating?: number;
  notes?: string;
}

export interface TrackingData {
  readingStreak: number;
  lastReadDate: Date;
  moodCorrelations: MoodData[];
  achievements: string[];
  completedReadings: CompletedReading[];
}

export interface HoroscopesState {
  user: User;
  horoscopes: {
    today: HoroscopeData | null;
    yesterday: HoroscopeData | null;
    tomorrow: HoroscopeData | null;
    weekly: HoroscopeData | null;
    monthly: HoroscopeData | null;
    cached: HoroscopeData[];
  };
  preferences: UserPreferences;
  tracking: TrackingData;
  isLoading: boolean;
  error: string | null;
}

// Initial state
export const initialHoroscopesState: HoroscopesState = {
  user: {
    zodiacSign: 'scorpio',
    birthDate: new Date('1990-01-01'),
    birthTime: new Date('1990-01-01T12:00:00'),
    birthLocation: 'New York, NY',
    subscriptionLevel: 'free'
  },
  horoscopes: {
    today: null,
    yesterday: null,
    tomorrow: null,
    weekly: null,
    monthly: null,
    cached: []
  },
  preferences: {
    readingStyle: 'gentle',
    readingLength: 'standard',
    focusAreas: ['love', 'career'],
    notificationTime: new Date('2024-01-01T09:00:00')
  },
  tracking: {
    readingStreak: 0,
    lastReadDate: new Date(),
    moodCorrelations: [],
    achievements: [],
    completedReadings: []
  },
  isLoading: false,
  error: null
};

// State management class
export class HoroscopesStateManager {
  private state: HoroscopesState;
  private listeners: Array<(state: HoroscopesState) => void> = [];

  constructor(initialState: HoroscopesState = initialHoroscopesState) {
    this.state = initialState;
    this.loadPersistedState();
  }

  // Subscribe to state changes
  subscribe(listener: (state: HoroscopesState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get current state
  getState(): HoroscopesState {
    return { ...this.state };
  }

  // Update state and notify listeners
  private setState(newState: Partial<HoroscopesState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
    this.persistState();
  }

  // User management
  updateUser(userData: Partial<User>) {
    this.setState({ user: { ...this.state.user, ...userData } });
  }

  // Horoscope management
  setHoroscope(period: keyof HoroscopesState['horoscopes'], horoscope: HoroscopeData | null) {
    const horoscopes = { ...this.state.horoscopes };
    if (period !== 'cached') {
      (horoscopes as any)[period] = horoscope;
    }
    this.setState({ horoscopes });
  }

  // Preferences management
  updatePreferences(preferences: Partial<UserPreferences>) {
    this.setState({ 
      preferences: { ...this.state.preferences, ...preferences } 
    });
  }

  // Tracking management
  updateTracking(tracking: Partial<TrackingData>) {
    this.setState({ 
      tracking: { ...this.state.tracking, ...tracking } 
    });
  }

  // Add completed reading
  addCompletedReading(reading: CompletedReading) {
    const completedReadings = [...this.state.tracking.completedReadings, reading];
    this.setState({
      tracking: {
        ...this.state.tracking,
        completedReadings
      }
    });
  }

  // Get completed readings
  getCompletedReadings(): CompletedReading[] {
    return this.state.tracking.completedReadings;
  }

  // Get reading history for a specific period
  getReadingHistory(period?: 'today' | 'yesterday' | 'tomorrow' | 'weekly' | 'monthly'): CompletedReading[] {
    const readings = this.state.tracking.completedReadings;
    if (!period) return readings;
    return readings.filter(reading => reading.period === period);
  }

  // Loading state
  setLoading(isLoading: boolean) {
    this.setState({ isLoading });
  }

  // Error state
  setError(error: string | null) {
    this.setState({ error });
  }

  // Persist state to AsyncStorage
  private async persistState() {
    try {
      const stateToPersist = {
        user: this.state.user,
        preferences: this.state.preferences,
        tracking: this.state.tracking,
        horoscopes: {
          cached: this.state.horoscopes.cached
        }
      };
      await AsyncStorage.setItem('horoscopes_state', JSON.stringify(stateToPersist));
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  // Load persisted state from AsyncStorage
  private async loadPersistedState() {
    try {
      const persistedState = await AsyncStorage.getItem('horoscopes_state');
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        this.setState({
          user: { ...this.state.user, ...parsed.user },
          preferences: { ...this.state.preferences, ...parsed.preferences },
          tracking: { ...this.state.tracking, ...parsed.tracking },
          horoscopes: {
            ...this.state.horoscopes,
            cached: parsed.horoscopes?.cached || []
          }
        });
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }

  // Clear all data
  async clearAllData() {
    try {
      await AsyncStorage.removeItem('horoscopes_state');
      this.state = initialHoroscopesState;
      this.listeners.forEach(listener => listener(this.state));
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }
}

// Singleton instance
export const horoscopesStateManager = new HoroscopesStateManager();
