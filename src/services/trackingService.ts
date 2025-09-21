import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrackingData, MoodData } from './horoscopesState';
import { isSameDay, isConsecutiveDay, calculateCorrelation } from './horoscopesAPI';

// Achievement definitions
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'mood' | 'reading' | 'premium';
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Read your horoscope for 7 consecutive days',
    icon: '🔥',
    requirement: 7,
    type: 'streak'
  },
  {
    id: 'cosmic_consistent',
    title: 'Cosmic Consistent',
    description: 'Read your horoscope for 30 consecutive days',
    icon: '⭐',
    requirement: 30,
    type: 'streak'
  },
  {
    id: 'stellar_student',
    title: 'Stellar Student',
    description: 'Read your horoscope for 100 consecutive days',
    icon: '👑',
    requirement: 100,
    type: 'streak'
  },
  {
    id: 'mood_tracker',
    title: 'Mood Tracker',
    description: 'Track your mood for 7 days',
    icon: '😊',
    requirement: 7,
    type: 'mood'
  },
  {
    id: 'insight_seeker',
    title: 'Insight Seeker',
    description: 'Read 50 horoscopes',
    icon: '🔮',
    requirement: 50,
    type: 'reading'
  },
  {
    id: 'premium_explorer',
    title: 'Premium Explorer',
    description: 'Upgrade to premium',
    icon: '💎',
    requirement: 1,
    type: 'premium'
  }
];

// Streak management
export class StreakManager {
  static async updateStreak(userId: string): Promise<{ streak: number; newAchievements: Achievement[] }> {
    try {
      const today = new Date();
      const trackingData = await this.getTrackingData(userId);
      
      if (!trackingData) {
        // First time user
        const newTracking: TrackingData = {
          readingStreak: 1,
          lastReadDate: today,
          moodCorrelations: [],
          achievements: []
        };
        await this.saveTrackingData(userId, newTracking);
        return { streak: 1, newAchievements: [] };
      }

      const lastRead = new Date(trackingData.lastReadDate);
      
      // Check if already read today
      if (isSameDay(today, lastRead)) {
        return { streak: trackingData.readingStreak, newAchievements: [] };
      }

      let newStreak = trackingData.readingStreak;
      
      if (isConsecutiveDay(today, lastRead)) {
        // Extend streak
        newStreak += 1;
      } else {
        // Reset streak
        newStreak = 1;
      }

      // Update tracking data
      const updatedTracking: TrackingData = {
        ...trackingData,
        readingStreak: newStreak,
        lastReadDate: today
      };

      await this.saveTrackingData(userId, updatedTracking);

      // Check for new achievements
      const newAchievements = await AchievementManager.checkForAchievements(userId, newStreak, 'streak');

      return { streak: newStreak, newAchievements };
    } catch (error) {
      console.error('Error updating streak:', error);
      return { streak: 0, newAchievements: [] };
    }
  }

  static async getCurrentStreak(userId: string): Promise<number> {
    try {
      const trackingData = await this.getTrackingData(userId);
      return trackingData?.readingStreak || 0;
    } catch (error) {
      console.error('Error getting current streak:', error);
      return 0;
    }
  }

