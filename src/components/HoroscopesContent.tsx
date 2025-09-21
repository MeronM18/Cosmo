import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Animated,
  Image,
  Alert,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';
import { AppColors } from '../theme/appTheme';
import BirthChartWidget from './BirthChartWidget';
import TransitsDisplay from './TransitsDisplay';
import EducationalAstrology from './EducationalAstrology';
import LifeAreas from './LifeAreas';
import PlanetaryChart from './PlanetaryChart';
import CosmicJourney from './CosmicJourney';
import ReadingHistory from './ReadingHistory';
import IOS17HoroscopesContent from './ios17/IOS17HoroscopesContent';
import IOS17TestComponent from './ios17/IOS17TestComponent';
import { horoscopesStateManager, HoroscopesState, HoroscopeData, CompletedReading } from '../services/horoscopesState';
import { HoroscopesAPI, APIError, isSameDay } from '../services/horoscopesAPI';
import { StreakManager, MoodTracker, AchievementManager } from '../services/trackingService';
import { PremiumService } from '../services/premiumService';
import { NotificationService } from '../services/notificationService';
import { HoroscopeGenerator } from '../services/horoscopeGenerator';

const { width, height } = Dimensions.get('window');

interface HoroscopesContentProps {
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
  onScroll?: (event: any) => void;
}

