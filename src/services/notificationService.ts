// Mock imports for development - replace with actual imports in production
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock implementations for development
const Notifications = {
  setNotificationHandler: (handler: any) => {
    console.log('Notification handler set:', handler);
  },
  getPermissionsAsync: async () => ({ status: 'granted' }),
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  setNotificationChannelAsync: async (id: string, channel: any) => {
    console.log('Notification channel set:', id, channel);
  },
  scheduleNotificationAsync: async (notification: any) => {
    console.log('Notification scheduled:', notification);
    return 'mock-id';
  },
  cancelScheduledNotificationAsync: async (id: string) => {
    console.log('Notification cancelled:', id);
  },
  cancelAllScheduledNotificationsAsync: async () => {
    console.log('All notifications cancelled');
  },
  getAllScheduledNotificationsAsync: async () => [],
  addNotificationReceivedListener: (listener: any) => {
    console.log('Notification listener added');
    return { remove: () => console.log('Listener removed') };
  },
  addNotificationResponseReceivedListener: (listener: any) => {
    console.log('Response listener added');
    return { remove: () => console.log('Response listener removed') };
  },
  AndroidImportance: {
    HIGH: 'high',
    MAX: 'max'
  }
};

const Device = {
  isDevice: true,
  brand: 'Mock',
  modelName: 'Mock Device',
  osName: 'Mock OS',
  osVersion: '1.0.0'
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersonalizedUser } from '../contexts/UserContext';

import { Platform } from 'react-native';
import { AnalyticsService } from './trackingService';

// Notification configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Notification types
export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  schedule?: {
    time: Date;
    repeats?: 'daily' | 'weekly' | 'monthly';
  };
}

export interface RetrogradeAlert {
  planet: string;
  startDate: Date;
  endDate: Date;
  effects: string[];
}

// Notification service class
export class NotificationService {
  private static isInitialized = false;

  // Initialize notification service
  static async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('horoscopes', {
          name: 'Horoscopes',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FFD700',
        });

        await Notifications.setNotificationChannelAsync('alerts', {
          name: 'Astrological Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B9D',
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Schedule daily horoscope reminder
  static async scheduleDailyReminder(
    reminderTime: Date,
    userId: string
  ): Promise<boolean> {
    try {
      await this.initialize();

      // Cancel existing daily reminder
      await this.cancelNotification('daily_horoscope');

      // Schedule new reminder
      const trigger = {
        type: 'calendar' as const,
        hour: reminderTime.getHours(),
        minute: reminderTime.getMinutes(),
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Your cosmic guidance awaits ✨',
          body: 'See what the stars have planned for you today',
          data: { 
            action: 'open_horoscope',
            userId,
            type: 'daily_reminder'
          },
          sound: 'default',
        },
        trigger,
        identifier: 'daily_horoscope',
      });

      // Save reminder time
      await AsyncStorage.setItem('daily_reminder_time', reminderTime.toISOString());

      await AnalyticsService.trackEvent('daily_reminder_scheduled', {
        time: reminderTime.toISOString(),
        userId
      });

      return true;
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
      return false;
    }
  }

