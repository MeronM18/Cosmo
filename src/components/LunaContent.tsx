import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import { Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import * as Haptics from 'expo-haptics';
import { AppColors } from '../theme/appTheme';
import LunarService, { MoonPhaseData, MoonriseData, LunarEnergy, UserLocation } from '../services/lunarService';

const { width, height } = Dimensions.get('window');

interface LunaContentProps {
  userData: {
    name: string;
    zodiacSign: string;
    birthDate: Date;
    birthTime: Date;
    birthLocation: string;
    subscriptionLevel: 'free' | 'premium';
  };
  onScroll?: (event: any) => void;
}

const LunaContent: React.FC<LunaContentProps> = ({ userData, onScroll }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  // Initialize lunar service
  const lunarService = LunarService.getInstance();

  // Zodiac sign to image mapping
  const zodiacSignImages = {
    'Aries': require('../../assets/aries.png'),
    'Taurus': require('../../assets/taurus.png'),
    'Gemini': require('../../assets/gemini.png'),
    'Cancer': require('../../assets/cancer.png'),
    'Leo': require('../../assets/leo.png'),
    'Virgo': require('../../assets/virgo.png'),
    'Libra': require('../../assets/libra.png'),
    'Scorpio': require('../../assets/scorpio.png'),
    'Sagittarius': require('../../assets/sagittarius.png'),
    'Capricorn': require('../../assets/capricorn.png'),
    'Aquarius': require('../../assets/aquarius.png'),
    'Pisces': require('../../assets/pisces.png'),
  };

  // State for real lunar data
  const [currentMoonPhase, setCurrentMoonPhase] = useState<MoonPhaseData | null>(null);
  const [moonriseMoonset, setMoonriseMoonset] = useState<MoonriseData | null>(null);
  const [lunarEnergy, setLunarEnergy] = useState<LunarEnergy | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const moonRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load lunar data
    loadLunarData();

    // Entrance animations
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

    // Continuous moon rotation
    Animated.loop(
      Animated.timing(moonRotateAnim, {
        toValue: 1,
        duration: 24000, // 24 seconds for full rotation
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Load real lunar data
  const loadLunarData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Force real GPS detection
      const success = await lunarService.forceRealGPSDetection();
      
      if (!success) {
        throw new Error('Failed to detect your real GPS location. Please check your device location settings and try again.');
      }

      // Get user location after successful GPS detection
      const location = lunarService.getUserLocation();
      setUserLocation(location);
      setLocationPermissionGranted(true);

      if (!location) {
        throw new Error('Unable to determine your location. Please check your device location settings and try again.');
      }

      // Get real moon phase data
      const moonPhaseData = lunarService.getMoonPhaseData(selectedDate);
      setCurrentMoonPhase(moonPhaseData);

      // Get moonrise/moonset data (with fallback if no location)
      try {
        const moonriseData = lunarService.getMoonriseData(selectedDate);
        setMoonriseMoonset(moonriseData);
      } catch (error) {
        // Provide fallback data when location is not available
        const fallbackMoonriseData = {
          moonrise: 'Location required',
          moonset: 'Location required',
          nextMoonrise: 'Location required',
          moonriseDate: null,
          moonsetDate: null,
        };
        setMoonriseMoonset(fallbackMoonriseData);
      }

      // Calculate lunar energy
      const energyData = lunarService.getLunarEnergy(moonPhaseData);
      setLunarEnergy(energyData);

    } catch (error) {
      console.error('Error loading lunar data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load lunar data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Retry location detection
  const retryLocationDetection = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Force real GPS detection
      const success = await lunarService.forceRealGPSDetection();
      
      if (success) {
        // Update state with real location
        const location = lunarService.getUserLocation();
        setUserLocation(location);
        setLocationPermissionGranted(true);
        
        // Get fresh lunar data with real coordinates
        const moonPhaseData = lunarService.getMoonPhaseData(selectedDate);
        const energyData = lunarService.getLunarEnergy(moonPhaseData);
        
        setCurrentMoonPhase(moonPhaseData);
        setLunarEnergy(energyData);
        
        // Get moonrise/moonset data (with fallback if no location)
        try {
          const moonriseData = lunarService.getMoonriseData(selectedDate);
          setMoonriseMoonset(moonriseData);
        } catch (error) {
          // Provide fallback data when location is not available
          const fallbackMoonriseData = {
            moonrise: 'Location required',
            moonset: 'Location required',
            nextMoonrise: 'Location required',
            moonriseDate: null,
            moonsetDate: null,
          };
          setMoonriseMoonset(fallbackMoonriseData);
        }
      } else {
        setError('Failed to detect real GPS location. Please check your device location settings.');
      }
    } catch (error) {
      console.error('Retry GPS detection failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to detect real GPS location.');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data when selected date changes
  useEffect(() => {
    if (currentMoonPhase && !isLoading) {
      // Only reload if we have data and not currently loading
      const moonPhaseData = lunarService.getMoonPhaseData(selectedDate);
      const energyData = lunarService.getLunarEnergy(moonPhaseData);
      
      setCurrentMoonPhase(moonPhaseData);
      setLunarEnergy(energyData);
      
      // Get moonrise/moonset data (with fallback if no location)
      try {
        const moonriseData = lunarService.getMoonriseData(selectedDate);
        setMoonriseMoonset(moonriseData);
      } catch (error) {
        // Provide fallback data when location is not available
        const fallbackMoonriseData = {
          moonrise: 'Location required',
          moonset: 'Location required',
          nextMoonrise: 'Location required',
          moonriseDate: null,
          moonsetDate: null,
        };
        setMoonriseMoonset(fallbackMoonriseData);
      }
    }
  }, [selectedDate]);

  const handleCardPress = (cardId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const handleDateSelect = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(date);
  };

  // Helper function to get moon phase emoji
  const getMoonPhaseEmoji = (phase: string): string => {
    const phaseEmojis = {
      'New Moon': '🌑',
      'Waxing Crescent': '🌒',
      'First Quarter': '🌓',
      'Waxing Gibbous': '🌔',
      'Full Moon': '🌕',
      'Waning Gibbous': '🌖',
      'Last Quarter': '🌗',
      'Waning Crescent': '🌘',
    };
    return phaseEmojis[phase as keyof typeof phaseEmojis] || '🌑';
  };

  const moonRotation = moonRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Circular Progress Component for Illumination
  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const size = 80;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.circularProgressContainer}>
        <Svg width={size} height={size} style={styles.circularProgressSvg}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FFD700"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        
        {/* Percentage text in center */}
        <View style={styles.circularProgressTextContainer}>
          <Text style={styles.circularProgressPercentage}>
            {percentage}%
          </Text>
          <Text style={styles.circularProgressLabel}>
            illuminated
          </Text>
        </View>
      </View>
    );
  };

  const renderMoonPhase = () => {
    if (!currentMoonPhase) return null;

    const phaseData = {
      'New Moon': { emoji: '🌑', color: '#2F2F2F' },
      'Waxing Crescent': { emoji: '🌒', color: '#4A4A4A' },
      'First Quarter': { emoji: '🌓', color: '#6B6B6B' },
      'Waxing Gibbous': { emoji: '🌔', color: '#8B8B8B' },
      'Full Moon': { emoji: '🌕', color: '#F5F5DC' },
      'Waning Gibbous': { emoji: '🌖', color: '#8B8B8B' },
      'Last Quarter': { emoji: '🌗', color: '#6B6B6B' },
      'Waning Crescent': { emoji: '🌘', color: '#4A4A4A' },
    };

    const currentPhase = phaseData[currentMoonPhase.phase as keyof typeof phaseData] || phaseData['Full Moon'];

    return (
      <View style={styles.moonPhaseContainer}>
        <Animated.View 
          style={[
            styles.moonVisualization,
            { 
              transform: [{ rotate: moonRotation }],
              backgroundColor: currentPhase.color,
            }
          ]}
        >
          <Text style={styles.moonEmoji}>{currentPhase.emoji}</Text>
        </Animated.View>
        
        <View style={styles.moonDataCard}>
          <Text style={[styles.phaseName, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
            {currentMoonPhase.phase}
          </Text>
          
          <View style={styles.illuminationContainer}>
            <CircularProgress percentage={currentMoonPhase.illumination} />
          </View>

          <Text style={styles.countdownText}>
            {currentMoonPhase.daysUntilNext > 0 && `${currentMoonPhase.daysUntilNext} day${currentMoonPhase.daysUntilNext !== 1 ? 's' : ''}`}
            {currentMoonPhase.daysUntilNext > 0 && currentMoonPhase.hoursUntilNext > 0 && ' '}
            {currentMoonPhase.hoursUntilNext > 0 && `${currentMoonPhase.hoursUntilNext} hour${currentMoonPhase.hoursUntilNext !== 1 ? 's' : ''}`}
            {' until '}{currentMoonPhase.nextPhase}
          </Text>

          <View style={styles.zodiacPosition}>
            <View style={styles.zodiacContainer}>
              <Text style={styles.zodiacText}>
                Moon in {currentMoonPhase.zodiacPosition}
              </Text>
              <Image 
                source={zodiacSignImages[currentMoonPhase.zodiacSymbol as keyof typeof zodiacSignImages]} 
                style={styles.zodiacImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.elementText}>
              {currentMoonPhase.element} Element
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderLunarCalendar = () => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      // Get real moon phase for this specific date
      const moonPhaseData = lunarService.getMoonPhaseData(date);
      const moonPhaseEmoji = getMoonPhaseEmoji(moonPhaseData.phase);
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isToday && styles.todayHighlight,
            isSelected && styles.selectedDay
          ]}
          onPress={() => handleDateSelect(date)}
        >
          <Text style={[styles.dayNumber, isToday && styles.todayText]}>
            {day}
          </Text>
          <Text style={styles.moonPhaseIcon}>
            {moonPhaseEmoji}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.calendarContainer}>
        <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
          Lunar Calendar
        </Text>
        <View style={styles.calendarGrid}>
          {days}
        </View>
      </View>
    );
  };

  const renderLunarDashboard = () => {
    if (!lunarEnergy) return null;

    return (
      <View style={styles.dashboardContainer}>
        <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
          Lunar Influence
        </Text>
        
        <View style={styles.energyGaugeContainer}>
          <View style={styles.energyGauge}>
            <View style={styles.gaugeBackground} />
            <View 
              style={[
                styles.gaugeFill,
                { 
                  width: `${(lunarEnergy.level / 10) * 100}%`,
                  backgroundColor: lunarEnergy.level > 7 ? AppColors.cosmicGold : 
                                 lunarEnergy.level > 4 ? '#8A4FFF' : '#4FC3F7'
                }
              ]} 
            />
            <Text style={styles.energyLevel}>{lunarEnergy.level}/10</Text>
          </View>
          <Text style={styles.energyMood}>{lunarEnergy.mood}</Text>
          <Text style={styles.energyRecommendation}>{lunarEnergy.recommendation}</Text>
        </View>

        <View style={styles.recommendationsGrid}>
          <TouchableOpacity style={[styles.recommendationCard, styles.doCard]}>
            <Text style={styles.recommendationIcon}>✅</Text>
            <Text style={styles.recommendationTitle}>Do Today</Text>
            <Text style={styles.recommendationText}>Meditation & Reflection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.recommendationCard, styles.avoidCard]}>
            <Text style={styles.recommendationIcon}>⚠️</Text>
            <Text style={styles.recommendationTitle}>Avoid Today</Text>
            <Text style={styles.recommendationText}>Major Decisions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.recommendationCard, styles.meditationCard]}>
            <Text style={styles.recommendationIcon}>🧘</Text>
            <Text style={styles.recommendationTitle}>Meditation Focus</Text>
            <Text style={styles.recommendationText}>Release & Let Go</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.recommendationCard, styles.ritualCard]}>
            <Text style={styles.recommendationIcon}>🕯️</Text>
            <Text style={styles.recommendationTitle}>Ritual Suggestion</Text>
            <Text style={styles.recommendationText}>Moon Water Charging</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMoonriseTimeline = () => {
    if (!moonriseMoonset) return null;

    return (
      <View style={styles.timelineContainer}>
        <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
          Moonrise & Moonset
        </Text>
        
        {!locationPermissionGranted && (
          <View style={styles.permissionNotice}>
            <Text style={styles.permissionNoticeText}>
              ⚠️ Location permission needed for accurate times
            </Text>
          </View>
        )}
        
        <View style={styles.timelineCard}>
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineEmoji}>🌅</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Moonrise</Text>
              <Text style={styles.timelineTime}>{moonriseMoonset.moonrise}</Text>
            </View>
          </View>
          
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineEmoji}>🌇</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Moonset</Text>
              <Text style={styles.timelineTime}>{moonriseMoonset.moonset}</Text>
            </View>
          </View>
          
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineEmoji}>🌙</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Next Moonrise</Text>
              <Text style={styles.timelineTime}>{moonriseMoonset.nextMoonrise}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderRitualGuidance = () => {
    const ritualCards = [
      {
        id: 'moon-water',
        title: 'Moon Water Charging',
        phase: 'Waning Gibbous',
        icon: '🌊',
        color: '#4FC3F7',
        steps: [
          'Fill a clear glass jar with filtered water',
          'Place under moonlight for 3-4 hours',
          'Set intention for releasing and letting go',
          'Store in refrigerator and use within 3 days'
        ],
        description: 'Perfect for releasing negative energy and emotional cleansing during the waning phase.'
      },
      {
        id: 'meditation',
        title: 'Lunar Meditation',
        phase: 'All Phases',
        icon: '🧘‍♀️',
        color: '#8A4FFF',
        steps: [
          'Find a quiet space with moonlight visibility',
          'Light a white or silver candle',
          'Focus on your breath for 5 minutes',
          'Visualize lunar energy filling your body',
          'Set intentions for the lunar cycle'
        ],
        description: 'Connect with lunar energy through guided meditation and intention setting.'
      },
      {
        id: 'crystal-charging',
        title: 'Crystal Charging',
        phase: 'Full Moon',
        icon: '💎',
        color: AppColors.cosmicGold,
        steps: [
          'Cleanse crystals with sage or salt water',
          'Arrange in a circle under moonlight',
          'Leave overnight for maximum charging',
          'Retrieve at sunrise for balanced energy'
        ],
        description: 'Charge your crystals with powerful lunar energy during the full moon.'
      }
    ];

    return (
      <View style={styles.ritualContainer}>
        <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
          Ritual Guidance
        </Text>
        
        {ritualCards.map((ritual) => (
          <TouchableOpacity
            key={ritual.id}
            style={[
              styles.ritualCard,
              { borderColor: ritual.color },
              expandedCard === ritual.id && styles.expandedRitualCard
            ]}
            onPress={() => handleCardPress(ritual.id)}
          >
            <View style={styles.ritualHeader}>
              <View style={styles.ritualIconContainer}>
                <Text style={styles.ritualIcon}>{ritual.icon}</Text>
              </View>
              <View style={styles.ritualTitleContainer}>
                <Text style={[styles.ritualTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
                  {ritual.title}
                </Text>
                <Text style={styles.ritualPhase}>{ritual.phase}</Text>
              </View>
              <Text style={styles.expandIcon}>
                {expandedCard === ritual.id ? '−' : '+'}
              </Text>
            </View>
            
            <Text style={styles.ritualDescription}>
              {ritual.description}
            </Text>
            
            {expandedCard === ritual.id && (
              <View style={styles.ritualSteps}>
                <Text style={[styles.stepsTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
                  Steps:
                </Text>
                {ritual.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: ritual.color }]}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.cosmicGold} />
        <Text style={styles.loadingText}>Loading lunar data...</Text>
        {!locationPermissionGranted && (
          <Text style={styles.permissionText}>
            Location permission needed for accurate moonrise/moonset times
          </Text>
        )}
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🌙</Text>
        <Text style={styles.errorTitle}>Unable to Load Lunar Data</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        
        <TouchableOpacity style={styles.retryButton} onPress={retryLocationDetection}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No data state
  if (!currentMoonPhase || !moonriseMoonset || !lunarEnergy) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🌙</Text>
        <Text style={styles.errorTitle}>No Lunar Data Available</Text>
        <Text style={styles.errorMessage}>Please check your connection and try again.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadLunarData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Page Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.pageTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
              Moon Phase Today
            </Text>
            <View style={styles.moonPhaseBadge}>
              <Text style={styles.badgeIcon}>🌖</Text>
              <Text style={styles.badgeText}>{currentMoonPhase.phase}</Text>
            </View>
            {userLocation && (
              <Text style={styles.locationText}>
                📍 {userLocation.city || 'Current Location'}
              </Text>
            )}
            {!userLocation && locationPermissionGranted && (
              <Text style={styles.locationText}>
                📍 Location detected
              </Text>
            )}
            {!locationPermissionGranted && (
              <Text style={styles.locationText}>
                📍 Location permission needed
              </Text>
            )}
          </View>
        </View>

        {/* Hero Section - Moon Phase Display */}
        {renderMoonPhase()}

        {/* Lunar Calendar */}
        {renderLunarCalendar()}

        {/* Moonrise/Moonset Timeline */}
        {renderMoonriseTimeline()}

        {/* Lunar Influence Dashboard */}
        {renderLunarDashboard()}

        {/* Ritual Guidance Section */}
        {renderRitualGuidance()}

        {/* Bottom spacing */}
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    color: AppColors.cosmicGold,
    marginBottom: 8,
  },
  moonPhaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#B8A9C9',
    fontFamily: 'Montserrat_600SemiBold',
  },
  moonPhaseContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  moonVisualization: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: AppColors.cosmicGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  moonEmoji: {
    fontSize: 120,
  },
  moonDataCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
  },
  phaseName: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  illuminationContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  circularProgressContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressSvg: {
    position: 'absolute',
  },
  circularProgressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    fontFamily: 'Montserrat_700Bold',
  },
  circularProgressLabel: {
    fontSize: 10,
    color: '#B8A9C9',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 2,
  },
  countdownText: {
    fontSize: 14,
    color: '#B8A9C9',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  zodiacPosition: {
    alignItems: 'center',
  },
  zodiacText: {
    fontSize: 16,
    color: AppColors.cosmicGold,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4,
  },
  elementText: {
    fontSize: 12,
    color: '#B8A9C9',
    fontFamily: 'Montserrat_400Regular',
  },
  sectionTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  calendarContainer: {
    marginBottom: 40,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 8,
  },
  calendarDay: {
    width: (width - 56) / 7,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
  },
  todayHighlight: {
    borderWidth: 2,
    borderColor: AppColors.cosmicGold,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  selectedDay: {
    backgroundColor: 'rgba(138, 79, 255, 0.2)',
  },
  dayNumber: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 2,
  },
  todayText: {
    color: AppColors.cosmicGold,
  },
  moonPhaseIcon: {
    fontSize: 12,
  },
  timelineContainer: {
    marginBottom: 40,
  },
  timelineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineEmoji: {
    fontSize: 20,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#B8A9C9',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
  },
  dashboardContainer: {
    marginBottom: 40,
  },
  energyGaugeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  energyGauge: {
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 8,
    position: 'relative',
  },
  gaugeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 10,
  },
  energyLevel: {
    fontSize: 16,
    color: AppColors.cosmicGold,
    fontFamily: 'Montserrat_700Bold',
    marginTop: 8,
  },
  energyMood: {
    fontSize: 14,
    color: '#B8A9C9',
    fontFamily: 'Montserrat_600SemiBold',
  },
  recommendationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recommendationCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
    alignItems: 'center',
  },
  doCard: {
    borderColor: '#4CAF50',
  },
  avoidCard: {
    borderColor: '#F44336',
  },
  meditationCard: {
    borderColor: '#8A4FFF',
  },
  recommendationIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  recommendationText: {
    fontSize: 12,
    color: '#B8A9C9',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
  ritualContainer: {
    marginBottom: 40,
  },
  ritualCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: AppColors.glassCardBorder,
  },
  expandedRitualCard: {
    borderColor: AppColors.cosmicGold,
  },
  ritualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ritualIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ritualIcon: {
    fontSize: 24,
  },
  ritualTitleContainer: {
    flex: 1,
  },
  ritualTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ritualPhase: {
    fontSize: 12,
    color: '#B8A9C9',
    fontFamily: 'Montserrat_400Regular',
  },
  expandIcon: {
    fontSize: 24,
    color: AppColors.cosmicGold,
    fontWeight: 'bold',
  },
  ritualDescription: {
    fontSize: 14,
    color: '#B8A9C9',
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
  },
  ritualSteps: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepsTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#B8A9C9',
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
  },
  zodiacContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  zodiacImage: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.cosmicGold,
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    color: AppColors.cosmicGold,
    fontFamily: 'Cinzel_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: AppColors.cosmicGold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 16,
    color: AppColors.background,
    fontFamily: 'Montserrat_600SemiBold',
  },
  // Location and Permission Styles
  locationText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    marginTop: 4,
  },
  permissionNotice: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  permissionNoticeText: {
    fontSize: 12,
    color: '#FFC107',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
  },
  energyRecommendation: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  // Test Location Button
  testLocationButton: {
    backgroundColor: AppColors.cosmicGold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  testLocationButtonText: {
    fontSize: 14,
    color: AppColors.background,
    fontFamily: 'Montserrat_600SemiBold',
  },
});

export default LunaContent;