const HoroscopesContent: React.FC<HoroscopesContentProps> = ({ userData, onScroll }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  // State management
  const [state, setState] = useState<HoroscopesState>(horoscopesStateManager.getState());
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('Today');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAchievement, setShowAchievement] = useState<any>(null);
  const [showReadingHistory, setShowReadingHistory] = useState(false);
  const [useIOS17Design, setUseIOS17Design] = useState(true); // Toggle for iOS 17 design
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const parallaxAnim = useRef(new Animated.Value(0)).current;
  
  // Animation values for entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const timePeriods = ['Yesterday', 'Today', 'Tomorrow', 'This Week', 'This Month', '3 Months'];
  

  const planetaryData = [
    { name: 'Sun', symbol: 'SUN', sign: 'Scorpio', house: 1, isRetrograde: false, influence: 'Personal power and vitality', color: '#FFD700' },
    { name: 'Moon', symbol: 'MOON', sign: 'Cancer', house: 4, isRetrograde: false, influence: 'Emotional patterns and instincts', color: '#E8E8E8' },
    { name: 'Mercury', symbol: 'MERC', sign: 'Sagittarius', house: 2, isRetrograde: true, influence: 'Communication and mental processes', color: '#FFA500' },
    { name: 'Venus', symbol: 'VEN', sign: 'Libra', house: 1, isRetrograde: false, influence: 'Love, beauty, and relationships', color: '#FF69B4' },
    { name: 'Mars', symbol: 'MARS', sign: 'Capricorn', house: 9, isRetrograde: false, influence: 'Action, energy, and drive', color: '#FF4500' },
  ];

  // Sample birth chart data
  const birthChartPlanets = [
    { name: 'Sun', symbol: '☉', angle: 45, house: 1, sign: 'Scorpio', isRetrograde: false },
    { name: 'Moon', symbol: '☽', angle: 120, house: 4, sign: 'Cancer', isRetrograde: false },
    { name: 'Mercury', symbol: '☿', angle: 60, house: 2, sign: 'Sagittarius', isRetrograde: true },
    { name: 'Venus', symbol: '♀', angle: 30, house: 1, sign: 'Libra', isRetrograde: false },
    { name: 'Mars', symbol: '♂', angle: 270, house: 9, sign: 'Capricorn', isRetrograde: false },
  ];

  // Sample transits data
  const transitsData = [
    {
      id: '1',
      planet: 'Mercury',
      symbol: '☿',
      fromSign: 'Sagittarius',
      toSign: 'Capricorn',
      progress: 75,
      startDate: 'Dec 1',
      endDate: 'Dec 20',
      influence: 'Communication becomes more structured and practical',
      intensity: 'medium' as const
    },
    {
      id: '2',
      planet: 'Venus',
      symbol: '♀',
      fromSign: 'Libra',
      toSign: 'Scorpio',
      progress: 30,
      startDate: 'Dec 10',
      endDate: 'Jan 5',
      influence: 'Relationships deepen with emotional intensity',
      intensity: 'high' as const
    },
    {
      id: '3',
      planet: 'Mars',
      symbol: '♂',
      fromSign: 'Capricorn',
      toSign: 'Aquarius',
      progress: 90,
      startDate: 'Nov 15',
      endDate: 'Dec 25',
      influence: 'Action-oriented energy shifts to innovative approaches',
      intensity: 'low' as const
    }
  ];

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = horoscopesStateManager.subscribe((newState) => {
      console.log('🔄 State updated:', {
        today: newState.horoscopes.today ? 'Has data' : 'No data',
        loading: newState.isLoading
      });
      setState(newState);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      parallaxAnim.setValue(value * 0.5);
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, []);

  // Initialize data on mount
  useEffect(() => {
    initializeHoroscopesData();
  }, []);

  // Auto-refresh daily content
  useEffect(() => {
    const checkForNewDay = setInterval(() => {
      const now = new Date();
      const lastUpdate = state.horoscopes.today?.metadata.generatedAt;
      
      if (lastUpdate && !isSameDay(now, new Date(lastUpdate))) {
        handlePeriodChange('Today');
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(checkForNewDay);
  }, [state.horoscopes.today]);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Initialize horoscopes data
  const initializeHoroscopesData = async () => {
    try {
      console.log('🔄 Initializing horoscopes data...');
      horoscopesStateManager.setLoading(true);
      
      // Use mock data instead of API call
      const mockHoroscope = {
        id: 'mock-today',
        content: {
          main: `The stars align in your favor today, ${state.user.zodiacSign}. Trust your intuition as it guides you toward meaningful connections and personal growth. Your emotional depth serves you well, allowing you to see beyond surface appearances.`,
          categories: {
            love: 'Your heart is open to new possibilities today. Trust your instincts in matters of the heart.',
            career: 'A new opportunity may present itself. Be ready to take action when the moment arrives.',
            health: 'Focus on balance and moderation. Your body will thank you for the extra care.',
            growth: 'This is a perfect time for self-reflection and personal development.',
            social: 'Your social connections are evolving beautifully. Trust the process.',
            spirituality: 'Your spiritual journey is deepening. Take time for meditation and reflection.'
          },
          cosmicEnergy: 4,
          luckyElements: {
            color: '#6B46C1', // Deep Purple
            number: 7,
            time: 'Evening',
            direction: 'North'
          },
          keyPlanets: ['Venus', 'Mercury'],
          mood: 'optimistic',
          wordOfDay: 'Harmony'
        },
        metadata: {
          generatedAt: new Date(),
          period: 'today',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        }
      };
      
      horoscopesStateManager.setHoroscope('today', mockHoroscope);
      console.log('✅ Mock horoscope data set successfully');
      
      // Update reading streak
      let newAchievements: any[] = [];
      try {
        const streakResult = await StreakManager.updateStreak(state.user.zodiacSign);
        horoscopesStateManager.updateTracking({ readingStreak: streakResult.streak });
        newAchievements = streakResult.newAchievements || [];
        console.log('✅ Streak updated successfully');
      } catch (streakError) {
        console.log('⚠️ Streak update failed:', streakError);
        // Continue without streak update
      }
      
      // Show new achievements
      try {
        if (newAchievements && newAchievements.length > 0) {
          setShowAchievement(newAchievements[0]);
          await NotificationService.sendAchievementNotification(newAchievements[0]);
          console.log('✅ Achievement notification sent');
        }
      } catch (achievementError) {
        console.log('⚠️ Achievement handling failed:', achievementError);
        // Continue without achievement handling
      }
      
    } catch (error) {
      console.error('Error initializing horoscopes data:', error);
      horoscopesStateManager.setError('Failed to load horoscope data');
    } finally {
      horoscopesStateManager.setLoading(false);
    }
  };

  // Handle time period change
  const handlePeriodChange = async (period: string) => {
    setIsLoading(true);
    setSelectedTimePeriod(period);
    
    try {
      const periodKey = period.toLowerCase().replace(' ', '') as keyof typeof state.horoscopes;
      
      // Use mock data instead of API call
      const mockHoroscope = {
        id: `mock-${periodKey}`,
        content: {
          main: `The cosmic energies are particularly strong for ${periodKey} readings, ${state.user.zodiacSign}. The universe has special messages for you during this time period. Trust in the guidance that comes your way.`,
          categories: {
            love: 'Your relationships are evolving beautifully. Trust the process.',
            career: 'New opportunities are on the horizon. Stay focused and ready.',
            health: 'Your well-being is a priority. Listen to your body\'s needs.',
            growth: 'Personal transformation is happening. Embrace the changes.',
            social: 'Your social connections are evolving beautifully. Trust the process.',
            spirituality: 'Your spiritual journey is deepening. Take time for meditation and reflection.'
          },
          cosmicEnergy: 3,
          luckyElements: {
            color: '#0EA5E9', // Sapphire Blue
            number: 3,
            time: 'Morning',
            direction: 'East'
          },
          keyPlanets: ['Jupiter', 'Saturn'],
          mood: 'hopeful',
          wordOfDay: 'Transformation'
        },
        metadata: {
          generatedAt: new Date(),
          period: periodKey,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        }
      };
      
      horoscopesStateManager.setHoroscope(periodKey, mockHoroscope);
      
      // Track event
      // AnalyticsService.trackEvent('period_changed', { from: selectedTimePeriod, to: period });
      
    } catch (error) {
      console.error('Error changing period:', error);
      Alert.alert('Error', 'Unable to load horoscope for this period');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimePeriodPress = (period: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handlePeriodChange(period);
  };

  // Handle category press with premium gating
  const handleCategoryPress = async (categoryId: string) => {
    // Check premium access for category breakdowns
    if (!PremiumService.checkAccess(state.user, 'category_breakdowns')) {
      await PremiumService.showPaywall('category_breakdowns');
      return;
    }
    
    console.log('Category pressed:', categoryId);
  };

  // Handle read full analysis
  const handleReadFullAnalysis = async () => {
    if (!PremiumService.checkAccess(state.user, 'extended_readings')) {
      await PremiumService.showPaywall('extended_readings');
      return;
    }
    
    setIsExpanded(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Handle share horoscope
  const handleShare = async () => {
    try {
      // Implement sharing functionality
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert('Share', 'Sharing functionality would be implemented here');
    } catch (error) {
      console.error('Error sharing horoscope:', error);
    }
  };

  // Handle save horoscope
  const handleSave = async () => {
    try {
      // Implement save functionality
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert('Saved', 'Reading saved to favorites');
    } catch (error) {
      console.error('Error saving horoscope:', error);
    }
  };

  // Handle mood tracking
  const handleMoodTracking = async (mood: number, accuracy: number) => {
    try {
      const { newAchievements, insights } = await MoodTracker.recordMood(
        state.user.zodiacSign,
        mood,
        accuracy,
        state.horoscopes.today?.id || ''
      );
      
      if (newAchievements.length > 0) {
        setShowAchievement(newAchievements[0]);
      }
      
      if (insights) {
        Alert.alert('Insight', insights);
      }
    } catch (error) {
      console.error('Error recording mood:', error);
    }
  };

  // Handle reading horoscope and updating streak
  const handleReadHoroscope = async () => {
    try {
      // Check if user has already read today
      const today = new Date();
      const hasReadToday = isSameDay(today, new Date(state.tracking.lastReadDate));
      
      if (hasReadToday) {
        console.log('User has already read today, no streak update needed');
        return;
      }

      // Always generate a new horoscope reading for today
      let newHoroscope;
      try {
        newHoroscope = HoroscopeGenerator.generatePersonalizedHoroscope(
          state.user,
          'today'
        );
        
        // Update horoscope in state
        horoscopesStateManager.setHoroscope('today', newHoroscope);
        console.log('Generated new horoscope:', newHoroscope.id);
      } catch (horoscopeError) {
        console.error('Error generating horoscope:', horoscopeError);
        // Create a fallback horoscope if generation fails
        newHoroscope = {
          id: `horoscope_${state.user.zodiacSign}_today_${today.toISOString().split('T')[0]}`,
          content: {
            main: `Today brings cosmic energy that enhances your ${state.user.zodiacSign} nature. Trust your intuition and embrace the opportunities that come your way.`,
            categories: {
              love: 'Your relationships benefit from open communication and understanding.',
              career: 'Professional opportunities align with your natural talents and ambitions.',
              health: 'Focus on balance and harmony in your physical and emotional well-being.',
              growth: 'This is an ideal time for personal development and spiritual growth.',
              social: 'Your social connections bring positive energy and support.',
              spirituality: 'Connect with your inner wisdom and higher purpose.'
            },
            cosmicEnergy: 4,
            luckyElements: {
              color: 'purple',
              number: 7,
              time: '3:00 PM',
              direction: 'North'
            },
            keyPlanets: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'],
            mood: 'optimistic',
            wordOfDay: 'manifest'
          },
          metadata: {
            generatedAt: today,
            period: 'today',
            expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        };
        horoscopesStateManager.setHoroscope('today', newHoroscope);
      }

      // Update streak using StreakManager
      const { streak, newAchievements } = await StreakManager.updateStreak(state.user.zodiacSign);
      
      // Create completed reading record with the generated horoscope
      const completedReading: CompletedReading = {
        id: `reading_${Date.now()}`,
        horoscopeId: newHoroscope.id,
        readDate: today,
        period: 'today'
      };

      // Add completed reading to history
      horoscopesStateManager.addCompletedReading(completedReading);
      console.log('Added completed reading to history:', completedReading.id);

      // Update the state with new streak
      horoscopesStateManager.updateTracking({
        ...state.tracking,
        readingStreak: streak,
        lastReadDate: today,
        achievements: [...state.tracking.achievements, ...newAchievements.map(a => a.id)]
      });
      
      if (newAchievements.length > 0) {
        setShowAchievement(newAchievements[0]);
      }
      
      console.log(`Streak updated to ${streak} days, reading added to history`);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  // Handle streak update from CosmicJourney component
  const handleStreakUpdate = (newStreak: number) => {
    horoscopesStateManager.updateTracking({
      ...state.tracking,
      readingStreak: newStreak,
      lastReadDate: new Date()
    });
  };

  // Handle updating reading ratings
  const handleUpdateReading = (readingId: string, updates: Partial<CompletedReading>) => {
    const updatedReadings = state.tracking.completedReadings.map(reading => 
      reading.id === readingId ? { ...reading, ...updates } : reading
    );
    
    horoscopesStateManager.updateTracking({
      ...state.tracking,
      completedReadings: updatedReadings
    });
  };

  // Test function to add sample readings (for testing purposes)
  const addSampleReading = () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // Generate sample horoscopes
    const todayHoroscope = HoroscopeGenerator.generatePersonalizedHoroscope(state.user, 'today');
    const yesterdayHoroscope = HoroscopeGenerator.generatePersonalizedHoroscope(state.user, 'yesterday');
    
    // Set horoscopes in state
    horoscopesStateManager.setHoroscope('today', todayHoroscope);
    horoscopesStateManager.setHoroscope('yesterday', yesterdayHoroscope);
    
    // Create sample completed readings
    const sampleReadings: CompletedReading[] = [
      {
        id: `reading_${Date.now()}`,
        horoscopeId: todayHoroscope.id,
        readDate: today,
        period: 'today',
        moodRating: 4,
        accuracyRating: 5,
        notes: 'Very accurate reading! The career advice was spot on.'
      },
      {
        id: `reading_${Date.now() + 1}`,
        horoscopeId: yesterdayHoroscope.id,
        readDate: yesterday,
        period: 'yesterday',
        moodRating: 3,
        accuracyRating: 4,
        notes: 'Good insights about relationships and personal growth.'
      }
    ];
    
    // Add readings to history
    sampleReadings.forEach(reading => {
      horoscopesStateManager.addCompletedReading(reading);
    });
    
    console.log('Added sample readings to history');
    Alert.alert('Success', 'Sample readings added to your history! Check the reading history to see them.');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={[styles.starIcon, i < rating && styles.starActive]}>
        ⭐
      </Text>
    ));
  };

  if (!fontsLoaded) {
    console.log('⏳ Fonts not loaded yet, showing content with fallback fonts');
    // Continue rendering with fallback fonts instead of returning null
  }

  console.log('📊 Current horoscopes state:', {
    today: state.horoscopes.today ? 'Has data' : 'No data',
    user: state.user.zodiacSign,
    loading: state.isLoading
  });
  
  console.log('🎯 About to render HoroscopesContent component');

  // Use iOS 17 design if enabled
  if (useIOS17Design) {
    return (
      <IOS17TestComponent />
    );
  }

  // Show loading state if data is still loading
  if (state.isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your cosmic guidance...</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll || Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* Animated Starfield Background */}
      <Animated.View 
        style={[
          styles.starfield,
          {
            transform: [{ translateY: parallaxAnim }]
          }
        ]}
      >
        {[...Array(30)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: Math.random() * 0.6 + 0.2,
              }
            ]}
          />
        ))}
      </Animated.View>

      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View style={styles.headerLeft}>
          <Text style={[styles.pageTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
            Horoscopes
          </Text>
          <View style={styles.zodiacBadge}>
            <Text style={styles.zodiacSymbol}>{userData.zodiacSymbol}</Text>
            <Text style={[styles.zodiacText, fontsLoaded ? { fontFamily: 'Cinzel_400Regular' } : { fontFamily: 'System' }]}>
              {userData.zodiacSign}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.designToggle}
          onPress={() => setUseIOS17Design(!useIOS17Design)}
        >
          <Text style={styles.designToggleText}>
            {useIOS17Design ? 'iOS 17' : 'Classic'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hero Section - Today's Main Reading Card */}
      <TouchableOpacity style={styles.heroCard} onPress={handleReadFullAnalysis}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.08)', 'rgba(139, 95, 191, 0.08)']}
          style={styles.heroGradient}
        >
          <View style={styles.heroHeader}>
            <View style={styles.zodiacHeader}>
              <Text style={styles.zodiacSymbolLarge}>{userData.zodiacSymbol}</Text>
              <Text style={[styles.zodiacSignLarge, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
                {userData.zodiacSign}
              </Text>
            </View>
            <View style={styles.cosmicRating}>
              <Text style={styles.ratingLabel}>Cosmic Energy</Text>
              <View style={styles.starsContainer}>
                {renderStars(state.horoscopes.today?.content.cosmicEnergy || userData.cosmicRating)}
              </View>
            </View>
          </View>
          
          <Text style={styles.heroTitle}>Today's Cosmic Guidance</Text>
          
          <Text style={styles.horoscopeText}>
            {state.horoscopes.today?.content.main || 
             `The stars align in your favor today, ${userData.name || 'dear star seeker'}. Your intuitive nature serves you well as you navigate through meaningful connections and personal growth opportunities. Trust your emotional depth to guide you beyond surface appearances and into the heart of what truly matters.`}
          </Text>

          <View style={styles.keyElementsRow}>
            <View style={styles.keyElement}>
              <View style={[styles.colorSwatch, { backgroundColor: state.horoscopes.today?.content.luckyElements.color || '#8B5CF6' }]} />
              <Text style={styles.keyElementText}>Lucky Color</Text>
            </View>
            <View style={styles.keyElement}>
              <Text style={styles.keyElementNumber}>{state.horoscopes.today?.content.luckyElements.number || 7}</Text>
              <Text style={styles.keyElementText}>Lucky Number</Text>
            </View>
            <View style={styles.keyElement}>
              <Text style={styles.keyElementIcon}>🧭</Text>
              <Text style={styles.keyElementText}>{state.horoscopes.today?.content.luckyElements.direction || 'North'}</Text>
            </View>
          </View>

          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.expandButton} onPress={handleReadFullAnalysis}>
              <Text style={styles.expandButtonText}>
                {isExpanded ? 'Read Less' : 'Read Full Analysis'}
              </Text>
              <Text style={styles.expandArrow}>{isExpanded ? '↑' : '→'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Text style={styles.actionButtonIcon}>📤</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Text style={styles.actionButtonIcon}>💾</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => {
                setShowReadingHistory(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.actionButtonIcon}>📚</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => {
                addSampleReading();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.actionButtonIcon}>🧪</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Time-Based Navigation Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.timeSelector}
        contentContainerStyle={styles.timeSelectorContent}
      >
        {timePeriods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.timePeriodButton,
              selectedTimePeriod === period && styles.timePeriodButtonActive
            ]}
            onPress={() => handleTimePeriodPress(period)}
          >
            <Text style={[
              styles.timePeriodText,
              selectedTimePeriod === period && styles.timePeriodTextActive
            ]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Life Category Breakdown Section */}
      <LifeAreas onCategoryPress={handleCategoryPress} />

      {/* Planetary Chart */}
      <PlanetaryChart 
        planets={planetaryData}
        onPlanetPress={(planet) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          console.log('Planet pressed:', planet.name);
        }}
      />

      {/* Birth Chart Widget */}
      <BirthChartWidget 
        planets={birthChartPlanets}
        onPlanetPress={(planet) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          console.log('Planet pressed:', planet.name);
        }}
      />

      {/* Current Transits Display */}
      <TransitsDisplay 
        transits={transitsData}
        onTransitPress={(transit) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          console.log('Transit pressed:', transit.planet);
        }}
      />

      {/* Educational Astrology Section */}
      <EducationalAstrology />

      {/* Cosmic Journey Section */}
      <CosmicJourney
        hasReadToday={isSameDay(new Date(), new Date(state.tracking.lastReadDate))}
        currentStreak={state.tracking.readingStreak}
        achievements={state.tracking.achievements}
        onReadHoroscope={handleReadHoroscope}
        onStreakUpdate={handleStreakUpdate}
      />

      {/* Reading History Modal */}
      {showReadingHistory && (
        <Modal
          visible={showReadingHistory}
          animationType="slide"
          onRequestClose={() => setShowReadingHistory(false)}
        >
          <View style={styles.historyModalContainer}>
            <View style={styles.historyModalHeader}>
              <Text style={[styles.historyModalTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
                Your Reading History
              </Text>
              <TouchableOpacity
                style={styles.historyCloseButton}
                onPress={() => setShowReadingHistory(false)}
              >
                <Text style={styles.historyCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ReadingHistory
              completedReadings={state.tracking.completedReadings}
              horoscopes={state.horoscopes}
              onUpdateReading={handleUpdateReading}
            />
          </View>
        </Modal>
      )}

      {/* Premium Features Teaser */}
      {!userData.isPremium && (
        <TouchableOpacity style={styles.premiumTeaser}>
          <LinearGradient
            colors={['rgba(255, 215, 0, 0.1)', 'rgba(255, 165, 0, 0.1)']}
            style={styles.premiumGradient}
          >
            <View style={styles.premiumHeader}>
              <View style={styles.signCircles}>
                <View style={styles.signCircle}>
                  <Text style={styles.signSymbol}>☉</Text>
                  <Text style={styles.signLabel}>Sun</Text>
                </View>
                <View style={styles.signCircle}>
                  <Text style={styles.signSymbol}>☽</Text>
                  <Text style={styles.signLabel}>Moon</Text>
                </View>
                <View style={styles.signCircle}>
                  <Text style={styles.signSymbol}>↑</Text>
                  <Text style={styles.signLabel}>Rising</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.premiumTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
              Unlock Your Complete Cosmic Profile
            </Text>
            <Text style={styles.premiumDescription}>
              Get your full birth chart reading with Sun, Moon, and Rising sign insights
            </Text>
            <TouchableOpacity style={styles.premiumCTA}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.premiumCTAGradient}
              >
                <Text style={styles.premiumCTAText}>Get Full Chart Reading</Text>
                <Text style={styles.sparkleIcon}>✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Bottom spacing for navigation */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
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
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    color: '#FFD700',
    fontWeight: '700',
    marginBottom: 8,
  },
  zodiacBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  zodiacSymbol: {
    fontSize: 16,
    marginRight: 6,
  },
  zodiacText: {
    color: '#B8A9C9',
    fontSize: 14,
    fontWeight: '600',
  },
  heroCard: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 240,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroGradient: {
    padding: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  zodiacHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zodiacSymbolLarge: {
    fontSize: 24,
    marginRight: 8,
  },
  zodiacSignLarge: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cosmicRating: {
    alignItems: 'flex-end',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#B8A9C9',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    fontSize: 14,
    marginRight: 2,
    opacity: 0.3,
  },
  starActive: {
    opacity: 1,
  },
  heroTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },
  horoscopeText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
  },
  keyElementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  keyElement: {
    alignItems: 'center',
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
  },
  keyElementNumber: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  keyElementIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  keyElementText: {
    fontSize: 12,
    color: '#B8A9C9',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(138, 79, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  expandButtonText: {
    color: '#8A4FFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  expandArrow: {
    color: '#8A4FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  moodTrackingCard: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  moodGradient: {
    padding: 16,
  },
  moodTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  moodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  moodButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  moodButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moodLabel: {
    fontSize: 12,
    color: '#B8A9C9',
    textAlign: 'center',
  },
  timeSelector: {
    marginBottom: 30,
  },
  timeSelectorContent: {
    paddingHorizontal: 4,
  },
  timePeriodButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timePeriodButtonActive: {
    backgroundColor: '#8A4FFF',
    borderColor: '#8A4FFF',
  },
  timePeriodText: {
    color: '#B8A9C9',
    fontSize: 14,
    fontWeight: '600',
  },
  timePeriodTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 16,
  },
  planetarySection: {
    marginBottom: 30,
  },
  retrogradeAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 167, 38, 0.2)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 167, 38, 0.3)',
  },
  retrogradeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  retrogradeText: {
    flex: 1,
    fontSize: 14,
    color: '#FFA726',
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
  },
  dismissIcon: {
    color: '#FFA726',
    fontSize: 16,
    fontWeight: 'bold',
  },
  planetaryScroll: {
    marginBottom: 16,
  },
  planetCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  planetGradient: {
    padding: 16,
  },
  planetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planetSymbol: {
    fontSize: 18,
    marginRight: 6,
  },
  planetName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  retrogradeIndicator: {
    fontSize: 10,
    color: '#FF6B9D',
    fontWeight: 'bold',
  },
  planetSign: {
    fontSize: 12,
    color: '#B8A9C9',
    marginBottom: 4,
  },
  planetDegree: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 8,
  },
  planetInfluence: {
    fontSize: 11,
    color: '#B8A9C9',
    lineHeight: 14,
  },
  trackingSection: {
    marginBottom: 30,
  },
  streakCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  streakGradient: {
    padding: 20,
    alignItems: 'center',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  streakTitle: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
  },
  streakNumber: {
    fontSize: 36,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    color: '#B8A9C9',
    marginBottom: 16,
  },
  achievementBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    fontSize: 24,
  },
  premiumTeaser: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumGradient: {
    padding: 20,
  },
  premiumHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  signCircles: {
    flexDirection: 'row',
    gap: 16,
  },
  signCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  signSymbol: {
    fontSize: 18,
    marginBottom: 2,
  },
  signLabel: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '600',
  },
  premiumTitle: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#B8A9C9',
    textAlign: 'center',
    marginBottom: 16,
  },
  premiumCTA: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  premiumCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  premiumCTAText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  sparkleIcon: {
    fontSize: 16,
  },
  bottomSpacing: {
    height: 130,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
  },
  // Reading History Modal Styles
  historyModalContainer: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyModalTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  historyCloseButton: {
    padding: 8,
  },
  historyCloseButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  designToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  designToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HoroscopesContent;