  private static async getTrackingData(userId: string): Promise<TrackingData | null> {
    try {
      const data = await AsyncStorage.getItem(`tracking_${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting tracking data:', error);
      return null;
    }
  }

  private static async saveTrackingData(userId: string, data: TrackingData): Promise<void> {
    try {
      await AsyncStorage.setItem(`tracking_${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving tracking data:', error);
    }
  }
}

// Mood tracking
export class MoodTracker {
  static async recordMood(
    userId: string,
    mood: number,
    accuracy: number,
    horoscopeId: string
  ): Promise<{ newAchievements: Achievement[]; insights?: string }> {
    try {
      const trackingData = await this.getTrackingData(userId);
      
      if (!trackingData) {
        throw new Error('No tracking data found');
      }

      const moodData: MoodData = {
        date: new Date(),
        mood,
        horoscopeAccuracy: accuracy,
        horoscopeId
      };

      const updatedTracking: TrackingData = {
        ...trackingData,
        moodCorrelations: [...trackingData.moodCorrelations, moodData]
      };

      await this.saveTrackingData(userId, updatedTracking);

      // Check for mood-related achievements
      const newAchievements = await AchievementManager.checkForAchievements(
        userId, 
        updatedTracking.moodCorrelations.length, 
        'mood'
      );

      // Generate insights if enough data
      const insights = this.generateMoodInsights(updatedTracking.moodCorrelations);

      return { newAchievements, insights };
    } catch (error) {
      console.error('Error recording mood:', error);
      return { newAchievements: [] };
    }
  }

  static generateMoodInsights(moodCorrelations: MoodData[]): string | undefined {
    if (moodCorrelations.length < 7) return undefined;

    const recentMoods = moodCorrelations.slice(-30);
    const moods = recentMoods.map(m => m.mood);
    const accuracies = recentMoods.map(m => m.horoscopeAccuracy);
    
    const correlation = calculateCorrelation(moods, accuracies);
    
    if (correlation > 0.7) {
      return 'Your horoscopes are highly aligned with your daily experience!';
    } else if (correlation > 0.5) {
      return 'Your horoscopes show good alignment with your mood patterns.';
    } else if (correlation < -0.3) {
      return 'Interesting! Your horoscopes seem to provide contrast to your daily mood.';
    }
    
    return undefined;
  }

  static async getMoodHistory(userId: string, days: number = 30): Promise<MoodData[]> {
    try {
      const trackingData = await this.getTrackingData(userId);
      if (!trackingData) return [];

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return trackingData.moodCorrelations.filter(
        mood => new Date(mood.date) >= cutoffDate
      );
    } catch (error) {
      console.error('Error getting mood history:', error);
      return [];
    }
  }

  private static async getTrackingData(userId: string): Promise<TrackingData | null> {
    try {
      const data = await AsyncStorage.getItem(`tracking_${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting tracking data:', error);
      return null;
    }
  }

  private static async saveTrackingData(userId: string, data: TrackingData): Promise<void> {
    try {
      await AsyncStorage.setItem(`tracking_${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving tracking data:', error);
    }
  }
}

// Achievement system
export class AchievementManager {
  static async checkForAchievements(
    userId: string,
    value: number,
    type: Achievement['type']
  ): Promise<Achievement[]> {
    try {
      const trackingData = await this.getTrackingData(userId);
      if (!trackingData) return [];

      const relevantAchievements = ACHIEVEMENTS.filter(
        achievement => achievement.type === type && 
                      achievement.requirement === value &&
                      !trackingData.achievements.includes(achievement.id)
      );

      if (relevantAchievements.length === 0) return [];

      // Update achievements
      const updatedTracking: TrackingData = {
        ...trackingData,
        achievements: [...trackingData.achievements, ...relevantAchievements.map(a => a.id)]
      };

      await this.saveTrackingData(userId, updatedTracking);

      return relevantAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  static async getUnlockedAchievements(userId: string): Promise<Achievement[]> {
    try {
      const trackingData = await this.getTrackingData(userId);
      if (!trackingData) return [];

      return ACHIEVEMENTS.filter(achievement => 
        trackingData.achievements.includes(achievement.id)
      );
    } catch (error) {
      console.error('Error getting unlocked achievements:', error);
      return [];
    }
  }

  static async getProgress(userId: string): Promise<Record<string, number>> {
    try {
      const trackingData = await this.getTrackingData(userId);
      if (!trackingData) return {};

      const progress: Record<string, number> = {};

      // Streak progress
      progress.streak = trackingData.readingStreak;

      // Mood tracking progress
      progress.moodTracking = trackingData.moodCorrelations.length;

      // Reading progress (approximate)
      progress.readings = trackingData.readingStreak + trackingData.moodCorrelations.length;

      return progress;
    } catch (error) {
      console.error('Error getting progress:', error);
      return {};
    }
  }

  private static async getTrackingData(userId: string): Promise<TrackingData | null> {
    try {
      const data = await AsyncStorage.getItem(`tracking_${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting tracking data:', error);
      return null;
    }
  }

  private static async saveTrackingData(userId: string, data: TrackingData): Promise<void> {
    try {
      await AsyncStorage.setItem(`tracking_${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving tracking data:', error);
    }
  }
}

// Analytics and insights
export class AnalyticsService {
  static async trackEvent(
    eventName: string,
    properties: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      const eventData = {
        event: eventName,
        properties,
        userId,
        timestamp: new Date().toISOString(),
        platform: 'mobile'
      };

      // Store locally for batch sending
      await this.storeEvent(eventData);

      // Send to analytics service (implement your preferred analytics)
      // await this.sendToAnalytics(eventData);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  static async getReadingInsights(userId: string): Promise<{
    totalReadings: number;
    averageMood: number;
    accuracyCorrelation: number;
    favoriteCategories: string[];
    readingPatterns: Record<string, number>;
  }> {
    try {
      const trackingData = await this.getTrackingData(userId);
      if (!trackingData) {
        return {
          totalReadings: 0,
          averageMood: 0,
          accuracyCorrelation: 0,
          favoriteCategories: [],
          readingPatterns: {}
        };
      }

      const moods = trackingData.moodCorrelations.map(m => m.mood);
      const accuracies = trackingData.moodCorrelations.map(m => m.horoscopeAccuracy);

      return {
        totalReadings: trackingData.readingStreak,
        averageMood: moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0,
        accuracyCorrelation: calculateCorrelation(moods, accuracies),
        favoriteCategories: [], // Implement based on your data
        readingPatterns: {} // Implement based on your data
      };
    } catch (error) {
      console.error('Error getting reading insights:', error);
      return {
        totalReadings: 0,
        averageMood: 0,
        accuracyCorrelation: 0,
        favoriteCategories: [],
        readingPatterns: {}
      };
    }
  }

  private static async storeEvent(eventData: any): Promise<void> {
    try {
      const events = await AsyncStorage.getItem('analytics_events');
      const eventList = events ? JSON.parse(events) : [];
      eventList.push(eventData);
      
      // Keep only last 100 events
      if (eventList.length > 100) {
        eventList.splice(0, eventList.length - 100);
      }
      
      await AsyncStorage.setItem('analytics_events', JSON.stringify(eventList));
    } catch (error) {
      console.error('Error storing event:', error);
    }
  }

  private static async getTrackingData(userId: string): Promise<TrackingData | null> {
    try {
      const data = await AsyncStorage.getItem(`tracking_${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting tracking data:', error);
      return null;
    }
  }
}