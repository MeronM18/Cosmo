import AsyncStorage from '@react-native-async-storage/async-storage';
import { HoroscopeData, User } from './horoscopesState';

// API configuration
const API_BASE_URL = 'https://adyrgavblydgdvttttwn.supabase.co/functions/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeXJnYXZibHlkZ2R2dHR0dHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODk5MjksImV4cCI6MjA3Mjk2NTkyOX0.wc5KPXufeFqWSdK4-dYsZUg6lQmEh1X4ZiS4z1L9ahI';
const CACHE_EXPIRY_HOURS = 24;

// Request interfaces
interface HoroscopeRequest {
  zodiacSign: string;
  birthDate: Date;
  period: 'today' | 'yesterday' | 'tomorrow' | 'weekly' | 'monthly';
  style: 'gentle' | 'direct' | 'mystical';
  length: 'brief' | 'standard' | 'extended';
  focusAreas: Array<'love' | 'career' | 'health' | 'growth'>;
  isPremium: boolean;
}

interface TransitRequest {
  birthDate: Date;
  birthTime: Date;
  birthLocation: string;
  currentDate: Date;
}

interface BirthChartRequest {
  birthDate: Date;
  birthTime: Date;
  birthLocation: string;
}

// API response interfaces
interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface TransitData {
  id: string;
  planet: string;
  symbol: string;
  fromSign: string;
  toSign: string;
  progress: number;
  startDate: string;
  endDate: string;
  influence: string;
  intensity: 'low' | 'medium' | 'high';
}

interface BirthChartData {
  planets: Array<{
    name: string;
    symbol: string;
    angle: number;
    house: number;
    sign: string;
    isRetrograde: boolean;
  }>;
  houses: Array<{
    number: number;
    sign: string;
    cusp: number;
  }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }>;
}

// Error handling
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Cache management
class CacheManager {
  private static async getCacheKey(period: string): Promise<string> {
    return `horoscope_cache_${period}`;
  }

  static async getCachedHoroscope(period: string): Promise<HoroscopeData | null> {
    try {
      const cacheKey = await this.getCacheKey(period);
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const expiryDate = new Date(data.expiresAt);
      
      if (new Date() > expiryDate) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  static async cacheHoroscope(horoscope: HoroscopeData): Promise<void> {
    try {
      const cacheKey = await this.getCacheKey(horoscope.metadata.period);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(horoscope));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('horoscope_cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

// Main API service class
export class HoroscopesAPI {
  private static baseURL = API_BASE_URL;

  // Primary horoscope fetching function
  static async fetchHoroscope(
    user: User,
    params: {
      period: 'today' | 'yesterday' | 'tomorrow' | 'weekly' | 'monthly';
      style?: 'gentle' | 'direct' | 'mystical';
      length?: 'brief' | 'standard' | 'extended';
      focusAreas?: Array<'love' | 'career' | 'health' | 'growth'>;
    }
  ): Promise<HoroscopeData> {
    // Check cache first
    const cached = await CacheManager.getCachedHoroscope(params.period);
    if (cached) {
      return cached;
    }

    const requestBody: HoroscopeRequest = {
      zodiacSign: user.zodiacSign,
      birthDate: user.birthDate,
      period: params.period,
      style: params.style || 'gentle',
      length: params.length || 'standard',
      focusAreas: params.focusAreas || ['love', 'career'],
      isPremium: user.subscriptionLevel === 'premium'
    };

    try {
      const response = await fetch(`${API_BASE_URL}/generate-horoscope`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      const result: APIResponse<HoroscopeData> = await response.json();
      
      if (!result.success) {
        throw new APIError(result.error || 'Unknown API error', 'API_ERROR');
      }

      // Cache the result
      await CacheManager.cacheHoroscope(result.data);
      
      return result.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or other errors
      throw new APIError(
        'Network error - please check your connection',
        'NETWORK_ERROR'
      );
    }
  }

  // Fetch current astrological transits
  static async fetchCurrentTransits(birthData: {
    date: Date;
    time: Date;
    location: string;
  }): Promise<TransitData[]> {
    const requestBody: TransitRequest = {
      birthDate: birthData.date,
      birthTime: birthData.time,
      birthLocation: birthData.location,
      currentDate: new Date()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/current-transits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      const result: APIResponse<TransitData[]> = await response.json();
      
      if (!result.success) {
        throw new APIError(result.error || 'Unknown API error', 'API_ERROR');
      }

      return result.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError(
        'Failed to fetch transit data',
        'NETWORK_ERROR'
      );
    }
  }

  // Generate birth chart data
  static async generateBirthChart(birthData: {
    date: Date;
    time: Date;
    location: string;
  }): Promise<BirthChartData> {
    const requestBody: BirthChartRequest = {
      birthDate: birthData.date,
      birthTime: birthData.time,
      birthLocation: birthData.location
    };

    try {
      const response = await fetch(`${API_BASE_URL}/generate-birth-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      const result: APIResponse<BirthChartData> = await response.json();
      
      if (!result.success) {
        throw new APIError(result.error || 'Unknown API error', 'API_ERROR');
      }

      return result.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError(
        'Failed to generate birth chart',
        'NETWORK_ERROR'
      );
    }
  }

  // Fetch category-specific reading
  static async fetchCategoryReading(
    category: 'love' | 'career' | 'health' | 'growth' | 'social' | 'spirituality',
    user: User
  ): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/category-reading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          category,
          zodiacSign: user.zodiacSign,
          birthDate: user.birthDate,
          isPremium: user.subscriptionLevel === 'premium'
        })
      });

      if (!response.ok) {
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      const result: APIResponse<{ content: string }> = await response.json();
      
      if (!result.success) {
        throw new APIError(result.error || 'Unknown API error', 'API_ERROR');
      }

      return result.data.content;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError(
        'Failed to fetch category reading',
        'NETWORK_ERROR'
      );
    }
  }


  // Handle API errors with fallback
  static handleAPIError(error: APIError, fallback?: HoroscopeData): HoroscopeData | null {
    console.error('API Error:', error);
    
    switch (error.code) {
      case 'NETWORK_ERROR':
        // Return cached data if available
        return fallback || null;
      
      case 'RATE_LIMIT':
        // Show rate limit message
        throw new Error('Too many requests - please try again in a few minutes');
      
      case 'HTTP_ERROR':
        if (error.status === 401) {
          throw new Error('Authentication required - please log in again');
        } else if (error.status === 403) {
          throw new Error('Premium subscription required for this feature');
        } else if (error.status && error.status >= 500) {
          throw new Error('Server error - please try again later');
        }
        break;
      
      default:
        throw new Error('Something went wrong - please try again');
    }
    
    return null;
  }
}

// Utility functions
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

export const isConsecutiveDay = (date1: Date, date2: Date): boolean => {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

export const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};
