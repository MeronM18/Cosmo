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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import { Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import * as Haptics from 'expo-haptics';
import { AppColors } from '../theme/appTheme';

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
}

const LunaContent: React.FC<LunaContentProps> = ({ userData }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  // Zodiac sign to image mapping
  const zodiacSignImages = {
    '♈': require('../../assets/aries.png'),
    '♉': require('../../assets/taurus.png'),
    '♊': require('../../assets/gemini.png'),
    '♋': require('../../assets/cancer.png'),
    '♌': require('../../assets/leo.png'),
    '♍': require('../../assets/virgo.png'),
    '♎': require('../../assets/libra.png'),
    '♏': require('../../assets/scorpio.png'),
    '♐': require('../../assets/sagittarius.png'),
    '♑': require('../../assets/capricorn.png'),
    '♒': require('../../assets/aquarius.png'),
    '♓': require('../../assets/pisces.png'),
  };

  const [currentMoonPhase, setCurrentMoonPhase] = useState({
    phase: 'Waning Gibbous',
    illumination: 73,
    daysUntilNext: 2,
    hoursUntilNext: 14,
    zodiacPosition: 'Virgo',
    zodiacSymbol: '♍',
    element: 'Earth'
  });

  const [moonriseMoonset, setMoonriseMoonset] = useState({
    moonrise: '8:42 PM',
    moonset: '10:15 AM',
    nextMoonrise: '9:28 PM'
  });

  const [lunarEnergy, setLunarEnergy] = useState({
    level: 7.2,
    mood: 'Reflective',
    recommendation: 'Perfect time for introspection and releasing what no longer serves you.'
  });

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const moonRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  const handleCardPress = (cardId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const handleDateSelect = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(date);
  };

  const moonRotation = moonRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderMoonPhase = () => {
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
            <View style={styles.progressRing}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${currentMoonPhase.illumination}%`,
                    backgroundColor: AppColors.cosmicGold 
                  }
                ]} 
              />
            </View>
            <Text style={styles.illuminationText}>
              {currentMoonPhase.illumination}% illuminated
            </Text>
          </View>

          <Text style={styles.countdownText}>
            {currentMoonPhase.daysUntilNext} days {currentMoonPhase.hoursUntilNext} hours until Last Quarter
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
      
      // Mock moon phase for each day (in real app, calculate actual phases)
      const moonPhases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
      const phaseIndex = day % 8;
      
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
            {moonPhases[phaseIndex]}
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
    return (
      <View style={styles.timelineContainer}>
        <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
          Moonrise & Moonset
        </Text>
        
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
      >
        {/* Page Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.pageTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
              Luna
            </Text>
            <View style={styles.moonPhaseBadge}>
              <Text style={styles.badgeIcon}>🌖</Text>
              <Text style={styles.badgeText}>{currentMoonPhase.phase}</Text>
            </View>
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
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 40,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  illuminationText: {
    fontSize: 14,
    color: '#B8A9C9',
    fontFamily: 'Montserrat_600SemiBold',
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
});

export default LunaContent;
