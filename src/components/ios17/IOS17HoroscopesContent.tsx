import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { iOS17Theme } from '../../theme/ios17Theme';
import IOS17HoroscopeCard from './IOS17HoroscopeCard';
import IOS17SegmentedControl from './IOS17SegmentedControl';
import IOS17LifeAreas from './IOS17LifeAreas';
import IOS17CosmicContext from './IOS17CosmicContext';
import IOS17ActivityTracking from './IOS17ActivityTracking';
import ReadingHistory from '../ReadingHistory';
import { horoscopesStateManager, HoroscopesState, CompletedReading } from '../../services/horoscopesState';
import { isSameDay } from '../../services/horoscopesAPI';
import { StreakManager } from '../../services/trackingService';
import { HoroscopeGenerator } from '../../services/horoscopeGenerator';
import { PremiumService } from '../../services/premiumService';

const { width, height } = Dimensions.get('window');

interface IOS17HoroscopesContentProps {
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

const IOS17HoroscopesContent: React.FC<IOS17HoroscopesContentProps> = ({ userData, onScroll }) => {
  // State management
  const [state, setState] = useState<HoroscopesState>(horoscopesStateManager.getState());
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('Today');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReadingHistory, setShowReadingHistory] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const timePeriods = ['Yesterday', 'Today', 'Tomorrow', 'This Week', 'This Month', '3 Months'];