  // Send retrograde alert
  static async sendRetrogradeAlert(
    planet: string,
    startDate: Date,
    endDate: Date,
    effects: string[]
  ): Promise<boolean> {
    try {
      await this.initialize();

      const alertId = `retrograde_${planet.toLowerCase()}_${startDate.getTime()}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${planet} Retrograde Alert ⚠️`,
          body: `${planet} goes retrograde today. ${effects[0] || 'Prepare for communication delays and introspection.'}`,
          data: {
            action: 'retrograde_info',
            planet,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            effects,
            type: 'retrograde_alert'
          },
          sound: 'default',
        },
        trigger: { type: 'date' as const, date: startDate },
        identifier: alertId,
      });

      await AnalyticsService.trackEvent('retrograde_alert_scheduled', {
        planet,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error sending retrograde alert:', error);
      return false;
    }
  }

  // Send transit alert
  static async sendTransitAlert(
    planet: string,
    transitDate: Date,
    influence: string,
    intensity: 'low' | 'medium' | 'high'
  ): Promise<boolean> {
    try {
      await this.initialize();

      const alertId = `transit_${planet.toLowerCase()}_${transitDate.getTime()}`;
      const intensityEmoji = intensity === 'high' ? '🔥' : intensity === 'medium' ? '⚡' : '✨';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${planet} Transit ${intensityEmoji}`,
          body: `${planet} is making an important transit. ${influence}`,
          data: {
            action: 'transit_info',
            planet,
            transitDate: transitDate.toISOString(),
            influence,
            intensity,
            type: 'transit_alert'
          },
          sound: 'default',
        },
        trigger: { type: 'date' as const, date: transitDate },
        identifier: alertId,
      });

      await AnalyticsService.trackEvent('transit_alert_scheduled', {
        planet,
        transitDate: transitDate.toISOString(),
        intensity
      });

      return true;
    } catch (error) {
      console.error('Error sending transit alert:', error);
      return false;
    }
  }

  // Send achievement notification
  static async sendAchievementNotification(
    achievement: {
      title: string;
      description: string;
      icon: string;
    }
  ): Promise<boolean> {
    try {
      await this.initialize();

      const alertId = `achievement_${Date.now()}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Achievement Unlocked! ${achievement.icon}`,
          body: `${achievement.title}: ${achievement.description}`,
          data: {
            action: 'view_achievement',
            achievement,
            type: 'achievement'
          },
          sound: 'default',
        },
        trigger: null, // Send immediately
        identifier: alertId,
      });

      await AnalyticsService.trackEvent('achievement_notification_sent', {
        achievement: achievement.title
      });

      return true;
    } catch (error) {
      console.error('Error sending achievement notification:', error);
      return false;
    }
  }

  // Send streak reminder
  static async sendStreakReminder(
    currentStreak: number,
    userId: string
  ): Promise<boolean> {
    try {
      await this.initialize();

      // Only send if streak is at risk (not read today)
      const lastReadDate = await AsyncStorage.getItem(`last_read_${userId}`);
      if (lastReadDate) {
        const lastRead = new Date(lastReadDate);
        const today = new Date();
        const isSameDay = lastRead.toDateString() === today.toDateString();
        
        if (isSameDay) return true; // Already read today
      }

      const alertId = `streak_reminder_${Date.now()}`;
      const streakEmoji = currentStreak >= 7 ? '🔥' : currentStreak >= 3 ? '⭐' : '✨';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Don't break your streak! ${streakEmoji}`,
          body: `You're on a ${currentStreak}-day reading streak. Read today's horoscope to keep it going!`,
          data: {
            action: 'open_horoscope',
            userId,
            currentStreak,
            type: 'streak_reminder'
          },
          sound: 'default',
        },
        trigger: { type: 'timeInterval' as const, seconds: 60 * 60 * 20 }, // 8 PM if not read
        identifier: alertId,
      });

      return true;
    } catch (error) {
      console.error('Error sending streak reminder:', error);
      return false;
    }
  }

  // Send personalized horoscope notification
  static async sendPersonalizedNotification(
    horoscope: {
      title: string;
      preview: string;
      mood: string;
    },
    user: PersonalizedUser
  ): Promise<boolean> {
    try {
      await this.initialize();

      const alertId = `personalized_${Date.now()}`;
      const moodEmoji = this.getMoodEmoji(horoscope.mood);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${user.fullName}, your ${user.zodiacSign} horoscope is ready! ${moodEmoji}`,
          body: horoscope.preview,
          data: {
            action: 'open_horoscope',
            userId: user.id,
            horoscope,
            type: 'personalized',
            userZodiac: user.zodiacSign,
            userName: user.fullName
          },
          sound: 'default',
        },
        trigger: null, // Send immediately
        identifier: alertId,
      });

      return true;
    } catch (error) {
      console.error('Error sending personalized notification:', error);
      return false;
    }
  }

  // Cancel a specific notification
  static async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Cancel all notifications
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Schedule daily personalized horoscope notifications
  static async scheduleDailyHoroscopeNotification(user: PersonalizedUser): Promise<boolean> {
    try {
      await this.initialize();

      const notificationId = `daily_horoscope_${user.id}`;
      
      // Schedule for 9 AM daily
      const trigger = {
        hour: 9,
        minute: 0,
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Good morning, ${user.fullName}! 🌟`,
          body: `Your ${user.zodiacSign} horoscope is ready to guide your day`,
          data: {
            action: 'open_horoscope',
            userId: user.id,
            type: 'daily_horoscope',
            userZodiac: user.zodiacSign,
            userName: user.fullName
          },
          sound: 'default',
        },
        trigger,
        identifier: notificationId,
      });

      console.log(`Daily horoscope notification scheduled for ${user.fullName} (${user.zodiacSign})`);
      return true;
    } catch (error) {
      console.error('Error scheduling daily horoscope notification:', error);
      return false;
    }
  }

  // Schedule transit alerts for user's zodiac sign
  static async scheduleTransitAlert(user: PersonalizedUser, transitInfo: {
    planet: string;
    sign: string;
    date: string;
    description: string;
  }): Promise<boolean> {
    try {
      await this.initialize();

      const notificationId = `transit_${user.id}_${Date.now()}`;
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Important transit for ${user.fullName}! ⭐`,
          body: `${transitInfo.planet} enters ${transitInfo.sign} - ${transitInfo.description}`,
          data: {
            action: 'open_transits',
            userId: user.id,
            type: 'transit_alert',
            userZodiac: user.zodiacSign,
            userName: user.fullName,
            transitInfo
          },
          sound: 'default',
        },
        trigger: null, // Send immediately
        identifier: notificationId,
      });

      return true;
    } catch (error) {
      console.error('Error scheduling transit alert:', error);
      return false;
    }
  }

  // Get scheduled notifications
  static async getScheduledNotifications(): Promise<any[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Handle notification response
  static handleNotificationResponse = (response: any) => {
    const { data } = response.notification.request.content;
    
    if (data?.action) {
      AnalyticsService.trackEvent('notification_tapped', {
        action: data.action,
        type: data.type,
        userId: data.userId
      });

      // Handle different notification actions
      switch (data.action) {
        case 'open_horoscope':
          // Navigate to horoscope screen
          console.log('Opening horoscope for user:', data.userId);
          break;
        case 'retrograde_info':
          // Navigate to retrograde information
          console.log('Showing retrograde info for:', data.planet);
          break;
        case 'transit_info':
          // Navigate to transit information
          console.log('Showing transit info for:', data.planet);
          break;
        case 'view_achievement':
          // Navigate to achievements screen
          console.log('Showing achievement:', data.achievement);
          break;
        default:
          console.log('Unknown notification action:', data.action);
      }
    }
  };

  // Get mood emoji for notifications
  private static getMoodEmoji(mood: string): string {
    const moodEmojis: Record<string, string> = {
      'excited': '🌟',
      'confident': '💪',
      'peaceful': '☮️',
      'curious': '🔍',
      'grateful': '🙏',
      'hopeful': '🌈',
      'focused': '🎯',
      'adventurous': '🚀',
      'creative': '🎨',
      'reflective': '🤔'
    };
    
    return moodEmojis[mood.toLowerCase()] || '✨';
  }

  // Check if notifications are enabled
  static async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  // Request notification permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
}

// Initialize notification listener
export const initializeNotificationListener = () => {
  // Handle notification received while app is in foreground
  const notificationListener = Notifications.addNotificationReceivedListener((notification: any) => {
    console.log('Notification received:', notification);
  });

  // Handle notification response (when user taps notification)
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    NotificationService.handleNotificationResponse
  );

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
};
