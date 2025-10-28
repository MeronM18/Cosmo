import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../contexts/SettingsContext';
import { AppColors } from '../theme/appTheme';
import AccountSettingsScreen from './AccountSettingsScreen';
import { haptics } from '../utils/haptics';

const { width, height } = Dimensions.get('window');

interface SettingsScreenProps {
  userData: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    zodiacSign: string;
  };
  onClose: () => void;
  onLogout: () => void;
  onSaveUserData: (updatedData: any) => void;
  userId: string;
  onAccountDeleted: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  userData, 
  onClose, 
  onLogout, 
  onSaveUserData,
  userId,
  onAccountDeleted
}) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  const { 
    notificationsEnabled, 
    hapticFeedbackEnabled, 
    toggleNotifications, 
    toggleHapticFeedback, 
    triggerHaptic 
  } = useSettings();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Local state
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    haptics.light();
    onClose();
  };

  const handleNotificationToggle = async (value: boolean) => {
    haptics.light();
    try {
      await toggleNotifications(value);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update notification settings');
    }
  };

  const handleHapticToggle = (value: boolean) => {
    // Use direct Haptics for toggle feedback since we're changing the setting
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleHapticFeedback(value);
  };

  const handleAccountSettings = () => {
    haptics.light();
    setShowAccountSettings(true);
  };

  const handleLogout = () => {
    haptics.medium();
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => {
            haptics.success();
            setIsLoggingOut(true);
            
            // Start rotation animation
            Animated.loop(
              Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              })
            ).start();
            
            // Simulate logout process with loading animation
            setTimeout(() => {
              onLogout();
            }, 1500); // 1.5 second loading animation
          }
        }
      ]
    );
  };

  const handlePrivacySettings = () => {
    haptics.light();
    Alert.alert('Privacy Settings', 'Privacy settings feature coming soon!');
  };

  const handleCloseAccountSettings = () => {
    haptics.light();
    setShowAccountSettings(false);
  };

  const handleSaveUserData = (updatedData: any) => {
    onSaveUserData(updatedData);
    setShowAccountSettings(false);
  };


  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          <Ionicons name={icon as any} size={24} color={AppColors.cosmicGold} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
            {title}
          </Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {rightComponent && (
        <View style={styles.settingRight}>
          {rightComponent}
        </View>
      )}
    </TouchableOpacity>
  );

  // If account settings is open, render only the account settings screen
  if (showAccountSettings) {
    return (
      <AccountSettingsScreen
        userData={userData}
        onClose={handleCloseAccountSettings}
        onSave={handleSaveUserData}
        userId={userId}
        onAccountDeleted={onAccountDeleted}
      />
    );
  }


  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[AppColors.background, AppColors.surface]}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={AppColors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
          Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
              Profile
            </Text>
            <View style={styles.profileCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(138, 79, 255, 0.08)']}
                style={styles.profileGradient}
              >
                <View style={styles.profileAvatar}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>{userData.name[0]}</Text>
                  </LinearGradient>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
                    {userData.name}
                  </Text>
                  <Text style={styles.profileZodiac}>{userData.zodiacSign}</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
              App Settings
            </Text>
            
            {renderSettingItem(
              'notifications-outline',
              'Notifications',
              'Get daily horoscopes and cosmic updates',
              undefined,
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: AppColors.surface, true: AppColors.cosmicGold }}
                thumbColor={notificationsEnabled ? '#FFF' : AppColors.textSecondary}
              />
            )}

            {renderSettingItem(
              'phone-portrait-outline',
              'Haptic Feedback',
              'Feel vibrations for interactions',
              undefined,
              <Switch
                value={hapticFeedbackEnabled}
                onValueChange={handleHapticToggle}
                trackColor={{ false: AppColors.surface, true: AppColors.cosmicGold }}
                thumbColor={hapticFeedbackEnabled ? '#FFF' : AppColors.textSecondary}
              />
            )}

          </View>

          {/* Account & Privacy */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
              Account & Privacy
            </Text>
            
            {renderSettingItem(
              'person-outline',
              'Account Settings',
              'Manage your profile and account',
              handleAccountSettings,
              <Ionicons name="chevron-forward" size={20} color={AppColors.textSecondary} />
            )}

            {renderSettingItem(
              'shield-checkmark-outline',
              'Privacy Settings',
              'Control your data and privacy',
              handlePrivacySettings,
              <Ionicons name="chevron-forward" size={20} color={AppColors.textSecondary} />
            )}
          </View>

          {/* Logout */}
          <View style={styles.logoutSection}>
            {renderSettingItem(
              'log-out-outline',
              'Log Out',
              'Sign out of your account',
              handleLogout,
              <Ionicons name="chevron-forward" size={20} color={AppColors.textSecondary} />
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Simple Logout Loader Overlay */}
      {isLoggingOut && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContainer}>
            <Animated.View 
              style={[
                styles.loaderSpinner, 
                { 
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }
              ]}
            >
              <Ionicons name="refresh" size={32} color={AppColors.cosmicGold} />
            </Animated.View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    color: AppColors.cosmicGold,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  logoutSection: {
    marginBottom: 30,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: AppColors.cosmicGold,
    marginBottom: 15,
    marginLeft: 5,
  },
  profileCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 15,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    color: AppColors.onBackground,
    marginBottom: 4,
  },
  profileZodiac: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: AppColors.onBackground,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  settingRight: {
    marginLeft: 12,
  },
  // Simple loader styles
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderSpinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SettingsScreen;
