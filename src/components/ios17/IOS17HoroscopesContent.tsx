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
import IOS17LuckyElements from './IOS17LuckyElements';
import IOS17ZodiacExperience from './IOS17ZodiacExperience';
import ReadingHistory from '../ReadingHistory';
import IOS17AstroJournal from './IOS17AstroJournal';
import IOS17CelestialEvents from './IOS17CelestialEvents';
import IOS17DailyRituals from './IOS17DailyRituals';
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
  // Simplified state management - no loading states
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('Daily');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadingHistory, setShowReadingHistory] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start visible
  const slideAnim = useRef(new Animated.Value(0)).current; // Start in position

  const timePeriods = ['Daily', 'Weekly', 'Yearly'];


  // No state subscriptions or initialization delays - render immediately

  // Generate zodiac-specific lucky elements
  const getZodiacLuckyElements = (zodiacSign: string) => {
    const luckyElementsMap: Record<string, any> = {
      'Aries': {
        color: '#FF6B6B', // Deep Coral - Fire element
        number: 9,
        time: 'Morning',
        direction: 'East',
        gemstone: 'Ruby'
      },
      'Taurus': {
        color: '#4ECDC4', // Turquoise - Earth element
        number: 6,
        time: 'Afternoon',
        direction: 'North',
        gemstone: 'Emerald'
      },
      'Gemini': {
        color: '#45B7D1', // Ocean Blue - Air element
        number: 5,
        time: 'Evening',
        direction: 'West',
        gemstone: 'Aquamarine'
      },
      'Cancer': {
        color: '#96CEB4', // Sage Green - Water element
        number: 2,
        time: 'Night',
        direction: 'North',
        gemstone: 'Moonstone'
      },
      'Leo': {
        color: '#FFEAA7', // Golden Yellow - Fire element
        number: 1,
        time: 'Morning',
        direction: 'South',
        gemstone: 'Citrine'
      },
      'Virgo': {
        color: '#DDA0DD', // Soft Purple - Earth element
        number: 3,
        time: 'Afternoon',
        direction: 'North',
        gemstone: 'Peridot'
      },
      'Libra': {
        color: '#98D8C8', // Mint Green - Air element
        number: 7,
        time: 'Evening',
        direction: 'West',
        gemstone: 'Rose Quartz'
      },
      'Scorpio': {
        color: '#F7DC6F', // Warm Yellow - Water element
        number: 8,
        time: 'Night',
        direction: 'South',
        gemstone: 'Topaz'
      },
      'Sagittarius': {
        color: '#BB8FCE', // Lavender Purple - Fire element
        number: 9,
        time: 'Morning',
        direction: 'East',
        gemstone: 'Turquoise'
      },
      'Capricorn': {
        color: '#85C1E9', // Sky Blue - Earth element
        number: 10,
        time: 'Afternoon',
        direction: 'North',
        gemstone: 'Garnet'
      },
      'Aquarius': {
        color: '#F8C471', // Peach - Air element
        number: 11,
        time: 'Evening',
        direction: 'West',
        gemstone: 'Amethyst'
      },
      'Pisces': {
        color: '#82E0AA', // Light Green - Water element
        number: 12,
        time: 'Night',
        direction: 'North',
        gemstone: 'Aquamarine'
      }
    };

    return luckyElementsMap[zodiacSign] || {
      color: '#8A4FFF',
      number: 7,
      time: 'Evening',
      direction: 'North',
      gemstone: 'Clear Quartz'
    };
  };

  // Static horoscope data for immediate rendering - no async operations
  const getHoroscopeData = (period: string) => {
    const zodiacLuckyElements = getZodiacLuckyElements(userData.zodiacSign);
    
    const baseContent = {
      categories: {
        love: 'Your relationships are evolving beautifully. Trust the process.',
        career: 'New opportunities are on the horizon. Stay focused and ready.',
        health: 'Your well-being is a priority. Listen to your body\'s needs.',
        growth: 'Personal transformation is happening. Embrace the changes.',
        social: 'Your social connections are evolving beautifully. Trust the process.',
        spirituality: 'Your spiritual journey is deepening. Take time for meditation and reflection.'
      },
      cosmicEnergy: 4,
      luckyElements: zodiacLuckyElements,
      keyPlanets: ['Venus', 'Mercury'],
      mood: 'optimistic',
      wordOfDay: 'Harmony'
    };

    let mainText = '';
    switch (period) {
      case 'Daily':
        mainText = `The stars align in your favor today, ${userData.zodiacSign}. Trust your intuition as it guides you toward meaningful connections and personal growth. Your emotional depth serves you well, allowing you to see beyond surface appearances.`;
        break;
      case 'Weekly':
        mainText = `This week brings powerful cosmic energy for ${userData.zodiacSign}. The universe is aligning to support your goals and dreams. Trust in the process and stay open to new opportunities that may arise.`;
        break;
      case 'Yearly':
        mainText = `This year holds tremendous potential for transformation and growth, ${userData.zodiacSign}. The cosmic energies are supporting your journey toward greater wisdom and fulfillment. Embrace the changes ahead with confidence.`;
        break;
      default:
        mainText = `The cosmic energies are particularly strong for ${period.toLowerCase()} readings, ${userData.zodiacSign}. The universe has special messages for you during this time period. Trust in the guidance that comes your way.`;
    }

    return {
      id: period.toLowerCase(),
      content: {
        main: mainText,
        ...baseContent
      },
      metadata: {
        generatedAt: new Date(),
        period: period.toLowerCase(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    };
  };

  const staticHoroscopeData = getHoroscopeData(selectedTimePeriod);

  // Handle time period change - immediate response
  const handlePeriodChange = (index: number, period: string) => {
    setSelectedTimePeriod(period);
    // No async operations - just update the selected period
  };

  // Create a compatible user object for premium service
  const compatibleUser = {
    ...userData,
    birthDate: new Date(),
    birthTime: new Date(),
    birthLocation: 'Unknown',
    subscriptionLevel: userData.isPremium ? 'premium' as const : 'free' as const
  };

  // Handle category press with premium gating
  const handleCategoryPress = async (categoryId: string) => {
    if (!PremiumService.checkAccess(compatibleUser, 'category_breakdowns')) {
      await PremiumService.showPaywall('category_breakdowns');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle read full analysis
  const handleReadFullAnalysis = async () => {
    if (!PremiumService.checkAccess(compatibleUser, 'extended_readings')) {
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

  // Simplified handlers for immediate rendering
  const handleReadHoroscope = () => {
    // Simple haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUpdateReading = (readingId: string, updates: Partial<CompletedReading>) => {
    // Simple handler - no state updates needed for immediate rendering
    console.log('Update reading:', readingId, updates);
  };

  // Use static data - no loading states
  const currentHoroscope = staticHoroscopeData;

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
        <View style={styles.heroSectionSpacing}>
          <IOS17HoroscopeCard
            zodiacSign={userData.zodiacSign}
            mainReading={currentHoroscope?.content.main || 
              `The stars align in your favor today, ${userData.name || 'dear star seeker'}. Your intuitive nature serves you well as you navigate through meaningful connections and personal growth opportunities.`}
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
        </View>

        {/* Time Period Selector */}
        <View style={styles.sectionSpacing}>
          <IOS17SegmentedControl
            segments={timePeriods}
            selectedIndex={timePeriods.indexOf(selectedTimePeriod)}
            onSegmentChange={handlePeriodChange}
          />
        </View>

        {/* Lucky Elements */}
        <View style={styles.sectionSpacing}>
          <IOS17LuckyElements
            luckyElements={currentHoroscope?.content.luckyElements || {
              color: '#8A4FFF',
              number: 7,
              time: 'Evening',
              direction: 'North'
            }}
          />
        </View>

        {/* Zodiac Experience */}
        <View style={styles.sectionSpacing}>
          <IOS17ZodiacExperience
            userZodiacSign={userData.zodiacSign}
            onSignPress={(sign) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              console.log('Zodiac sign pressed:', sign.name);
            }}
          />
        </View>

        {/* Life Areas */}
        <View style={styles.lifeAreasSpacing}>
          <IOS17LifeAreas 
            onCategoryPress={handleCategoryPress} 
            userZodiacSign={userData.zodiacSign}
          />
        </View>

        {/* Astro Journal */}
        <IOS17AstroJournal
          userData={userData}
          selectedTimePeriod={selectedTimePeriod}
        />

        {/* Celestial Events */}
        <IOS17CelestialEvents
          userData={userData}
          selectedTimePeriod={selectedTimePeriod}
        />

        {/* Daily Rituals */}
        <IOS17DailyRituals
          userData={userData}
          selectedTimePeriod={selectedTimePeriod}
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
                completedReadings={[]}
                horoscopes={{ 
                  today: staticHoroscopeData,
                  yesterday: null,
                  tomorrow: null,
                  weekly: selectedTimePeriod === 'Weekly' ? staticHoroscopeData : null,
                  monthly: null,
                  cached: []
                }}
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
    paddingBottom: iOS17Theme.spacing.xs,
  },
  heroSectionSpacing: {
    marginTop: iOS17Theme.spacing.lg,
    marginBottom: iOS17Theme.spacing.xs,
  },
  sectionSpacing: {
    marginTop: iOS17Theme.spacing.lg,
    marginBottom: iOS17Theme.spacing.lg,
  },
  lifeAreasSpacing: {
    marginTop: iOS17Theme.spacing.xs,
    marginBottom: iOS17Theme.spacing.lg,
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
    ...iOS17Theme.text.sectionTitle,
    marginBottom: 0,
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
    fontWeight: '600' as const,
  },
});

export default IOS17HoroscopesContent;
