import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Animated,
  TextInput,
  Alert,
  Image,
  PanResponder,
  Modal,
  Platform,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColors } from '../theme/appTheme';
import { CompatibilityService, BirthData, CompatibilityResult } from '../services/compatibilityService';

const { width, height } = Dimensions.get('window');

interface SoulmateContentProps {
  userData: {
    name: string;
    zodiacSign: string;
    isPremium: boolean;
    readingStreak: number;
    cosmicRating: number;
    luckyNumbers: number[];
    compatibleSigns: string[];
  };
  onScroll?: (event: any) => void;
}

const SoulmateContent: React.FC<SoulmateContentProps> = ({ userData, onScroll }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  // State management
  const [partnerData, setPartnerData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const birthdayFieldRef = useRef<View | null>(null);
  const [calendarPos, setCalendarPos] = useState<{ x: number; y: number; width: number }>({ x: 16, y: 200, width: 300 });
  const [relationshipType, setRelationshipType] = useState('dating');
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedConnections, setSavedConnections] = useState<any[]>([]);
  const [currentInsightType, setCurrentInsightType] = useState<'current' | 'daily' | 'weekly' | 'transitBased'>('current');
  const [insightRotationTimer, setInsightRotationTimer] = useState<NodeJS.Timeout | null>(null);
  
  
  // ScrollView reference for auto-scroll functionality
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Smooth slide down to results function - enhanced for streamlined UX
  const scrollToResults = () => {
    try {
      if (scrollViewRef.current) {
        // Smooth slide down to show results below the form
        // Calculate position to show form + results together
        scrollViewRef.current.scrollTo({ 
          y: 600, // Adjusted to show form and beginning of results
          animated: true 
        });
        
        // Add a subtle haptic feedback for the scroll
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 300);
      }
    } catch (error) {
      console.error('Error in scrollToResults:', error);
    }
  };

  // Reset form to fresh state for new analysis - with defensive programming
  const resetFormForNewAnalysis = () => {
    try {
      // Clear results first to prevent memory issues
      setCompatibilityResult(null);
      
      // Batch state updates to prevent rapid re-renders
      setTimeout(() => {
        setPartnerData({
          name: '',
          birthDate: '',
          birthTime: '',
          birthLocation: ''
        });
        
        setIsAnalyzing(false);
        setShowLoadingScreen(false);
        setRelationshipType('dating');
      }, 0);
      
      // Clear any loading intervals safely
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      
      // Reset scroll position to top of compatibility check section
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      }, 100);
      
      // Haptic feedback for reset action
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error in resetFormForNewAnalysis:', error);
    }
  };

  // Streamlined new analysis function for clean UX
  const startNewCompatibilityCheck = () => {
    try {
      // Clear previous results immediately
      setCompatibilityResult(null);
      
      // Reset all form data
      setPartnerData({ 
        name: '', 
        birthDate: '', 
        birthTime: '', 
        birthLocation: '' 
      });
      
      // Reset UI state
      setCurrentView('checker');
      setIsAnalyzing(false);
      setShowLoadingScreen(false);
      setRelationshipType('dating');
      
      // Clear any loading intervals safely
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      
      // Scroll to top for new input
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      }, 100);
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
    } catch (error) {
      console.error('Error in startNewCompatibilityCheck:', error);
    }
  };
  const [compatibilityHistory, setCompatibilityHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSynastryChart, setShowSynastryChart] = useState(false);
  const [currentView, setCurrentView] = useState('checker'); // checker, results, history, chart
  // Loading overlay state (full-screen)
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate zodiac sign from birth date
  const getZodiacSign = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    return 'Pisces';
  };

  // Generate simplified compatibility insights (3-4 concise points)
  const generateSimpleInsights = (userZodiac: string, partnerZodiac: string, overallScore: number): string[] => {
    const insights: string[] = [];
    
    // Communication insight based on elements
    const userElement = getZodiacElement(userZodiac);
    const partnerElement = getZodiacElement(partnerZodiac);
    
    if (userElement === partnerElement) {
      insights.push("Communication flows naturally between you two");
    } else if (isCompatibleElements(userElement, partnerElement)) {
      insights.push("Your different perspectives create interesting conversations");
    } else {
      insights.push("Communication requires patience and understanding");
    }
    
    // Emotional insight based on compatibility score
    if (overallScore >= 75) {
      insights.push("Your emotional energies complement each other well");
    } else if (overallScore >= 55) {
      insights.push("Emotional connection grows stronger with time");
    } else if (overallScore >= 40) {
      insights.push("Different emotional styles create learning opportunities");
    } else {
      insights.push("Emotional understanding requires patience and effort");
    }
    
    // Dynamic insight based on zodiac traits
    if (isTensionCreatingPair(userZodiac, partnerZodiac)) {
      insights.push("Some differences that create interesting tension");
    } else {
      insights.push("Natural harmony in your core approaches to life");
    }
    
    // Long-term potential insight
    if (overallScore >= 70) {
      insights.push("Strong foundation for long-term connection");
    } else if (overallScore >= 50) {
      insights.push("Relationship potential grows with mutual effort");
    } else if (overallScore >= 35) {
      insights.push("Friendship foundation supports any relationship type");
    } else {
      insights.push("Connection works best with clear communication");
    }
    
    return insights.slice(0, 4); // Maximum 4 insights
  };

  // Helper function to get compatibility color based on percentage
  const getCompatibilityColor = (percentage: number): [string, string] => {
    if (percentage >= 90) return ['#00FF00', '#32CD32']; // Bright Green
    if (percentage >= 80) return ['#32CD32', '#7CFC00']; // Lime Green
    if (percentage >= 70) return ['#7CFC00', '#ADFF2F']; // Green Yellow
    if (percentage >= 60) return ['#ADFF2F', '#FFFF00']; // Yellow
    if (percentage >= 50) return ['#FFFF00', '#FFD700']; // Gold
    if (percentage >= 40) return ['#FFD700', '#FFA500']; // Orange
    if (percentage >= 30) return ['#FFA500', '#FF8C00']; // Dark Orange
    if (percentage >= 20) return ['#FF8C00', '#FF4500']; // Orange Red
    return ['#FF0000', '#DC143C']; // Red (0-19%)
  };

  // Helper function to get zodiac element
  const getZodiacElement = (sign: string): string => {
    const elements = {
      'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
      'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
      'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
      'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    };
    return elements[sign as keyof typeof elements] || 'Unknown';
  };

  // Helper function to check element compatibility
  const isCompatibleElements = (element1: string, element2: string): boolean => {
    const compatible = {
      'Fire': ['Air', 'Fire'],
      'Earth': ['Water', 'Earth'],
      'Air': ['Fire', 'Air'],
      'Water': ['Earth', 'Water']
    };
    return compatible[element1 as keyof typeof compatible]?.includes(element2) || false;
  };

  // Helper function to identify tension-creating pairs
  const isTensionCreatingPair = (sign1: string, sign2: string): boolean => {
    const tensionPairs = [
      ['Aries', 'Cancer'], ['Aries', 'Capricorn'],
      ['Taurus', 'Leo'], ['Taurus', 'Aquarius'],
      ['Gemini', 'Virgo'], ['Gemini', 'Pisces'],
      ['Cancer', 'Libra'], ['Cancer', 'Aries'],
      ['Leo', 'Scorpio'], ['Leo', 'Taurus'],
      ['Virgo', 'Sagittarius'], ['Virgo', 'Gemini'],
      ['Libra', 'Capricorn'], ['Libra', 'Cancer'],
      ['Scorpio', 'Aquarius'], ['Scorpio', 'Leo'],
      ['Sagittarius', 'Pisces'], ['Sagittarius', 'Virgo'],
      ['Capricorn', 'Aries'], ['Capricorn', 'Libra'],
      ['Aquarius', 'Taurus'], ['Aquarius', 'Scorpio'],
      ['Pisces', 'Gemini'], ['Pisces', 'Sagittarius']
    ];
    
    return tensionPairs.some(pair => 
      (pair[0] === sign1 && pair[1] === sign2) || 
      (pair[0] === sign2 && pair[1] === sign1)
    );
  };

  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [backgroundParticles, setBackgroundParticles] = useState<any[]>([]);
  const starfieldRef = useRef<{ bg: Array<{ left: number; top: number }>; mid: Array<{ left: number; top: number }>; fg: Array<{ left: number; top: number }>; }>({ bg: [], mid: [], fg: [] });
  const [shootingStars, setShootingStars] = useState<any[]>([]);
  const [breathingPhase, setBreathingPhase] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const heartPulseAnim = useRef(new Animated.Value(1)).current;
  const compatibilityAnim = useRef(new Animated.Value(0)).current;
  const parallaxAnim1 = useRef(new Animated.Value(0)).current;
  const parallaxAnim2 = useRef(new Animated.Value(0)).current;
  const parallaxAnim3 = useRef(new Animated.Value(0)).current;
  const breathingAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const quantumAnim = useRef(new Animated.Value(0)).current;
  const hologramAnim = useRef(new Animated.Value(0)).current;
  const sphereRotateX = useRef(new Animated.Value(0)).current;
  const sphereRotateY = useRef(new Animated.Value(0)).current;
  const constellationAnim = useRef(new Animated.Value(0)).current;

  // Loading overlay rotating messages
  const loadingMessages = [
    'Calculating planetary alignments…',
    'Analyzing cosmic compatibility…',
    'Reading the stars for your connection…',
    'Mapping celestial influences…',
    'Revealing your cosmic bond…'
  ];

  useEffect(() => {
    if (showLoadingScreen) {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 1200);
    } else if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
      setLoadingMessageIndex(0);
    }
    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    };
  }, [showLoadingScreen]);

  // Comprehensive cleanup function
  const cleanupAnalysis = () => {
    // Clear loading states
    setIsAnalyzing(false);
    setShowLoadingScreen(false);
    setLoadingMessageIndex(0);
    
    // Clear intervals and timers
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
    if (insightRotationTimer) {
      clearTimeout(insightRotationTimer);
      setInsightRotationTimer(null);
    }
  };

  // Memory cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      cleanupAnalysis();
    };
  }, []);

  // Insight rotation effect
  useEffect(() => {
    if (compatibilityResult && compatibilityResult.dynamicInsights) {
      // Clear any existing timer first
      if (insightRotationTimer) {
        clearTimeout(insightRotationTimer);
      }

      // Start rotation timer
      const timer = setTimeout(() => {
        const types: Array<'current' | 'daily' | 'weekly' | 'transitBased'> = ['current', 'daily', 'weekly', 'transitBased'];
        const currentIndex = types.indexOf(currentInsightType);
        const nextIndex = (currentIndex + 1) % types.length;
        setCurrentInsightType(types[nextIndex]);
      }, 8000); // Rotate every 8 seconds

      setInsightRotationTimer(timer);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [compatibilityResult?.dynamicInsights, currentInsightType]); // Remove insightRotationTimer from dependencies

  // Insight refresh effect - check if insights need refreshing
  useEffect(() => {
    if (compatibilityResult && compatibilityResult.lastUpdated) {
      const shouldRefresh = CompatibilityService.shouldRefreshInsights(new Date(compatibilityResult.lastUpdated));
      
      if (shouldRefresh) {
        // Refresh insights in the background
        const refreshInsights = async () => {
          try {
            const refreshedResult = await CompatibilityService.refreshInsights(
              compatibilityResult,
              userData,
              compatibilityHistory
            );
            setCompatibilityResult(refreshedResult);
          } catch (error) {
            console.error('Error refreshing insights:', error);
          }
        };
        
        refreshInsights();
      }
    }
  }, [compatibilityResult?.lastUpdated]); // Only depend on lastUpdated to prevent infinite loops

  const relationshipTypes = [
    { id: 'dating', label: 'Dating', icon: '💕', gradient: ['#FF6B9D', '#FF8E9B'] },
    { id: 'marriage', label: 'Marriage', icon: '💍', gradient: ['#8A4FFF', '#A855F7'] },
    { id: 'friendship', label: 'Friendship', icon: '🤝', gradient: ['#06B6D4', '#3B82F6'] },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', gradient: ['#F59E0B', '#F97316'] },
    { id: 'colleagues', label: 'Colleagues', icon: '💼', gradient: ['#6B7280', '#9CA3AF'] }
  ];

  const compatibilityCategories = [
    { id: 'communication', label: 'Communication', icon: '💬', color: '#3B82F6' },
    { id: 'emotional', label: 'Emotional Bond', icon: '💖', color: '#EC4899' },
    { id: 'values', label: 'Shared Values', icon: '🧭', color: '#F59E0B' },
    { id: 'growth', label: 'Growth Potential', icon: '📈', color: '#10B981' },
    { id: 'fun', label: 'Fun & Play', icon: '⭐', color: '#F97316' },
    { id: 'conflict', label: 'Conflict Resolution', icon: '⚖️', color: '#8B5CF6' }
  ];

  // Load persisted compatibility history
  useEffect(() => {
    const loadCompatibilityHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('compatibility_history');
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          const normalized = Array.isArray(parsedHistory)
            ? parsedHistory.map((item: any, idx: number) => ({
                // Ensure stable unique id
                id: item.id ?? `hist-${item.partnerName || 'unknown'}-${item.score || 0}-${idx}`,
                // Normalize date to Date object
                date: item.date ? new Date(item.date) : new Date(),
                partnerName: item.partnerName,
                partnerSign: item.partnerSign,
                relationshipType: item.relationshipType,
                score: item.score,
                result: item.result
              }))
            : [];
          setCompatibilityHistory(normalized);
        }
      } catch (error) {
        console.error('Error loading compatibility history:', error);
      }
    };

    loadCompatibilityHistory();
  }, []);

  // Initialize particle system
  useEffect(() => {
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.5 + 0.1,
      direction: Math.random() * Math.PI * 2,
    }));
    setBackgroundParticles(particles);

    // Initialize static starfield positions (once)
    if (starfieldRef.current.bg.length === 0) {
      starfieldRef.current.bg = Array.from({ length: 20 }, () => ({
        left: Math.random() * width,
        top: Math.random() * height,
      }));
      starfieldRef.current.mid = Array.from({ length: 15 }, () => ({
        left: Math.random() * width,
        top: Math.random() * height,
      }));
      starfieldRef.current.fg = Array.from({ length: 10 }, () => ({
        left: Math.random() * width,
        top: Math.random() * height,
      }));
    }

    // Initialize shooting stars
    const stars = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: -100,
      y: Math.random() * height,
      length: Math.random() * 100 + 50,
      speed: Math.random() * 2 + 1,
      opacity: 0,
    }));
    setShootingStars(stars);
  }, []);

  // Entrance animations with cinematic sequence
  useEffect(() => {
    // Staggered entrance sequence
    Animated.sequence([
      // Phase 1: Background emergence
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
      // Phase 2: UI elements ascend
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(quantumAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Advanced animation systems
  useEffect(() => {
    // Heart pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(heartPulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(heartPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Breathing universe animation
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1.05,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    );

    // Constellation animation
    const constellationAnimation = Animated.loop(
      Animated.timing(constellationAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    // Hologram shimmer effect
    const hologramAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(hologramAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(hologramAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    breathingAnimation.start();
    constellationAnimation.start();
    hologramAnimation.start();

    return () => {
      pulseAnimation.stop();
      breathingAnimation.stop();
      constellationAnimation.stop();
      hologramAnimation.stop();
    };
  }, []);

  // Shooting star animation disabled for static background

  // Touch ripple effect
  const createRipple = useCallback((x: number, y: number) => {
    setTouchPosition({ x, y });
    Animated.sequence([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Performance tracking
  const performanceTracker = useRef({
    startTime: Date.now(),
    stepTimes: {} as { [key: string]: number }
  });

  const trackPerformance = useCallback((eventName: string) => {
    const elapsed = Date.now() - performanceTracker.current.startTime;
    performanceTracker.current.stepTimes[eventName] = elapsed;
    console.log(`🔥 Performance: ${eventName} completed in ${elapsed}ms`);
  }, []);


  // Calendar helpers (Monday as first day)
  // Calculate required weeks for a month
  const getRequiredWeeks = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = firstDay + daysInMonth;
    return Math.ceil(totalCells / 7);
  };

  // Calculate dynamic calendar height based on required weeks
  const getCalendarHeight = (requiredWeeks: number) => {
    const headerHeight = 50; // Month/year header
    const weekdayHeaderHeight = 30; // Sun, Mon, etc.
    const dayRowHeight = 40; // Each row of dates
    const padding = 32; // Top and bottom padding
    
    return headerHeight + weekdayHeaderHeight + (dayRowHeight * requiredWeeks) + padding;
  };

  const getMonthMatrix = (anchor: Date) => {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekdaySun0 = firstOfMonth.getDay(); // 0=Sun
    const requiredWeeks = getRequiredWeeks(year, month);

    const grid: Array<Array<{ date: Date; inMonth: boolean } | null>> = [];
    let dayCounter = 1;

    // Only generate the actual weeks needed (4, 5, or 6)
    for (let week = 0; week < requiredWeeks; week++) {
      const row: Array<{ date: Date; inMonth: boolean } | null> = [];
      for (let dow = 0; dow < 7; dow++) {
        const cellIndex = week * 7 + dow;
        if (cellIndex < firstWeekdaySun0) {
          // Empty cell for days before the first of the month
          row.push(null);
        } else if (dayCounter <= daysInMonth) {
          row.push({ date: new Date(year, month, dayCounter++), inMonth: true });
        } else {
          // Empty cell for days after the last of the month
          row.push(null);
        }
      }
      grid.push(row);
    }
    return grid;
  };

  const openCalendar = () => {
    // If a date is already selected in input, open to that month; otherwise default to today
    if (partnerData.birthDate) {
      const [y, m] = partnerData.birthDate.split('-');
      const year = parseInt(y, 10);
      const monthZeroBased = parseInt(m, 10) - 1;
      setCalendarMonth(new Date(year, monthZeroBased, 1));
    } else {
      setCalendarMonth(new Date());
    }
    setShowDatePicker(true);
  };

  const selectCalendarDate = (d: Date) => {
    setSelectedDate(d);
    // Store date as simple year/month/day object to avoid timezone issues
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-based month
    const day = d.getDate();
    
    // Store as YYYY-MM-DD string for compatibility
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    setPartnerData(prev => ({ ...prev, birthDate: dateString }));
    // Update calendar month to show the selected date's month
    setCalendarMonth(new Date(year, month - 1, 1)); // month - 1 for 0-based Date constructor
    setShowDatePicker(false);
  };

  // Real astrological compatibility analysis using planetary data (simplified flow + loading)
  // Basic zodiac compatibility calculation for immediate results
  const getBasicZodiacCompatibility = (sign1: string, sign2: string): number => {
    const compatibilityMap: { [key: string]: { [key: string]: number } } = {
      'Aries': { 'Leo': 85, 'Sagittarius': 88, 'Gemini': 75, 'Aquarius': 78, 'Aries': 70 },
      'Taurus': { 'Virgo': 90, 'Capricorn': 85, 'Cancer': 80, 'Pisces': 82, 'Taurus': 75 },
      'Gemini': { 'Libra': 85, 'Aquarius': 88, 'Aries': 75, 'Leo': 78, 'Gemini': 70 },
      'Cancer': { 'Scorpio': 90, 'Pisces': 88, 'Taurus': 80, 'Virgo': 75, 'Cancer': 72 },
      'Leo': { 'Aries': 85, 'Sagittarius': 90, 'Gemini': 78, 'Libra': 80, 'Leo': 75 },
      'Virgo': { 'Taurus': 90, 'Capricorn': 88, 'Cancer': 75, 'Scorpio': 78, 'Virgo': 70 },
      'Libra': { 'Gemini': 85, 'Aquarius': 90, 'Leo': 80, 'Sagittarius': 75, 'Libra': 72 },
      'Scorpio': { 'Cancer': 90, 'Pisces': 85, 'Virgo': 78, 'Capricorn': 80, 'Scorpio': 75 },
      'Sagittarius': { 'Aries': 88, 'Leo': 90, 'Libra': 75, 'Aquarius': 78, 'Sagittarius': 70 },
      'Capricorn': { 'Taurus': 85, 'Virgo': 88, 'Scorpio': 80, 'Pisces': 75, 'Capricorn': 72 },
      'Aquarius': { 'Gemini': 88, 'Libra': 90, 'Aries': 78, 'Sagittarius': 78, 'Aquarius': 70 },
      'Pisces': { 'Cancer': 88, 'Scorpio': 85, 'Taurus': 82, 'Capricorn': 75, 'Pisces': 75 }
    };
    
    return compatibilityMap[sign1]?.[sign2] || 
           compatibilityMap[sign2]?.[sign1] || 
           Math.floor(Math.random() * 30) + 50; // 50-80% for unknown combinations
  };

  // Enhanced zodiac sign calculation with birth chart elements
  const getZodiacSignFromDate = (birthDate: Date): string => {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    return 'Pisces';
  };

  const analyzeCompatibility = async () => {
    try {
      if (!partnerData.name || !partnerData.birthDate) {
        Alert.alert('Missing Information', 'Please fill in your partner\'s name and birthday.');
        return;
      }

      // Prevent multiple simultaneous analyses
      if (isAnalyzing) {
        console.log('Analysis already in progress, ignoring new request');
        return;
      }

      // COMPREHENSIVE CLEANUP: Clear all previous states and intervals
      setCompatibilityResult(null);
      setIsAnalyzing(false);
      setShowLoadingScreen(false);
      
      // Clear any existing loading intervals safely
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      
      // Reset loading message index
      setLoadingMessageIndex(0);
      
      // Small delay to ensure state cleanup, then start new analysis
      setTimeout(() => {
        setIsAnalyzing(true);
        setShowLoadingScreen(true);
      }, 100);
      
    } catch (error) {
      console.error('Error in analyzeCompatibility setup:', error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Quantum loading sequence
    Animated.sequence([
      Animated.timing(quantumAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(quantumAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      // Prepare birth data for both people
      const userBirthData: BirthData = {
        name: userData.name,
        birthDate: new Date('1990-01-01'), // Default date - in real app, get from user profile
        birthLocation: {
          latitude: 40.7128, // Default NYC - in real app, get from user profile
          longitude: -74.0060
        }
      };

      const partnerBirthDate = new Date(partnerData.birthDate);
      const partnerZodiacSign = getZodiacSign(partnerBirthDate);
      
      const partnerBirthData: BirthData = {
        name: partnerData.name,
        birthDate: partnerBirthDate,
        birthTime: partnerData.birthTime ? new Date(`2000-01-01T${partnerData.birthTime}`) : undefined,
        birthLocation: {
          latitude: 40.7128, // Default - in real app, parse from partnerData.birthLocation
          longitude: -74.0060
        }
      };

      // Calculate real compatibility using planetary data
      const analysisPromise = CompatibilityService.calculateCompatibility(
        userBirthData,
        partnerBirthData,
        { ...userData, relationshipType, relationshipDuration: 0 }, // Add relationship context
        compatibilityHistory
      );

      // Show immediate basic compatibility while detailed analysis runs
      const userSign = userData?.zodiacSign;
      const partnerSign = getZodiacSignFromDate(partnerBirthDate);
      
      // Immediate basic compatibility display
      const basicScore = getBasicZodiacCompatibility(userSign, partnerSign);
      const basicResult = {
        overallScore: basicScore,
        isPartial: true,
        insights: [`${userSign} and ${partnerSign} compatibility: ${basicScore}%`],
        categories: [],
        challenges: [],
        recommendations: [],
        lastUpdated: new Date()
      };
      
      // Show basic result immediately
      setCompatibilityResult(basicResult);
      setIsAnalyzing(false);
      setShowLoadingScreen(false);
      
      // Continue with detailed analysis in background
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Analysis timeout')), 30000)
      );
      
      try {
        const detailedResult = await Promise.race([analysisPromise, timeoutPromise]) as CompatibilityResult;

        // Generate simplified insights for streamlined UX
        const simpleInsights = generateSimpleInsights(
          userData.zodiacSign, 
          partnerSign, 
          detailedResult.overallScore
        );

        // Convert to the format expected by the UI
        const result = {
          overallScore: detailedResult.overallScore,
          categories: (detailedResult.categories || []).map((cat: any, index: number) => ({
            ...cat,
            id: cat.category?.toLowerCase().replace(/\s+/g, '_') || `category_${index}`,
            trend: 'stable' as const,
            peak: Math.min(100, cat.score + 10)
          })),
          insights: simpleInsights,
          challenges: detailedResult.challenges || [],
          recommendations: detailedResult.recommendations || [],
          dynamicInsights: detailedResult.dynamicInsights || {
            current: [],
            daily: [],
            weekly: [],
            transitBased: []
          },
          lastUpdated: detailedResult.lastUpdated,
          insightRotationIndex: 0
        };

        // Update with detailed result
        setCompatibilityResult(result);
        
        // Smooth slide down to results
        setTimeout(() => {
          scrollToResults();
        }, 400);

        // Add to history with detailed result
        const historyEntry = {
          id: Date.now(),
          date: new Date(),
          partnerName: partnerData.name,
          partnerSign: partnerSign,
          relationshipType,
          score: result.overallScore,
          result: result
        };
        
        const updatedHistory = [historyEntry, ...compatibilityHistory];
        setCompatibilityHistory(updatedHistory);
        
        // Persist to AsyncStorage
        try {
          await AsyncStorage.setItem('compatibility_history', JSON.stringify(updatedHistory));
        } catch (error) {
          console.error('Error saving compatibility history:', error);
        }

      } catch (detailedError) {
        console.warn('Detailed analysis failed, keeping basic result:', detailedError);
        // Keep the basic result that was already shown
      }

      // Spectacular result reveal animation (for basic result)
      const currentResult = compatibilityResult || basicResult;
      Animated.parallel([
        Animated.timing(compatibilityAnim, {
          toValue: currentResult.overallScore,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(hologramAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(sphereRotateX, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Cosmic explosion haptic feedback
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 2000);

    } catch (error) {
      console.error('Error calculating compatibility:', error);
      
      // CLEAN ERROR RECOVERY: Reset to clean input state safely
      try {
        // Batch error state updates to prevent scheduler issues
        setCompatibilityResult(null);
        
        setTimeout(() => {
          setIsAnalyzing(false);
          setShowLoadingScreen(false);
        }, 0);
        
        // Clear any loading intervals safely
        if (loadingIntervalRef.current) {
          clearInterval(loadingIntervalRef.current);
          loadingIntervalRef.current = null;
        }
        
        // Keep currentView as 'checker' to maintain compatibility section visibility
        setTimeout(() => {
          Alert.alert(
            'Analysis Error', 
            'Unable to calculate compatibility at this time. Please try again later.',
            [{ text: 'OK' }]
          );
        }, 100);
      } catch (recoveryError) {
        console.error('Error in error recovery:', recoveryError);
      }
    }
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={[styles.starIcon, i < count && styles.starActive]}>
        ⭐
      </Text>
    ));
  };

  // Static starfield rendering
  const renderParallaxStarfield = () => {
    return (
      <View style={styles.starfieldContainer}>
        {/* Background layer */}
        <View style={styles.starfieldLayer}>
          {starfieldRef.current.bg.map((pos, i) => (
            <View key={`bg-${i}`} style={[styles.star, {
              left: pos.left,
              top: pos.top,
              opacity: 0.3,
              width: 1,
              height: 1,
            }]} />
          ))}
        </View>
        
        {/* Midground layer */}
        <View style={styles.starfieldLayer}>
          {starfieldRef.current.mid.map((pos, i) => (
            <View key={`mid-${i}`} style={[styles.star, {
              left: pos.left,
              top: pos.top,
              opacity: 0.6,
              width: 2,
              height: 2,
            }]} />
          ))}
        </View>
        
        {/* Foreground layer */}
        <View style={styles.starfieldLayer}>
          {starfieldRef.current.fg.map((pos, i) => (
            <View key={`fg-${i}`} style={[styles.star, {
              left: pos.left,
              top: pos.top,
              opacity: 0.8,
              width: 3,
              height: 3,
            }]} />
          ))}
        </View>
      </View>
    );
  };

  const renderShootingStars = () => {
    // Static shooting stars - no animation
    return shootingStars.map(star => (
      <View
        key={star.id}
        style={[
          styles.shootingStar,
          {
            left: star.x,
            top: star.y,
            opacity: 0.3, // Static opacity
          }
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shootingStarGradient}
        />
      </View>
    ));
  };

  const renderTouchRipple = () => (
    <Animated.View
      style={[
        styles.ripple,
        {
          left: touchPosition.x - 25,
          top: touchPosition.y - 25,
          opacity: rippleAnim,
          transform: [{ scale: rippleAnim }]
        }
      ]}
    />
  );

  const render3DCompatibilitySphere = () => (
    <View style={styles.sphereContainer}>
      <Animated.View
        style={[
          styles.compatibilitySphere,
          {
            transform: [
              { rotateX: sphereRotateX.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              }) },
              { rotateY: sphereRotateY.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              }) }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#8A4FFF', '#FF6B9D', '#06B6D4', '#8A4FFF']}
          style={styles.sphereGradient}
        />
        <View style={styles.sphereCenter}>
          <Text style={styles.sphereScore}>
            {compatibilityResult?.overallScore}%
          </Text>
        </View>
      </Animated.View>
    </View>
  );

  const renderHolographicResults = () => (
    <Animated.View
      style={[
        styles.holographicContainer,
        {
          opacity: hologramAnim,
          transform: [{ 
            scale: hologramAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1.05]
            })
          }]
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(138, 79, 255, 0.1)', 'rgba(255, 107, 157, 0.1)', 'rgba(6, 182, 212, 0.1)']}
        style={styles.holographicGradient}
      >
        {/* Holographic border effect */}
        <View style={styles.holographicBorder} />
      </LinearGradient>
    </Animated.View>
  );

  // Removed floating hearts emoji bar as requested

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: breathingAnim }
          ]
        }
      ]}
    >
      {/* Starfield Background */}
      {renderParallaxStarfield()}
      {renderShootingStars()}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          if (onScroll) onScroll(event);
          // Parallax movement disabled - keeping static starfield
        }}
        scrollEventThrottle={16}
        // Disable touch ripple and any star repositioning
      >

        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.headerContent}>
            <Text style={[styles.pageTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
              Cosmic Connections
            </Text>
            <Text style={styles.pageSubtitle}>
              Find out if you're really meant to be together
            </Text>
          </View>
        </View>

        {/* Navigation Tabs - Modern segmented control */}
        <View style={styles.segmentContainer}>
          <LinearGradient
            colors={[AppColors.glassCardBackground, 'rgba(255,255,255,0.02)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.segmentBackdrop}
          >
            <View style={styles.segmentPill}>
              <TouchableOpacity
                style={[styles.segmentItem, currentView === 'checker' && styles.segmentItemActive]}
                onPress={() => { setCurrentView('checker'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles-outline" size={16} color={currentView === 'checker' ? AppColors.primary : AppColors.onBackground} />
                <Text style={[styles.segmentText, currentView === 'checker' && styles.segmentTextActive]}>Compatibility</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentItem, currentView === 'history' && styles.segmentItemActive]}
                onPress={() => { setCurrentView('history'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={16} color={currentView === 'history' ? AppColors.primary : AppColors.onBackground} />
                <Text style={[styles.segmentText, currentView === 'history' && styles.segmentTextActive]}>History</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

    {/* Full-screen Loading Overlay - Complete State Isolation */}
    {showLoadingScreen && (
      <View style={styles.loadingOverlay}>
        <LinearGradient
          colors={[AppColors.overlay, 'rgba(0,0,0,0.8)']}
          style={styles.loadingOverlayGradient}
        >
          <Animated.View style={[styles.loadingSpinner, { opacity: hologramAnim }]}> 
            <Ionicons name="planet-outline" size={44} color={AppColors.cosmicGold} />
          </Animated.View>
          <Text style={styles.loadingTitle}>Aligning the stars…</Text>
          <Text style={styles.loadingMessage}>{loadingMessages[loadingMessageIndex]}</Text>
        </LinearGradient>
      </View>
    )}
        {/* Conditional Content Based on Current View */}
        {currentView === 'checker' && (
          <>
            {/* Hero Section - Compatibility Checker */}
            <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(138, 79, 255, 0.1)', 'rgba(236, 72, 153, 0.1)', 'rgba(59, 130, 246, 0.1)']}
            style={styles.heroCard}
          >
            <Text style={[styles.heroTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
              Quick Compatibility Check
            </Text>
            
            {/* Partner Input Fields */}
            <View style={styles.inputSection}>
              <View style={styles.partnerInput}>
                <Text style={styles.inputLabel}>You</Text>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userData.name}</Text>
                  <Text style={styles.userSign}>{userData.zodiacSign}</Text>
                </View>
              </View>
              
              <View style={styles.connectionLine}>
                <Text style={styles.connectionIcon}>💫</Text>
              </View>
              
              <View style={styles.partnerInput}>
                <Text style={styles.inputLabel}>Partner</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter name"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={partnerData.name}
                  onChangeText={(text) => setPartnerData({...partnerData, name: text})}
                />
                <TouchableOpacity
                  ref={birthdayFieldRef}
                  style={[styles.textInput, styles.dateInputContainer]}
                  onPress={openCalendar}
                >
                  <Text style={[styles.dateInputText, !partnerData.birthDate && styles.dateInputPlaceholder]}>
                    {partnerData.birthDate ? (() => {
                      // Format YYYY-MM-DD to MM/DD/YY directly without Date object conversion
                      const [year, month, day] = partnerData.birthDate.split('-');
                      return `${month}/${day}/${year.slice(-2)}`;
                    })() : 'Birthday'}
                  </Text>
                  <Ionicons name="calendar-outline" size={16} color="rgba(255, 255, 255, 0.5)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Relationship Type Selector */}
            <View style={styles.relationshipSelector}>
              <Text style={styles.selectorTitle}>Relationship Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                {relationshipTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeChip,
                      relationshipType === type.id && styles.typeChipActive
                    ]}
                    onPress={() => {
                      setRelationshipType(type.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <LinearGradient
                      colors={relationshipType === type.id ? type.gradient as [string, string] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                      style={styles.chipGradient}
                    >
                      <Text style={styles.chipIcon}>{type.icon}</Text>
                      <Text style={styles.chipLabel}>{type.label}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Analysis Button - Simplified for streamlined UX */}
            <TouchableOpacity 
              style={[styles.analyzeButton, {
                opacity: (!partnerData.name || !partnerData.birthDate || isAnalyzing) ? 0.6 : 1
              }]}
              onPress={analyzeCompatibility}
              disabled={isAnalyzing || !partnerData.name || !partnerData.birthDate}
            >
              {isAnalyzing ? (
                <Text style={styles.loadingText}>Analyzing Compatibility...</Text>
              ) : (
                <Text style={styles.analyzeButtonText}>Are we compatible?</Text>
              )}
            </TouchableOpacity>

            {/* Form State Indicator */}
            {isAnalyzing && (
              <View style={styles.formStateIndicator}>
                <Text style={styles.formStateText}>
                  🔒 Analysis in progress - Please wait...
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Streamlined Compatibility Results - Inline Display */}
        {compatibilityResult && (
          <View style={styles.streamlinedResultsSection}>
            {/* Compatibility Score Circle */}
            <View style={styles.scoreCircleContainer}>
              <View style={styles.compatibilityCircle}>
              <LinearGradient
                colors={getCompatibilityColor(compatibilityResult.overallScore)}
                style={styles.circleGradient}
              >
                  <Text style={styles.compatibilityScore}>
                    {compatibilityResult.overallScore}%
                  </Text>
                  <Text style={styles.compatibilityLabel}>Compatible</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Simplified Insights - Maximum 4 bullets */}
            <View style={styles.simpleInsightsContainer}>
              {compatibilityResult.insights.slice(0, 4).map((insight: string, index: number) => (
                <View key={`insight-${index}`} style={styles.simpleInsightItem}>
                  <Text style={styles.simpleInsightBullet}>•</Text>
                  <Text style={styles.simpleInsightText}>{insight}</Text>
                </View>
              ))}
            </View>

            {/* Try Again Button - Centered */}
            <View style={styles.resultActions}>
              <TouchableOpacity 
                style={styles.tryAgainButton}
                onPress={startNewCompatibilityCheck}
              >
                <Ionicons name="refresh-outline" size={20} color={AppColors.cosmicGold} />
                <Text style={styles.tryAgainText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

          </>
        )}

        {/* Compatibility History View */}
        {currentView === 'history' && (
          <View style={styles.historySection}>
            <Text style={[styles.historyTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
              Compatibility History
            </Text>
            
            {compatibilityHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>No compatibility checks yet</Text>
                <Text style={styles.emptySubtitle}>
                  Your compatibility journey begins with your first analysis
                </Text>
              </View>
            ) : (
              <View>
                {compatibilityHistory.map((item) => (
                  <View key={item.id} style={styles.historyCard}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.08)', 'rgba(138, 79, 255, 0.08)']}
                      style={styles.historyGradient}
                    >
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyNames}>
                          {userData.name} & {item.partnerName}
                        </Text>
                        <Text style={styles.historyDate}>
                          {new Date(item.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.historyDetails}>
                        <Text style={styles.historySigns}>
                          {userData.zodiacSign} ♥ {item.partnerSign}
                        </Text>
                        <Text style={styles.historyScore}>
                          {item.score}% Compatible
                        </Text>
                        <Text style={styles.historyType}>
                          {item.relationshipType}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}


        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Centered Calendar Modal */}
      {showDatePicker && (
        <Modal transparent animationType="fade" visible={showDatePicker} onRequestClose={() => setShowDatePicker(false)}>
          <Pressable style={styles.calendarOverlay} onPress={() => setShowDatePicker(false)}>
            <View style={styles.calendarModalContainer}>
              <Pressable 
                style={[styles.calendarCard, { height: getCalendarHeight(getRequiredWeeks(calendarMonth.getFullYear(), calendarMonth.getMonth())) }]}
                onPress={(e) => e.stopPropagation()}
              >
              {/* Header */}
              <View style={styles.calendarHeader}>
                <View style={styles.calendarHeaderLeft}>
                  <Text style={styles.calendarHeaderTitle}>
                    {calendarMonth.toLocaleString(undefined, { month: 'long' })}
                  </Text>
                  <TouchableOpacity onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear() - 1, calendarMonth.getMonth(), 1))}>
                    <Ionicons name="chevron-back" size={16} color="#007AFF" />
                  </TouchableOpacity>
                  <Text style={styles.calendarHeaderYear}>
                    {calendarMonth.getFullYear()}
                  </Text>
                  <TouchableOpacity onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear() + 1, calendarMonth.getMonth(), 1))}>
                    <Ionicons name="chevron-forward" size={16} color="#007AFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.calendarHeaderRight}>
                  <TouchableOpacity onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>
                    <Ionicons name="chevron-back" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>
                    <Ionicons name="chevron-forward" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Weekday Row (Sun-Sat) */}
              <View style={styles.calendarWeekRow}>
                {['SUN','MON','TUE','WED','THU','FRI','SAT'].map((d) => (
                  <Text key={d} style={styles.calendarWeekLabel}>{d}</Text>
                ))}
              </View>

              {/* Grid */}
              {getMonthMatrix(calendarMonth).map((week, wi) => (
                <View key={`w-${wi}`} style={styles.calendarWeekRow}>
                  {week.map((cell, di) => {
                    if (!cell) {
                      // Empty cell for days outside current month
                      return <View key={`empty-${wi}-${di}`} style={styles.calendarDay} />;
                    }
                    
                    const today = new Date();
                    const isToday = today.toDateString() === cell.date.toDateString();
                    const isSelected = partnerData.birthDate && partnerData.birthDate === `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`;
                    return (
                      <TouchableOpacity
                        key={`d-${wi}-${di}`}
                        style={[styles.calendarDay, isSelected && styles.calendarDaySelected, isToday && !isSelected && styles.calendarDayToday]}
                        onPress={() => selectCalendarDate(cell.date)}
                      >
                        <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected, isToday && !isSelected && styles.calendarDayTextToday]}>
                          {cell.date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}

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
  floatingHeart: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  heartEmoji: {
    fontSize: 16,
    opacity: 0.6,
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 32, // Increased from 28
    color: AppColors.cosmicGold,
    marginBottom: 8, // Increased from 4
    textAlign: 'center', // Center the title
  },
  pageSubtitle: {
    fontSize: 18, // Increased from 16
    color: AppColors.textSecondary,
    textAlign: 'center', // Center the subtitle
    lineHeight: 24,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroTitle: {
    fontSize: 24,
    color: AppColors.onBackground,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  partnerInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    color: AppColors.onBackground,
    marginBottom: 8,
    fontWeight: '600',
  },
  userInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    color: AppColors.onBackground,
    fontWeight: '600',
    marginBottom: 4,
  },
  userSign: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  connectionLine: {
    marginHorizontal: 16,
    alignItems: 'center',
  },
  connectionIcon: {
    fontSize: 24,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: AppColors.onBackground,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  relationshipSelector: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 16,
    color: AppColors.onBackground,
    marginBottom: 12,
    fontWeight: '600',
  },
  typeScroll: {
    flexDirection: 'row',
  },
  typeChip: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  typeChipActive: {
    shadowColor: AppColors.cosmicGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  chipGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  chipIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  chipLabel: {
    fontSize: 12,
    color: AppColors.onBackground,
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: AppColors.cosmicGold,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: AppColors.cosmicGold,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  analyzeButtonText: {
    fontSize: 18,
    color: AppColors.primary,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: '600',
  },
  // Form State Indicator
  formStateIndicator: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: AppColors.cosmicGold,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  formStateText: {
    fontSize: 12,
    color: AppColors.cosmicGold,
    fontWeight: '500',
    textAlign: 'center',
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  resultsTitle: {
    fontSize: 24,
    color: AppColors.onBackground,
    textAlign: 'center',
    marginBottom: 24,
  },
  // Streamlined Results Styles
  streamlinedResultsSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  compatibilityCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    shadowColor: AppColors.cosmicGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  circleGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatibilityScore: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  compatibilityLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginTop: 4,
  },
  simpleInsightsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  simpleInsightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  simpleInsightBullet: {
    fontSize: 16,
    color: AppColors.cosmicGold,
    marginRight: 12,
    marginTop: 2,
    fontWeight: 'bold',
  },
  simpleInsightText: {
    fontSize: 15,
    color: AppColors.onBackground,
    lineHeight: 22,
    flex: 1,
    fontWeight: '400',
  },
  resultActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tryAgainButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: AppColors.cosmicGold,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 160,
    shadowColor: AppColors.cosmicGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  tryAgainText: {
    fontSize: 16,
    color: AppColors.cosmicGold,
    fontWeight: '600',
  },
  overallScoreCard: {
    marginBottom: 24,
  },
  scoreCardGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  compatibilityMeter: {
    marginBottom: 16,
  },
  meterContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  meterProgress: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    borderColor: AppColors.cosmicGold,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  meterCenter: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 36,
    color: AppColors.cosmicGold,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  scoreDescription: {
    fontSize: 18,
    color: AppColors.onBackground,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: 16,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: AppColors.onBackground,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryScore: {
    marginBottom: 8,
  },
  categoryScoreText: {
    fontSize: 20,
    color: AppColors.onBackground,
    fontWeight: 'bold',
  },
  categoryBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  insightsSection: {
    marginBottom: 30,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 20,
    color: AppColors.onBackground,
    flex: 1,
  },
  insightTypeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 4,
  },
  insightTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  insightTypeButtonActive: {
    backgroundColor: AppColors.cosmicGold,
  },
  insightTypeText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  insightTypeTextActive: {
    color: AppColors.primary,
  },
  dynamicInsightsCard: {
    backgroundColor: 'rgba(138, 79, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(138, 79, 255, 0.3)',
  },
  insightTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTypeLabel: {
    fontSize: 16,
    color: AppColors.cosmicGold,
    fontWeight: '600',
  },
  insightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoRotateIndicator: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  autoRotateText: {
    fontSize: 10,
    color: AppColors.cosmicGold,
    fontWeight: '500',
  },
  insightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  insightsSubtitle: {
    fontSize: 16,
    color: AppColors.cosmicGold,
    fontWeight: '600',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: AppColors.onBackground,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  starIcon: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.3)',
    marginRight: 2,
  },
  starActive: {
    color: AppColors.cosmicGold,
  },
  bottomSpacing: {
    height: 100,
  },
  // Advanced Background System Styles
  starfieldContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  starfieldLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  shootingStar: {
    position: 'absolute',
    width: 100,
    height: 2,
    zIndex: 1,
  },
  shootingStarGradient: {
    flex: 1,
    borderRadius: 1,
  },
  ripple: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  // Segmented control styles
  segmentContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  segmentBackdrop: {
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: AppColors.glassCardBorder,
  },
  segmentPill: {
    backgroundColor: AppColors.glassCardBackground,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  segmentItemActive: {
    backgroundColor: AppColors.starWhite,
  },
  segmentText: {
    color: AppColors.onBackground,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  segmentTextActive: {
    color: AppColors.primary,
  },
  // 3D Compatibility Sphere
  sphereContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  compatibilitySphere: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.cosmicGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  sphereGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sphereCenter: {
    alignItems: 'center',
  },
  sphereScore: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  // Holographic Effects
  holographicContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  holographicGradient: {
    flex: 1,
    borderRadius: 20,
  },
  holographicBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(138, 79, 255, 0.3)',
  },
  // History Section
  historySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  historyTitle: {
    fontSize: 24,
    color: AppColors.onBackground,
    textAlign: 'center',
    marginBottom: 24,
  },
  historyCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyGradient: {
    padding: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyNames: {
    fontSize: 18,
    color: AppColors.onBackground,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historySigns: {
    fontSize: 14,
    color: AppColors.cosmicGold,
    fontWeight: '600',
  },
  historyScore: {
    fontSize: 16,
    color: AppColors.onBackground,
    fontWeight: 'bold',
  },
  historyType: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textTransform: 'capitalize',
  },
  // Chart Section
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 24,
    color: AppColors.onBackground,
    textAlign: 'center',
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartPlaceholder: {
    fontSize: 18,
    color: AppColors.onBackground,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  chartDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Loading overlay - Complete state isolation with perfect centering
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'auto', // Block all interactions during loading
  },
  loadingOverlayGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 16,
    color: AppColors.onBackground,
    fontWeight: '700',
    marginBottom: 8,
  },
  loadingMessage: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  // Date picker styles
  dateInputText: {
    color: AppColors.onBackground,
    fontSize: 16,
    flex: 1,
  },
  dateInputPlaceholder: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Calendar modal styles
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  calendarModalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCard: {
    width: 300,
    borderRadius: 12,
    backgroundColor: AppColors.starWhite,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  calendarHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  calendarHeaderYear: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  calendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  calendarWeekLabel: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  calendarDaySelected: {
    backgroundColor: '#007AFF',
  },
  calendarDayToday: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  calendarDayText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarDayTextToday: {
    color: '#007AFF',
    fontWeight: '600',
  },
  calendarDayDimmed: {
    color: '#C0C4D0',
  },
});

export default SoulmateContent;
