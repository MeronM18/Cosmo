import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { haptics } from '../utils/haptics';

interface SettingsContextType {
  notificationsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  toggleHapticFeedback: (enabled: boolean) => void;
  triggerHaptic: (type: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticFeedbackEnabled, setHapticFeedbackEnabled] = useState(true);

  // Load settings from storage on app start
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      const storedHaptic = await AsyncStorage.getItem('hapticFeedbackEnabled');
      
      if (storedNotifications !== null) {
        setNotificationsEnabled(JSON.parse(storedNotifications));
      }
      
      if (storedHaptic !== null) {
        setHapticFeedbackEnabled(JSON.parse(storedHaptic));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    try {
      setNotificationsEnabled(enabled);
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
      
      if (enabled) {
        // Request notification permissions and enable notifications
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          // If permission denied, revert the setting
          setNotificationsEnabled(false);
          await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(false));
          throw new Error('Notification permission denied');
        }
        
        // Configure notification settings
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
      } else {
        // Disable notifications by canceling all scheduled notifications
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      throw error;
    }
  };

  const toggleHapticFeedback = (enabled: boolean) => {
    setHapticFeedbackEnabled(enabled);
    haptics.setEnabled(enabled);
  };

  const triggerHaptic = (type: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType) => {
    // Delegate to centralized haptic manager
    if (typeof type === 'string') {
      if (type.includes('Light')) {
        haptics.light();
      } else if (type.includes('Medium')) {
        haptics.medium();
      } else if (type.includes('Heavy')) {
        haptics.heavy();
      } else if (type.includes('Success')) {
        haptics.success();
      } else if (type.includes('Warning')) {
        haptics.warning();
      } else if (type.includes('Error')) {
        haptics.error();
      }
    }
  };

  const value: SettingsContextType = {
    notificationsEnabled,
    hapticFeedbackEnabled,
    toggleNotifications,
    toggleHapticFeedback,
    triggerHaptic,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
