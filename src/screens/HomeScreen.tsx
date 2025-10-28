import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Animated,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';
import { AppColors } from '../theme/appTheme';
import HoroscopesContent from '../components/HoroscopesContent';
import LunaContent from '../components/LunaContent';
import SoulmateContent from '../components/SoulmateContent';
import LunaChatContent from '../components/LunaChatContent';
import LunaIntroScreen from '../components/LunaIntroScreen';
import SettingsScreen from './SettingsScreen';
import { SettingsProvider } from '../contexts/SettingsContext';
import { useUser, useUserGreeting, useUserZodiac, useUserBirthData } from '../contexts/UserContext';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  onClose?: () => void;
  onLogout?: () => void;
  userId?: string;
  onAccountDeleted?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onClose, onLogout, userId, onAccountDeleted }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  // Use personalized user data from context
  const { user, isLoading: userLoading } = useUser();
  const userGreeting = useUserGreeting();
  const { sign: zodiacSign, symbol: zodiacSymbol } = useUserZodiac();
  const { birthDate, birthTime, birthPlace, hasBirthTime } = useUserBirthData();

  const [selectedTab, setSelectedTab] = useState('horoscopes');
  const [lunaRoomState, setLunaRoomState] = useState<'intro' | 'chat'>('intro');
  const [showSettings, setShowSettings] = useState(false);
  
  // Fallback data for when user is loading or not available
  const userData = user ? {
    name: user.fullName,
    zodiacSign: user.zodiacSign,
    zodiacSymbol: user.zodiacSymbol,
    isPremium: user.isPremium,
    readingStreak: 7, // TODO: Get from user profile
    cosmicRating: 4, // TODO: Get from user profile
    luckyNumbers: [7, 14, 23, 31], // TODO: Calculate from birth data
    compatibleSigns: ["Cancer", "Pisces", "Capricorn"], // TODO: Calculate from zodiac
    birthDate: user.birthDate,
    birthTime: user.birthTime || "12:00",
    birthLocation: user.birthPlace
  } : {
    name: "User",
    zodiacSign: "Unknown",
    zodiacSymbol: "?",
    isPremium: false,
    readingStreak: 0,
    cosmicRating: 0,
    luckyNumbers: [],
    compatibleSigns: [],
    birthDate: "",
    birthTime: "",
    birthLocation: ""
  };
  const scrollY = useRef(new Animated.Value(0)).current;
  const parallaxAnim = useRef(new Animated.Value(0)).current;
  const navIndicatorAnim = useRef(new Animated.Value(0)).current;
  const navBarOpacity = useRef(new Animated.Value(1)).current;
  const navBarTranslateY = useRef(new Animated.Value(0)).current;


  // LunaContent compatible user data
  const lunaUserData = user ? {
    name: user.fullName,
    zodiacSign: user.zodiacSign,
    birthDate: new Date(user.birthDate),
    birthTime: user.birthTime ? new Date(`${user.birthDate}T${user.birthTime}:00`) : new Date(`${user.birthDate}T12:00:00`),
    birthLocation: user.birthPlace,
    subscriptionLevel: user.isPremium ? 'premium' as const : 'free' as const
  } : {
    name: "User",
    zodiacSign: "Unknown",
    birthDate: new Date(),
    birthTime: new Date(),
    birthLocation: "Unknown",
    subscriptionLevel: 'free' as const
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      parallaxAnim.setValue(value * 0.5);
      
      // Only apply scroll-based navigation bar logic when not in Luna chat
      if (!(selectedTab === 'chat' && lunaRoomState === 'chat')) {
        // Navigation bar hide/show logic - immediate response with smooth animation
        const scrollThreshold = 100; // Hide nav bar after scrolling 100px
        
        if (value > scrollThreshold) {
          // Hide navigation bar with smooth animation when scrolling down past threshold
          Animated.parallel([
            Animated.timing(navBarOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(navBarTranslateY, {
              toValue: 100,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          // Show navigation bar with smooth animation when scrolling back up
          Animated.parallel([
            Animated.timing(navBarOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(navBarTranslateY, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
    });

    // Initialize navigation indicator position for the current selected tab
    const initialTabIndex = ['horoscopes', 'moon', 'compatibility', 'chat'].indexOf(selectedTab);
    navIndicatorAnim.setValue(initialTabIndex);

    return () => {
      scrollY.removeListener(listener);
    };
  }, [selectedTab, lunaRoomState]);

  // Ensure navigation bar is visible when returning from Luna chat
  useEffect(() => {
    if (selectedTab === 'chat' && lunaRoomState === 'intro') {
      // Force navigation bar to be visible when returning to Luna intro
      Animated.parallel([
        Animated.timing(navBarOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(navBarTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [lunaRoomState, selectedTab]);

  // Ensure navigation indicator is positioned correctly for the current tab
  useEffect(() => {
    const tabIndex = ['horoscopes', 'moon', 'compatibility', 'chat'].indexOf(selectedTab);
    if (tabIndex !== -1) {
      Animated.spring(navIndicatorAnim, {
        toValue: tabIndex,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [selectedTab]);

  const handleTabPress = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
    
    // Reset Luna room state when switching tabs
    if (tab !== 'chat') {
      setLunaRoomState('intro');
    }
    
    // Animate the navigation indicator
    const tabIndex = ['horoscopes', 'moon', 'compatibility', 'chat'].indexOf(tab);
    Animated.spring(navIndicatorAnim, {
      toValue: tabIndex,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleEnterLunaRoom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLunaRoomState('chat');
  };

  const handleExitLunaRoom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLunaRoomState('intro');
    
    // Ensure navigation bar is visible when exiting Luna chat
    Animated.parallel([
      Animated.timing(navBarOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(navBarTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleOpenSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSettings(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleSaveUserData = (updatedData: any) => {
    // User data is now managed by UserContext
    // This function is kept for compatibility but doesn't need to do anything
    console.log('User data updated:', updatedData);
  };

  if (!fontsLoaded) {
    return null;
  }

  // If settings is open, render only the settings screen
  if (showSettings) {
    return (
      <SettingsProvider>
        <SettingsScreen
          userData={userData}
          onClose={handleCloseSettings}
          onLogout={handleLogout}
          onSaveUserData={handleSaveUserData}
          userId={user?.id || userId || 'default-user-id'}
          onAccountDeleted={onAccountDeleted || (() => {})}
        />
      </SettingsProvider>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Starfield Background */}
      <Animated.View 
        style={[
          styles.starfield,
          {
            transform: [{ translateY: parallaxAnim }]
          }
        ]}
      >
        {[...Array(50)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: Math.random() * 0.8 + 0.2,
              }
            ]}
          />
        ))}
      </Animated.View>


      {/* Header (hidden in Luna chat room) */}
      {!(selectedTab === 'chat' && lunaRoomState === 'chat') && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.pageTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
              {userGreeting}
            </Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
          <TouchableOpacity style={styles.profileAvatar} onPress={handleOpenSettings}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{userData.name[0]}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      {selectedTab === 'horoscopes' ? (
        <HoroscopesContent 
          userData={userData} 
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      ) : selectedTab === 'compatibility' ? (
        <SoulmateContent 
          userData={userData} 
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      ) : selectedTab === 'moon' ? (
        <LunaContent 
          userData={lunaUserData} 
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      ) : selectedTab === 'chat' ? (
        lunaRoomState === 'intro' ? (
          <LunaIntroScreen 
            userData={userData} 
            onEnterRoom={handleEnterLunaRoom}
          />
        ) : (
          <LunaChatContent 
            userData={userData} 
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            onBack={handleExitLunaRoom}
          />
        )
      ) : null}

      {/* Bottom Navigation - Pill Shape (hidden only in Luna chat room) */}
      {!(selectedTab === 'chat' && lunaRoomState === 'chat') && (
        <Animated.View 
          style={[
            styles.bottomNavContainer,
            {
              opacity: navBarOpacity,
              transform: [{ translateY: navBarTranslateY }]
            }
          ]}
        >
        <View style={styles.pillNavBar}>
          {/* Animated Background Indicator */}
          <Animated.View 
            style={[
              styles.navIndicator,
              {
                transform: [{
                  translateX: navIndicatorAnim.interpolate({
                    inputRange: [0, 1, 2, 3],
                    outputRange: [0, (width * 0.95 - 8) / 4, (width * 0.95 - 8) / 2, (width * 0.95 - 8) * 3 / 4], // 95% width calculation
                  })
                }]
              }
            ]}
          />
          
          {/* Navigation Items */}
          <TouchableOpacity 
            style={styles.pillNavItem}
            onPress={() => handleTabPress('horoscopes')}
          >
            <View style={[
              styles.navIconContainer,
              selectedTab === 'horoscopes' && styles.navIconContainerActive
            ]}>
              <Image 
                source={require('../../assets/tarot.png')} 
                style={[
                  styles.navIconImage,
                  selectedTab === 'horoscopes' && styles.navIconImageActive
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={[
              styles.navTitle,
              selectedTab === 'horoscopes' && styles.navTitleActive
            ]}>
              Horoscopes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pillNavItem}
            onPress={() => handleTabPress('moon')}
          >
            <View style={[
              styles.navIconContainer,
              selectedTab === 'moon' && styles.navIconContainerActive
            ]}>
              <Image 
                source={require('../../assets/moon (1).png')} 
                style={[
                  styles.navIconImage,
                  selectedTab === 'moon' && styles.navIconImageActive
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={[
              styles.navTitle,
              selectedTab === 'moon' && styles.navTitleActive
            ]}>
              Cosmos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pillNavItem}
            onPress={() => handleTabPress('compatibility')}
          >
            <View style={[
              styles.navIconContainer,
              selectedTab === 'compatibility' && styles.navIconContainerActive
            ]}>
              <Image 
                source={require('../../assets/love.png')} 
                style={[
                  styles.navIconImage,
                  selectedTab === 'compatibility' && styles.navIconImageActive
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={[
              styles.navTitle,
              selectedTab === 'compatibility' && styles.navTitleActive
            ]}>
              Soulmate
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pillNavItem}
            onPress={() => handleTabPress('chat')}
          >
            <View style={[
              styles.navIconContainer,
              selectedTab === 'chat' && styles.navIconContainerActive
            ]}>
              <Image 
                source={require('../../assets/girl.png')} 
                style={[
                  styles.navIconImage,
                  selectedTab === 'chat' && styles.navIconImageActive
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={[
              styles.navTitle,
              selectedTab === 'chat' && styles.navTitleActive
            ]}>
              Luna
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    color: AppColors.onSurface,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    color: AppColors.onSurface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  streakText: {
    color: AppColors.cosmicGold,
    fontSize: 14,
    fontWeight: '600',
  },
  mainHoroscopeCard: {
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 180,
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
    backgroundColor: AppColors.glassCardBackground,
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  mainCardGradient: {
    padding: 24,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  zodiacHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zodiacSign: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
  cosmicRating: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  stars: {
    fontSize: 14,
  },
  fullHoroscopeText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    lineHeight: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    color: AppColors.onSurface,
    fontWeight: '700',
    flex: 1,
  },
  zodiacBadge: {
    backgroundColor: 'rgba(166, 108, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  zodiacText: {
    color: AppColors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  horoscopePreview: {
    fontSize: 16,
    color: AppColors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: 'rgba(166, 108, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: AppColors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  timePeriodsContainer: {
    marginBottom: 20,
  },
  timePeriodCard: {
    backgroundColor: AppColors.glassCardBackground,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 100,
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
    alignItems: 'center',
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  timePeriodActive: {
    backgroundColor: 'rgba(166, 108, 255, 0.2)',
    borderColor: 'rgba(166, 108, 255, 0.4)',
  },
  timePeriodInactive: {
    backgroundColor: AppColors.surface,
  },
  timePeriodTitle: {
    color: AppColors.onSurface,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timePeriodSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },
  categoriesCard: {
    backgroundColor: AppColors.glassCardBackground,
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  categoriesTitle: {
    fontSize: 18,
    color: AppColors.onSurface,
    fontWeight: '700',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    color: AppColors.onSurface,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 16,
  },
  categoryArrow: {
    color: AppColors.secondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  highlightsCard: {
    backgroundColor: AppColors.glassCardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  highlightsTitle: {
    fontSize: 18,
    color: AppColors.onSurface,
    fontWeight: '700',
    marginBottom: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 14,
    color: AppColors.onSurface,
    fontWeight: '600',
    marginBottom: 2,
  },
  highlightText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  historyCard: {
    backgroundColor: AppColors.glassCardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    color: AppColors.onSurface,
    fontWeight: '700',
  },
  historyViewAll: {
    color: AppColors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 14,
    color: AppColors.onSurface,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyTimestamp: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  zodiacInsightsCard: {
    backgroundColor: AppColors.glassCardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  zodiacInsightsTitle: {
    fontSize: 18,
    color: AppColors.onSurface,
    fontWeight: '700',
    marginBottom: 16,
  },
  zodiacProfile: {
    marginBottom: 16,
  },
  zodiacProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  zodiacProfileSymbol: {
    fontSize: 32,
    marginRight: 12,
  },
  zodiacProfileInfo: {
    flex: 1,
  },
  zodiacProfileSign: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 2,
  },
  zodiacProfileElement: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  zodiacProfileDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  zodiacFeatures: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  zodiacFeature: {
    flex: 1,
    marginRight: 12,
  },
  zodiacFeatureTitle: {
    fontSize: 12,
    color: AppColors.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  zodiacFeatureText: {
    fontSize: 11,
    color: AppColors.textSecondary,
    lineHeight: 16,
  },
  zodiacExtras: {
    flexDirection: 'row',
  },
  zodiacExtra: {
    flex: 1,
    marginRight: 12,
  },
  zodiacExtraTitle: {
    fontSize: 12,
    color: AppColors.cosmicGold,
    fontWeight: '600',
    marginBottom: 4,
  },
  zodiacExtraText: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  moonCard: {
    flexDirection: 'row',
    backgroundColor: AppColors.glassCardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  moonVisual: {
    marginRight: 16,
  },
  moonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonEmoji: {
    fontSize: 40,
  },
  moonContent: {
    flex: 1,
  },
  moonTitle: {
    fontSize: 18,
    color: AppColors.onSurface,
    fontWeight: '700',
    marginBottom: 4,
  },
  moonSign: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  moonDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  moonCTA: {
    backgroundColor: AppColors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  moonCTAText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionCard: {
    backgroundColor: AppColors.glassCardBackground,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
    alignItems: 'center',
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  eventsCard: {
    backgroundColor: AppColors.glassCardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
    shadowColor: AppColors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  eventsTitle: {
    fontSize: 18,
    color: AppColors.onSurface,
    fontWeight: '700',
    marginBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    color: AppColors.onSurface,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  eventsCTA: {
    backgroundColor: 'rgba(166, 108, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  eventsCTAText: {
    color: AppColors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  premiumCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumGradient: {
    padding: 20,
  },
  premiumTitle: {
    fontSize: 18,
    color: AppColors.cosmicGold,
    fontWeight: '700',
    marginBottom: 8,
  },
  premiumFeatures: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 16,
  },
  premiumCTA: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  premiumCTAGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  premiumCTAText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 130,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    height: 110,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
  pillNavBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11, 11, 47, 0.95)',
    borderRadius: 25,
    padding: 4,
    width: '95%',
    alignSelf: 'center',
    alignItems: "center",
    height: 70,
    position: 'relative',
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
    shadowColor: AppColors.purpleGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  navIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: (width * 0.95 - 8) / 4, // 95% width minus pill padding, divided by 4 tabs
    height: 62,
    backgroundColor: AppColors.cosmicGold,
    borderRadius: 21,
    shadowColor: AppColors.goldGlow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  pillNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 62,
    zIndex: 2,
    paddingHorizontal: 4,
  },
  navIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  navIconContainerActive: {
    // Active state handled by the animated indicator
  },
  navIconImage: {
    width: 26,
    height: 26,
  },
  navIconImageActive: {
    width: 26,
    height: 26,
  },
  navTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Cinzel_400Regular',
    textAlign: 'center',
    lineHeight: 13,
  },
  navTitleActive: {
    color: '#000000',
    fontFamily: 'Cinzel_700Bold',
  },
});

export default HomeScreen;