  // Sample data for cosmic context
  const planetaryData = [
    { name: 'Sun', symbol: '☉', sign: 'Scorpio', house: 1, isRetrograde: false, influence: 'Personal power and vitality', color: '#FFD700', progress: 75 },
    { name: 'Moon', symbol: '☽', sign: 'Cancer', house: 4, isRetrograde: false, influence: 'Emotional patterns and instincts', color: '#E8E8E8', progress: 60 },
    { name: 'Mercury', symbol: '☿', sign: 'Sagittarius', house: 2, isRetrograde: true, influence: 'Communication and mental processes', color: '#FFA500', progress: 45 },
    { name: 'Venus', symbol: '♀', sign: 'Libra', house: 1, isRetrograde: false, influence: 'Love, beauty, and relationships', color: '#FF69B4', progress: 80 },
    { name: 'Mars', symbol: '♂', sign: 'Capricorn', house: 9, isRetrograde: false, influence: 'Action, energy, and drive', color: '#FF4500', progress: 90 },
  ];

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
      setState(newState);
    });
    return unsubscribe;
  }, []);

  // Initialize data on mount
  useEffect(() => {
    initializeHoroscopesData();
  }, []);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: iOS17Theme.animationDurations.normal,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        ...iOS17Theme.springConfigs.gentle,
      }),
    ]).start();
  }, []);

  // Initialize horoscopes data
  const initializeHoroscopesData = async () => {
    try {
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
            color: '#8A4FFF',
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
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      };
      
      horoscopesStateManager.setHoroscope('today', mockHoroscope);
      
      // Update reading streak
      try {
        const streakResult = await StreakManager.updateStreak(state.user.zodiacSign);
        horoscopesStateManager.updateTracking({ readingStreak: streakResult.streak });
      } catch (streakError) {
        console.log('⚠️ Streak update failed:', streakError);
      }
      
    } catch (error) {
      console.error('Error initializing horoscopes data:', error);
      horoscopesStateManager.setError('Failed to load horoscope data');
    } finally {
      horoscopesStateManager.setLoading(false);
    }
  };

  // Handle time period change
  const handlePeriodChange = async (index: number, period: string) => {
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
            color: '#4FC3F7',
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
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      };
      
      horoscopesStateManager.setHoroscope(periodKey, mockHoroscope);
      
    } catch (error) {
      console.error('Error changing period:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category press with premium gating
  const handleCategoryPress = async (categoryId: string) => {
    if (!PremiumService.checkAccess(state.user, 'category_breakdowns')) {
      await PremiumService.showPaywall('category_breakdowns');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle read full analysis
  const handleReadFullAnalysis = async () => {
    if (!PremiumService.checkAccess(state.user, 'extended_readings')) {
      await PremiumService.showPaywall('extended_readings');
      return;
    }
    
    setIsExpanded(!isExpanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Handle share horoscope
  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Implement sharing functionality
    } catch (error) {
      console.error('Error sharing horoscope:', error);
    }
  };

  // Handle save horoscope
  const handleSave = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Implement save functionality
    } catch (error) {
      console.error('Error saving horoscope:', error);
    }
  };

  // Handle reading horoscope and updating streak
  const handleReadHoroscope = async () => {
    try {
      const today = new Date();
      const hasReadToday = isSameDay(today, new Date(state.tracking.lastReadDate));
      
      if (hasReadToday) {
        return;
      }

      // Generate new horoscope reading
      let newHoroscope;
      try {
        newHoroscope = HoroscopeGenerator.generatePersonalizedHoroscope(
          state.user,
          'today'
        );
        horoscopesStateManager.setHoroscope('today', newHoroscope);
      } catch (horoscopeError) {
        console.error('Error generating horoscope:', horoscopeError);
        // Create fallback horoscope
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

      // Update streak
      const { streak, newAchievements } = await StreakManager.updateStreak(state.user.zodiacSign);
      
      // Create completed reading record
      const completedReading: CompletedReading = {
        id: `reading_${Date.now()}`,
        horoscopeId: newHoroscope.id,
        readDate: today,
        period: 'today'
      };

      horoscopesStateManager.addCompletedReading(completedReading);

      // Update tracking state
      horoscopesStateManager.updateTracking({
        ...state.tracking,
        readingStreak: streak,
        lastReadDate: today,
        achievements: [...state.tracking.achievements, ...newAchievements.map(a => a.id)]
      });
      
    } catch (error) {
      console.error('Error updating streak:', error);
    }
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

  // Show loading state if data is still loading
  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <BlurView
          intensity={20}
          tint="systemMaterial"
          style={styles.loadingBlurView}
        >
          <Text style={styles.loadingText}>Loading your cosmic guidance...</Text>
        </BlurView>
      </View>
    );
  }

  const currentHoroscope = state.horoscopes.today;

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
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll || Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <IOS17HoroscopeCard
          zodiacSign={userData.zodiacSign}
          zodiacSymbol={userData.zodiacSymbol}
          cosmicEnergy={currentHoroscope?.content.cosmicEnergy || userData.cosmicRating}
          mainReading={currentHoroscope?.content.main || 
            `The stars align in your favor today, ${userData.name || 'dear star seeker'}. Your intuitive nature serves you well as you navigate through meaningful connections and personal growth opportunities.`}
          luckyElements={currentHoroscope?.content.luckyElements || {
            color: '#8A4FFF',
            number: 7,
            time: 'Evening',
            direction: 'North'
          }}
          wordOfDay={currentHoroscope?.content.wordOfDay || 'Harmony'}
          onReadFullAnalysis={handleReadFullAnalysis}
          onShare={handleShare}
          onSave={handleSave}
          onShowHistory={() => {
            setShowReadingHistory(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          isExpanded={isExpanded}
        />

        {/* Time Period Selector */}
        <IOS17SegmentedControl
          segments={timePeriods}
          selectedIndex={timePeriods.indexOf(selectedTimePeriod)}
          onSegmentChange={handlePeriodChange}
        />

        {/* Life Areas */}
        <IOS17LifeAreas onCategoryPress={handleCategoryPress} />

        {/* Cosmic Context */}
        <IOS17CosmicContext
          planets={planetaryData}
          transits={transitsData}
          onPlanetPress={(planet) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          onTransitPress={(transit) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        />

        {/* Activity Tracking */}
        <IOS17ActivityTracking
          currentStreak={state.tracking.readingStreak}
          hasReadToday={isSameDay(new Date(), new Date(state.tracking.lastReadDate))}
          achievements={state.tracking.achievements}
          onReadHoroscope={handleReadHoroscope}
          onStreakUpdate={(newStreak) => {
            horoscopesStateManager.updateTracking({
              ...state.tracking,
              readingStreak: newStreak,
              lastReadDate: new Date()
            });
          }}
        />

        {/* Bottom spacing for navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Reading History Modal */}
      {showReadingHistory && (
        <Modal
          visible={showReadingHistory}
          animationType="slide"
          onRequestClose={() => setShowReadingHistory(false)}
        >
          <View style={styles.historyModalContainer}>
            <BlurView
              intensity={20}
              tint="systemMaterial"
              style={styles.historyModalBlurView}
            >
              <View style={styles.historyModalHeader}>
                <Text style={styles.historyModalTitle}>Your Reading History</Text>
                <TouchableOpacity
                  style={styles.historyCloseButton}
                  onPress={() => setShowReadingHistory(false)}
                >
                  <Text style={styles.historyCloseButtonText}>{iOS17Theme.symbols.xmark}</Text>
                </TouchableOpacity>
              </View>
              <ReadingHistory
                completedReadings={state.tracking.completedReadings}
                horoscopes={state.horoscopes}
                onUpdateReading={handleUpdateReading}
              />
            </BlurView>
          </View>
        </Modal>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: iOS17Theme.colors.systemGroupedBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: iOS17Theme.spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: iOS17Theme.colors.systemGroupedBackground,
  },
  loadingBlurView: {
    paddingHorizontal: iOS17Theme.spacing.xl,
    paddingVertical: iOS17Theme.spacing.lg,
    borderRadius: iOS17Theme.cornerRadius.large,
    alignItems: 'center',
  },
  loadingText: {
    ...iOS17Theme.typography.headline,
    color: iOS17Theme.colors.label,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
  historyModalContainer: {
    flex: 1,
    backgroundColor: iOS17Theme.colors.systemGroupedBackground,
  },
  historyModalBlurView: {
    flex: 1,
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: iOS17Theme.colors.separator,
  },
  historyModalTitle: {
    ...iOS17Theme.typography.title2,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  historyCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: iOS17Theme.colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCloseButtonText: {
    fontSize: 16,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
});

export default IOS17HoroscopesContent;
