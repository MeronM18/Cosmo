import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

class HapticManager {
  private static instance: HapticManager;
  private enabled: boolean = true;

  private constructor() {
    this.loadSettings();
  }

  public static getInstance(): HapticManager {
    if (!HapticManager.instance) {
      HapticManager.instance = new HapticManager();
    }
    return HapticManager.instance;
  }

  private async loadSettings() {
    try {
      const stored = await AsyncStorage.getItem('hapticFeedbackEnabled');
      if (stored !== null) {
        this.enabled = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading haptic settings:', error);
    }
  }

  public async setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      await AsyncStorage.setItem('hapticFeedbackEnabled', JSON.stringify(enabled));
    } catch (error) {
      console.error('Error saving haptic settings:', error);
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Light haptic feedback for buttons, toggles, minor interactions
  public light() {
    if (this.enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  // Medium haptic feedback for important actions
  public medium() {
    if (this.enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  // Heavy haptic feedback for critical actions
  public heavy() {
    if (this.enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  // Success notification
  public success() {
    if (this.enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  // Warning notification
  public warning() {
    if (this.enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  // Error notification
  public error() {
    if (this.enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  // Selection feedback (for scrolling, typing)
  public selection() {
    if (this.enabled) {
      Haptics.selectionAsync();
    }
  }
}

export const haptics = HapticManager.getInstance();

