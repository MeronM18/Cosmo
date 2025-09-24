import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Alert,
  Platform,
  Dimensions,
  ImageBackground,
  AppState,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { iOS17Theme } from '../../theme/ios17Theme';
import { Ritual, RitualStep, RitualSession, SectionProps } from '../../types/horoscopeExtensions';

interface IOS17DailyRitualsProps extends SectionProps {
  selectedTimePeriod: string;
}

const { width } = Dimensions.get('window');

const RITUAL_COLORS = {
  morning: { primary: '#F59E0B', light: '#FEF3C7', accent: '#D97706' },
  evening: { primary: '#6366F1', light: '#E0E7FF', accent: '#4F46E5' },
  cleansing: { primary: '#10B981', light: '#D1FAE5', accent: '#059669' },
  grounding: { primary: '#8B5CF6', light: '#EDE9FE', accent: '#7C3AED' },
  energizing: { primary: '#EF4444', light: '#FEE2E2', accent: '#DC2626' },
} as const;

const DIFFICULTY_COLORS = {
  easy: '#10B981',
  moderate: '#F59E0B',
  advanced: '#EF4444',
} as const;

const IOS17DailyRituals: React.FC<IOS17DailyRitualsProps> = ({
  userData,
  selectedTimePeriod,
  onPremiumUpgrade,
}) => {
  const [currentRitual, setCurrentRitual] = useState<Ritual | null>(null);
  const [ritualHistory, setRitualHistory] = useState<RitualSession[]>([]);
  const [showRitualModal, setShowRitualModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [ritualModalState, setRitualModalState] = useState<'preparation' | 'resume' | 'ritual'>('preparation');
  const [savedSession, setSavedSession] = useState<any>(null);
  const [selectedRitualType, setSelectedRitualType] = useState<string>('morning');
  const [currentStep, setCurrentStep] = useState(0);
  const [isRitualActive, setIsRitualActive] = useState(false);
  const [ritualStreak, setRitualStreak] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  // Consolidated timing state for atomic updates
  const [timingState, setTimingState] = useState({
    stepStartMs: null as number | null,
    sessionStartMs: null as number | null,
    pausedAtMs: null as number | null,
    totalPauseDurationMs: 0,
    stepCompletionTimes: [] as number[],
    lastUpdateTime: Date.now(),
    isPaused: false,
    stepTimer: 0,
  });
  const [preparationComplete, setPreparationComplete] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sessionState, setSessionState] = useState<any>(null);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0);
  const [isStepOverTime, setIsStepOverTime] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const timerPulse = useRef(new Animated.Value(1)).current;
  const completionPulse = useRef(new Animated.Value(1)).current;
  const autoAdvanceInterval = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const nextSecondBoundary = useRef<number>(0);
  const sessionStateRef = useRef<any>(null);
  const timingStateRef = useRef(timingState);
  const masterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ritual types
  const ritualTypes = [
    { id: 'morning', name: 'Morning', icon: '🌅', color: RITUAL_COLORS.morning.primary },
    { id: 'evening', name: 'Evening', icon: '🌙', color: RITUAL_COLORS.evening.primary },
    { id: 'cleansing', name: 'Cleansing', icon: '🧹', color: RITUAL_COLORS.cleansing.primary },
    { id: 'grounding', name: 'Grounding', icon: '🌱', color: RITUAL_COLORS.grounding.primary },
    { id: 'energizing', name: 'Energizing', icon: '⚡', color: RITUAL_COLORS.energizing.primary },
  ];

  // Sample rituals based on zodiac signs and ritual types
  const rituals: Ritual[] = [
    {
      id: '1',
      name: 'Morning Sun Salutation',
      type: 'morning',
      duration: 15,
      steps: [
        {
          id: '1',
          description: 'Find a quiet space with natural light and take 3 deep breaths to center yourself',
          duration: 1,
          isOptional: false,
        },
        {
          id: '2',
          description: 'Take 3 deep breaths and set your intention for the day',
          duration: 2,
          isOptional: false,
        },
        {
          id: '3',
          description: 'Perform 5 sun salutation poses',
          duration: 8,
          isOptional: false,
        },
        {
          id: '4',
          description: 'Meditate on gratitude for 3 minutes',
          duration: 3,
          isOptional: false,
        },
        {
          id: '5',
          description: 'Write down 3 things you\'re grateful for',
          duration: 1,
          isOptional: true,
        },
      ],
      zodiacAlignment: ['Aries', 'Leo', 'Sagittarius'],
      planetaryAlignment: ['Sun', 'Mars'],
      difficulty: 'easy',
    },
    {
      id: '2',
      name: 'Evening Moon Reflection',
      type: 'evening',
      duration: 20,
      steps: [
        {
          id: '1',
          description: 'Light a candle or use soft lighting and take 3 deep breaths to transition from day to evening',
          duration: 1,
          isOptional: false,
        },
        {
          id: '2',
          description: 'Reflect on the day\'s experiences',
          duration: 5,
          isOptional: false,
        },
        {
          id: '3',
          description: 'Write in your journal about insights gained',
          duration: 8,
          isOptional: false,
        },
        {
          id: '4',
          description: 'Practice gentle stretching or yoga',
          duration: 4,
          isOptional: false,
        },
        {
          id: '5',
          description: 'End with a calming meditation',
          duration: 2,
          isOptional: false,
        },
      ],
      zodiacAlignment: ['Cancer', 'Scorpio', 'Pisces'],
      planetaryAlignment: ['Moon', 'Neptune'],
      difficulty: 'moderate',
    },
    {
      id: '3',
      name: 'Energy Cleansing Ritual',
      type: 'cleansing',
      duration: 10,
      steps: [
        {
          id: '1',
          description: 'Light sage or incense and take 3 deep breaths while visualizing negative energy leaving your space',
          duration: 2,
          isOptional: true,
          materials: ['Sage', 'Incense', 'Lighter'],
        },
        {
          id: '2',
          description: 'Visualize white light surrounding your body',
          duration: 3,
          isOptional: false,
        },
        {
          id: '3',
          description: 'Shake out any negative energy from your limbs',
          duration: 2,
          isOptional: false,
        },
        {
          id: '4',
          description: 'Take a cleansing shower or wash hands',
          duration: 3,
          isOptional: false,
        },
      ],
      zodiacAlignment: ['Virgo', 'Scorpio', 'Capricorn'],
      planetaryAlignment: ['Mercury', 'Pluto', 'Saturn'],
      difficulty: 'easy',
    },
    {
      id: '4',
      name: 'Earth Grounding Practice',
      type: 'grounding',
      duration: 12,
      steps: [
        {
          id: '1',
          description: 'Go outside or sit near a window and take 3 deep breaths while feeling connected to the earth',
          duration: 1,
          isOptional: false,
        },
        {
          id: '2',
          description: 'Place bare feet on the ground if possible',
          duration: 1,
          isOptional: true,
        },
        {
          id: '3',
          description: 'Visualize roots growing from your feet into the earth',
          duration: 4,
          isOptional: false,
        },
        {
          id: '4',
          description: 'Feel the earth\'s energy flowing up through your body',
          duration: 4,
          isOptional: false,
        },
        {
          id: '5',
          description: 'Take 5 deep breaths, feeling centered and stable',
          duration: 2,
          isOptional: false,
        },
      ],
      zodiacAlignment: ['Taurus', 'Virgo', 'Capricorn'],
      planetaryAlignment: ['Earth', 'Saturn'],
      difficulty: 'easy',
    },
    {
      id: '5',
      name: 'Fire Energy Activation',
      type: 'energizing',
      duration: 18,
      steps: [
        {
          id: '1',
          description: 'Stand in a power pose with feet shoulder-width apart and take 3 deep breaths to activate your energy',
          duration: 1,
          isOptional: false,
        },
        {
          id: '2',
          description: 'Take 3 energizing breaths, filling your lungs completely',
          duration: 2,
          isOptional: false,
        },
        {
          id: '3',
          description: 'Visualize a bright flame in your solar plexus',
          duration: 3,
          isOptional: false,
        },
        {
          id: '4',
          description: 'Perform 10 jumping jacks or energetic movements',
          duration: 5,
          isOptional: false,
        },
        {
          id: '5',
          description: 'Shout or chant an empowering affirmation',
          duration: 2,
          isOptional: false,
        },
        {
          id: '6',
          description: 'Feel the energy coursing through your entire body',
          duration: 3,
          isOptional: false,
        },
        {
          id: '7',
          description: 'End with a victory pose and deep breath',
          duration: 2,
          isOptional: false,
        },
      ],
      zodiacAlignment: ['Aries', 'Leo', 'Sagittarius'],
      planetaryAlignment: ['Sun', 'Mars', 'Jupiter'],
      difficulty: 'moderate',
    },
  ];

  // Enhanced timer calculation functions with consolidated state
  const calculateActiveElapsedTime = (startTime: number, currentTime: number, pauseDuration: number = 0): number => {
    return Math.max(0, Math.floor((currentTime - startTime - pauseDuration) / 1000));
  };

  const calculateStepElapsedTime = (): number => {
    const current = timingStateRef.current;
    if (!current.stepStartMs) return 0;
    const currentTime = Date.now();
    return calculateActiveElapsedTime(current.stepStartMs, currentTime, current.totalPauseDurationMs);
  };

  const calculateSessionElapsedTime = (): number => {
    const current = timingStateRef.current;
    if (!current.sessionStartMs) return 0;
    const currentTime = Date.now();
    return calculateActiveElapsedTime(current.sessionStartMs, currentTime, current.totalPauseDurationMs);
  };

  const getNextSecondBoundary = (): number => {
    const now = Date.now();
    return Math.ceil(now / 1000) * 1000;
  };

  // Master timer function - single source of truth for all timing updates
  const updateMasterTimer = () => {
    const current = timingStateRef.current;
    if (!current.stepStartMs || current.isPaused) return;

    const now = Date.now();
    const elapsed = calculateStepElapsedTime();
    
    // Bounds checking to prevent impossible values
    if (elapsed > 24 * 60 * 60) { // More than 24 hours
      console.warn('Extreme timer value detected, triggering recovery');
      recoverFromCorruptedState();
      return;
    }

    // Atomic update of timing state
    const newTimingState = {
      ...current,
      stepTimer: elapsed,
      lastUpdateTime: now,
    };

    setTimingState(newTimingState);
    timingStateRef.current = newTimingState;
    
    // Debounced save to reduce persistence frequency
    if (sessionStateRef.current) {
      const updatedState = {
        ...sessionStateRef.current,
        stepTimer: elapsed,
        lastUpdateTime: now,
        timestamp: now,
      };
      sessionStateRef.current = updatedState;
      debouncedSaveSessionState(updatedState, 3000); // Save every 3 seconds during active timing
    }

    // Check for step completion
    if (currentRitual && currentRitual.steps.length > 0) {
      const currentStepData = currentRitual.steps[currentStep];
      const stepDurationSec = (currentStepData?.duration || 0) * 60;
      
      if (stepDurationSec > 0 && elapsed >= stepDurationSec && !stepCompleted) {
        // Step duration reached - trigger completion
        setStepCompleted(true);
        setIsStepOverTime(elapsed > stepDurationSec);
        
        // Show completion prompt after a brief delay
        setTimeout(() => {
          setShowCompletionPrompt(true);
          startAutoAdvanceCountdown();
        }, 1000);
        
        // Haptic feedback for step completion
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Start completion pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(completionPulse, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(completionPulse, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  };

  const validateTimingData = (data: any): boolean => {
    if (!data) return false;
    
    // Check for valid timestamps
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (data.stepStartMs && (data.stepStartMs > now || data.stepStartMs < now - oneDayMs)) {
      console.warn('Invalid stepStartMs:', data.stepStartMs);
      return false;
    }
    
    if (data.sessionStartMs && (data.sessionStartMs > now || data.sessionStartMs < now - oneDayMs)) {
      console.warn('Invalid sessionStartMs:', data.sessionStartMs);
      return false;
    }
    
    // Check for reasonable pause durations
    if (data.totalPauseDurationMs && data.totalPauseDurationMs > oneDayMs) {
      console.warn('Excessive pause duration:', data.totalPauseDurationMs);
      return false;
    }
    
    // Check step progression
    if (typeof data.currentStep !== 'number' || data.currentStep < 0) {
      console.warn('Invalid currentStep:', data.currentStep);
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    loadDailyRitual();
    loadRitualHistory();
    loadRitualStreak();
    loadSessionState();
    animateIn();
    
    // App state change handler with enhanced edge case handling
    const handleAppStateChange = (nextAppState: any) => {
      const current = timingStateRef.current;
      
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - handle system interruptions
        if (isRitualActive && !current.isPaused) {
          const now = Date.now();
          const timeSinceLastUpdate = now - current.lastUpdateTime;
          
          // If app was backgrounded for more than 5 minutes, treat as extended interruption
          if (timeSinceLastUpdate > 5 * 60 * 1000) {
            console.warn('Extended backgrounding detected:', timeSinceLastUpdate);
            // Could show user dialog about long interruption
          }
          
          // Update timing state atomically
          const newTimingState = {
            ...current,
            lastUpdateTime: now,
          };
          setTimingState(newTimingState);
          timingStateRef.current = newTimingState;
          
          // Save current state
          if (sessionStateRef.current) {
            const updatedState = {
              ...sessionStateRef.current,
              lastUpdateTime: now,
              timestamp: now,
            };
            saveSessionState(updatedState);
          }
        }
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App going to background - handle calls, notifications, device sleep
        if (isRitualActive && !current.isPaused) {
          const now = Date.now();
          const currentStepTime = calculateStepElapsedTime();
          
          // Update timing state before backgrounding
          const newTimingState = {
            ...current,
            stepTimer: currentStepTime,
            lastUpdateTime: now,
          };
          setTimingState(newTimingState);
          timingStateRef.current = newTimingState;
          
          if (sessionStateRef.current) {
            const updatedState = {
              ...sessionStateRef.current,
              stepTimer: currentStepTime,
              lastUpdateTime: now,
              timestamp: now,
            };
            saveSessionState(updatedState);
          }
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      if (masterTimerRef.current) {
        clearTimeout(masterTimerRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      subscription?.remove();
    };
  }, [selectedRitualType, isRitualActive]);

  // Master timer with consolidated logic and smart scheduling
  useEffect(() => {
    const current = timingStateRef.current;
    
    if (ritualModalState === 'ritual' && isRitualActive && current.stepStartMs && !masterTimerRef.current) {
      // Calculate next second boundary for precise updates
      nextSecondBoundary.current = getNextSecondBoundary();
      
      const scheduleNextUpdate = () => {
        const now = Date.now();
        const timeToNextSecond = nextSecondBoundary.current - now;
        
        if (timeToNextSecond <= 0) {
          // Update immediately and schedule next second
          updateMasterTimer();
          nextSecondBoundary.current = getNextSecondBoundary();
          masterTimerRef.current = setTimeout(scheduleNextUpdate, 1000);
        } else {
          // Schedule update for next second boundary
          masterTimerRef.current = setTimeout(() => {
            updateMasterTimer();
            nextSecondBoundary.current = getNextSecondBoundary();
            scheduleNextUpdate();
          }, timeToNextSecond);
        }
      };
      
      // Initial update
      updateMasterTimer();
      scheduleNextUpdate();
    }
    
    // Clean up timer when ritual becomes inactive
    if (ritualModalState !== 'ritual' || !isRitualActive) {
      if (masterTimerRef.current) {
        clearTimeout(masterTimerRef.current);
        masterTimerRef.current = null;
      }
      if (autoAdvanceInterval.current) {
        clearInterval(autoAdvanceInterval.current);
        autoAdvanceInterval.current = null;
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    }
  }, [ritualModalState, isRitualActive, timingState.stepStartMs, currentRitual, currentStep, stepCompleted]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(timerPulse, {
          toValue: 1.06,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(timerPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const loadDailyRitual = () => {
    // Get ritual based on selected type and zodiac sign
    const typeRituals = rituals.filter(ritual => ritual.type === selectedRitualType);
    const zodiacRituals = typeRituals.filter(ritual => 
      ritual.zodiacAlignment.includes(userData.zodiacSign)
    );
    
    // Use zodiac-specific ritual if available, otherwise use any ritual of that type
    const selectedRitual = zodiacRituals.length > 0 ? zodiacRituals[0] : typeRituals[0];
    setCurrentRitual(selectedRitual);
    setCurrentStep(0);
        // Timer reset handled by timing state
  };

  const loadRitualHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('ritualHistory');
      if (history) {
        setRitualHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading ritual history:', error);
    }
  };

  const loadRitualStreak = async () => {
    try {
      const streak = await AsyncStorage.getItem('ritualStreak');
      if (streak) {
        setRitualStreak(parseInt(streak));
      }
    } catch (error) {
      console.error('Error loading ritual streak:', error);
    }
  };

  const saveRitualSession = async (session: RitualSession) => {
    try {
      const newHistory = [session, ...ritualHistory.slice(0, 49)]; // Keep last 50
      setRitualHistory(newHistory);
      await AsyncStorage.setItem('ritualHistory', JSON.stringify(newHistory));
      
      // Update streak
      const newStreak = ritualStreak + 1;
      setRitualStreak(newStreak);
      await AsyncStorage.setItem('ritualStreak', newStreak.toString());
    } catch (error) {
      console.error('Error saving ritual session:', error);
    }
  };

  const startRitual = async () => {
    if (!currentRitual) return;
    
    // Check for saved session first
    const hasSavedSession = await checkForSavedSession();
    
    if (hasSavedSession) {
      setRitualModalState('resume');
    } else {
      setRitualModalState('preparation');
    }
    
    setShowRitualModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const beginRitualSession = () => {
    if (!currentRitual) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Initialize ritual session state
    const now = Date.now();
    setIsRitualActive(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    
    // Initialize consolidated timing state
    const newTimingState = {
      stepStartMs: now,
      sessionStartMs: now,
      pausedAtMs: null,
      totalPauseDurationMs: 0,
      stepCompletionTimes: [],
      lastUpdateTime: now,
      isPaused: false,
      stepTimer: 0,
    };
    
    setTimingState(newTimingState);
    timingStateRef.current = newTimingState;
    
    // Save comprehensive session state
    const newSessionState = {
      ritualId: currentRitual.id,
      ritualType: selectedRitualType,
      sessionStartMs: now,
      stepStartMs: now,
      currentStep: 0,
      completedSteps: [],
      stepCompletionTimes: [],
      isPaused: false,
      pausedAtMs: null,
      totalPauseDurationMs: 0,
      stepTimer: 0,
      lastUpdateTime: now,
      timestamp: now,
    };
    setSessionState(newSessionState);
    sessionStateRef.current = newSessionState;
    saveSessionState(newSessionState);
    
    // Transition to ritual state
    setRitualModalState('ritual');
  };

  const resumeRitualSession = () => {
    if (!savedSession) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Enhanced session state validation
    if (!validateTimingData(savedSession)) {
      Alert.alert('Invalid Session', 'The saved session appears to be corrupted. Starting fresh.');
      startNewRitual();
      return;
    }
    
    // Restore comprehensive session state
    setIsRitualActive(true);
    setCurrentStep(savedSession.currentStep);
    setCompletedSteps(savedSession.completedSteps || []);
    
    // Calculate proper step start time accounting for pause duration
    const now = Date.now();
    const savedStepTime = savedSession.stepTimer || 0;
    const savedStepPauseTime = savedSession.totalPauseDurationMs || 0;
    const newStepStartMs = now - (savedStepTime * 1000) - savedStepPauseTime;
    
    // Restore consolidated timing state
    const restoredTimingState = {
      stepStartMs: newStepStartMs,
      sessionStartMs: savedSession.sessionStartMs,
      pausedAtMs: null,
      totalPauseDurationMs: savedSession.totalPauseDurationMs || 0,
      stepCompletionTimes: savedSession.stepCompletionTimes || [],
      lastUpdateTime: now,
      isPaused: false, // Always resume in active state
      stepTimer: savedStepTime,
    };
    
    setTimingState(restoredTimingState);
    timingStateRef.current = restoredTimingState;
    
    // Reset completion states
    setStepCompleted(false);
    setIsStepOverTime(false);
    setShowCompletionPrompt(false);
    completionPulse.setValue(1);
    
    // Update session state with enhanced data
    const updatedState = {
      ...savedSession,
      stepStartMs: newStepStartMs,
      lastUpdateTime: now,
      timestamp: now,
      isPaused: false,
      pausedAtMs: null,
    };
    setSessionState(updatedState);
    sessionStateRef.current = updatedState;
    saveSessionState(updatedState);
    
    // Transition to ritual state
    setRitualModalState('ritual');
  };

  const startNewRitual = () => {
    if (!currentRitual) return;
    
    // Clear saved session
    clearSessionState();
    setSavedSession(null);
    
    // Go to preparation
    setRitualModalState('preparation');
  };

  const startAutoAdvanceCountdown = () => {
    setAutoAdvanceCountdown(10); // 10 second countdown
    
    autoAdvanceInterval.current = setInterval(() => {
      setAutoAdvanceCountdown(prev => {
        if (prev <= 1) {
          // Auto-advance to next step
          nextStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelAutoAdvance = () => {
    if (autoAdvanceInterval.current) {
      clearInterval(autoAdvanceInterval.current);
      autoAdvanceInterval.current = null;
    }
    setAutoAdvanceCountdown(0);
    setShowCompletionPrompt(false);
  };

  const getStepTimingStatus = () => {
    try {
      if (!currentRitual || !currentRitual.steps || currentStep < 0 || currentStep >= currentRitual.steps.length) {
        console.warn('Invalid step data:', { currentRitual: !!currentRitual, currentStep, stepsLength: currentRitual?.steps?.length });
        return null;
      }
      
      const currentStepData = currentRitual.steps[currentStep];
      if (!currentStepData) {
        console.warn('Current step data not found:', currentStep);
        return null;
      }
      
      const stepDurationSec = (currentStepData?.duration || 0) * 60;
      
      if (stepDurationSec === 0) return null; // No duration set
      
      const elapsed = Math.max(0, timingState.stepTimer || 0); // Ensure non-negative
      const remaining = Math.max(0, stepDurationSec - elapsed);
      const overTime = Math.max(0, elapsed - stepDurationSec);
      
      // Handle extreme edge cases
      if (elapsed > 24 * 60 * 60) { // More than 24 hours - likely corrupted
        console.warn('Extreme timer value detected, resetting:', elapsed);
        const newTimingState = { ...timingState, stepTimer: 0 };
        setTimingState(newTimingState);
        timingStateRef.current = newTimingState;
        return {
          elapsed: 0,
          remaining: stepDurationSec,
          overTime: 0,
          stepDurationSec,
          isOverTime: false,
          isSignificantlyOverTime: false,
          progressPercentage: 0
        };
      }
      
      return {
        elapsed,
        remaining,
        overTime,
        stepDurationSec,
        isOverTime: overTime > 0,
        isSignificantlyOverTime: overTime > 60, // More than 1 minute over
        progressPercentage: Math.min(100, Math.round((elapsed / stepDurationSec) * 100))
      };
    } catch (error) {
      console.error('Error calculating step timing status:', error);
      return null;
    }
  };

  const nextStep = () => {
    if (!currentRitual) return;
    
    // Clean up auto-advance
    cancelAutoAdvance();
    
    // Reset completion states
    setStepCompleted(false);
    setIsStepOverTime(false);
    setShowCompletionPrompt(false);
    completionPulse.stopAnimation();
    completionPulse.setValue(1);
    
    // Record step completion time
    const now = Date.now();
    const current = timingStateRef.current;
    const stepCompletionTime = calculateStepElapsedTime();
    const newStepCompletionTimes = [...current.stepCompletionTimes, stepCompletionTime];
    
    // Mark current step as completed
    const newCompletedSteps = [...completedSteps, currentStep];
    setCompletedSteps(newCompletedSteps);
    
    if (currentStep < currentRitual.steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // Update timing state for new step
      const newTimingState = {
        ...current,
        stepStartMs: now,
        stepTimer: 0,
        stepCompletionTimes: newStepCompletionTimes,
        lastUpdateTime: now,
      };
      
      setTimingState(newTimingState);
      timingStateRef.current = newTimingState;
      
      // Update session state with enhanced data
      const updatedState = {
        ...sessionState,
        currentStep: newStep,
        stepStartMs: now,
        completedSteps: newCompletedSteps,
        stepCompletionTimes: newStepCompletionTimes,
        stepTimer: 0,
        timestamp: now,
      };
      setSessionState(updatedState);
      sessionStateRef.current = updatedState;
      saveSessionState(updatedState);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      completeRitual();
    }
  };

  const togglePause = () => {
    const current = timingStateRef.current;
    const newPausedState = !current.isPaused;
    const now = Date.now();
    
    if (newPausedState) {
      // Pausing: store pause start time and current elapsed time
      const currentStepTime = calculateStepElapsedTime();
      
      const newTimingState = {
        ...current,
        isPaused: true,
        pausedAtMs: now,
        stepTimer: currentStepTime,
        lastUpdateTime: now,
      };
      
      setTimingState(newTimingState);
      timingStateRef.current = newTimingState;
      
      // Update session state with pause information
      if (sessionStateRef.current) {
        const updatedState = {
          ...sessionStateRef.current,
          isPaused: true,
          pausedAtMs: now,
          stepTimer: currentStepTime,
          timestamp: now,
        };
        setSessionState(updatedState);
        sessionStateRef.current = updatedState;
        saveSessionState(updatedState);
      }
    } else {
      // Resuming: calculate pause duration and update totals
      if (current.pausedAtMs) {
        const pauseDuration = now - current.pausedAtMs;
        const newTotalPauseDuration = current.totalPauseDurationMs + pauseDuration;
        
        const newTimingState = {
          ...current,
          isPaused: false,
          pausedAtMs: null,
          totalPauseDurationMs: newTotalPauseDuration,
          lastUpdateTime: now,
        };
        
        setTimingState(newTimingState);
        timingStateRef.current = newTimingState;
        
        // Update session state with pause duration
        if (sessionStateRef.current) {
          const updatedState = {
            ...sessionStateRef.current,
            isPaused: false,
            pausedAtMs: null,
            totalPauseDurationMs: newTotalPauseDuration,
            timestamp: now,
          };
          setSessionState(updatedState);
          sessionStateRef.current = updatedState;
          saveSessionState(updatedState);
        }
      } else {
        // Fallback if pausedAtMs is null
        const newTimingState = {
          ...current,
          isPaused: false,
          pausedAtMs: null,
          lastUpdateTime: now,
        };
        
        setTimingState(newTimingState);
        timingStateRef.current = newTimingState;
        
        if (sessionStateRef.current) {
          const updatedState = {
            ...sessionStateRef.current,
            isPaused: false,
            pausedAtMs: null,
            timestamp: now,
          };
          setSessionState(updatedState);
          sessionStateRef.current = updatedState;
          saveSessionState(updatedState);
        }
      }
    }
    
    Haptics.selectionAsync();
  };

  // Debounced save function to reduce persistence frequency
  const debouncedSaveSessionState = (state: any, delay: number = 2000) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Validate state before saving
        if (!state || !state.ritualId || typeof state.currentStep !== 'number') {
          console.warn('Invalid session state, skipping save:', state);
          return;
        }
        
        await AsyncStorage.setItem('ritualSessionState', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving session state:', error);
        // Try to recover by clearing corrupted state
        try {
          await AsyncStorage.removeItem('ritualSessionState');
        } catch (clearError) {
          console.error('Error clearing corrupted session state:', clearError);
        }
      }
    }, delay);
  };

  const saveSessionState = async (state: any) => {
    try {
      // Validate state before saving
      if (!state || !state.ritualId || typeof state.currentStep !== 'number') {
        console.warn('Invalid session state, skipping save:', state);
        return;
      }
      
      await AsyncStorage.setItem('ritualSessionState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving session state:', error);
      // Try to recover by clearing corrupted state
      try {
        await AsyncStorage.removeItem('ritualSessionState');
      } catch (clearError) {
        console.error('Error clearing corrupted session state:', clearError);
      }
    }
  };

  const loadSessionState = async () => {
    try {
      const saved = await AsyncStorage.getItem('ritualSessionState');
      if (saved) {
        const state = JSON.parse(saved);
        
        // Enhanced validation using the validation function
        if (!validateTimingData(state)) {
          console.warn('Corrupted session state detected, clearing:', state);
          await clearSessionState();
          setSavedSession(null);
          return null;
        }
        
        // Check if state is too old (more than 24 hours)
        const stateAge = Date.now() - (state.timestamp || 0);
        if (stateAge > 24 * 60 * 60 * 1000) {
          console.warn('Session state too old, clearing:', stateAge);
          await clearSessionState();
          setSavedSession(null);
          return null;
        }
        
        // Check for extended backgrounding (more than 2 hours)
        const lastUpdateAge = Date.now() - (state.lastUpdateTime || state.timestamp || 0);
        if (lastUpdateAge > 2 * 60 * 60 * 1000) {
          console.warn('Extended backgrounding detected, offering recovery options');
          // Could show user dialog here about long interruption
        }
        
        // Reconstruct timing state if needed
        const reconstructedState = reconstructSessionState(state);
        
        setSessionState(reconstructedState);
        sessionStateRef.current = reconstructedState;
        setSavedSession(reconstructedState);
        return reconstructedState;
      }
    } catch (error) {
      console.error('Error loading session state:', error);
      // Clear corrupted state
      try {
        await clearSessionState();
      } catch (clearError) {
        console.error('Error clearing corrupted session state:', clearError);
      }
    }
    setSavedSession(null);
    return null;
  };

  const reconstructSessionState = (state: any) => {
    const now = Date.now();
    
    // If the session was paused when saved, maintain that state
    if (state.isPaused && state.pausedAtMs) {
      // Calculate additional pause time since last update
      const additionalPauseTime = now - (state.lastUpdateTime || state.timestamp);
      return {
        ...state,
        totalPauseDurationMs: (state.totalPauseDurationMs || 0) + additionalPauseTime,
        stepPauseDurationMs: (state.stepPauseDurationMs || 0) + additionalPauseTime,
        lastUpdateTime: now,
      };
    }
    
    // If session was active, calculate what the timer should be now
    if (!state.isPaused && state.stepStartMs) {
      const elapsedSinceLastUpdate = now - (state.lastUpdateTime || state.timestamp);
      const currentStepTime = (state.stepTimer || 0) + Math.floor(elapsedSinceLastUpdate / 1000);
      
      return {
        ...state,
        stepTimer: currentStepTime,
        lastUpdateTime: now,
      };
    }
    
    return {
      ...state,
      lastUpdateTime: now,
    };
  };

  const checkForSavedSession = async () => {
    try {
      const saved = await AsyncStorage.getItem('ritualSessionState');
      if (saved) {
        const state = JSON.parse(saved);
        // Check if it's the same ritual type
        if (state.ritualType === selectedRitualType) {
          setSavedSession(state);
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking saved session:', error);
    }
    setSavedSession(null);
    return false;
  };

  const clearSessionState = async () => {
    try {
      await AsyncStorage.removeItem('ritualSessionState');
      setSessionState(null);
      sessionStateRef.current = null;
    } catch (error) {
      console.error('Error clearing session state:', error);
    }
  };

  const recoverFromCorruptedState = () => {
    console.warn('Recovering from corrupted timer state');
    
    // Reset all timer-related states
    setStepCompleted(false);
    setIsStepOverTime(false);
    setShowCompletionPrompt(false);
    setAutoAdvanceCountdown(0);
    
    // Reset consolidated timing state
    const resetTimingState = {
      stepStartMs: Date.now(),
      sessionStartMs: timingState.sessionStartMs || Date.now(),
      pausedAtMs: null,
      totalPauseDurationMs: 0,
      stepCompletionTimes: timingState.stepCompletionTimes || [],
      lastUpdateTime: Date.now(),
      isPaused: false,
      stepTimer: 0,
    };
    
    setTimingState(resetTimingState);
    timingStateRef.current = resetTimingState;
    
    // Stop all animations
    completionPulse.stopAnimation();
    completionPulse.setValue(1);
    
    // Clear intervals
    if (masterTimerRef.current) {
      clearTimeout(masterTimerRef.current);
      masterTimerRef.current = null;
    }
    if (autoAdvanceInterval.current) {
      clearInterval(autoAdvanceInterval.current);
      autoAdvanceInterval.current = null;
    }
    
    // Clear corrupted session state
    clearSessionState();
    
    // Show recovery message with options
    Alert.alert(
      'Timer Reset',
      'The timer has been reset due to a technical issue. Your ritual progress has been preserved. Would you like to continue or start fresh?',
      [
        { text: 'Start Fresh', style: 'destructive', onPress: startNewRitual },
        { text: 'Continue', style: 'default' }
      ]
    );
  };

  const saveInProgressAndClose = async () => {
    // Clean up timers first
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    // Calculate final elapsed time and save it
    if (sessionState && timingState.stepStartMs) {
      const finalElapsedTime = Math.floor((Date.now() - timingState.stepStartMs) / 1000);
      const updatedState = {
        ...sessionState,
        stepTimer: finalElapsedTime,
        stepStartMs: timingState.stepStartMs, // Keep original start time
        timestamp: Date.now(),
      };
      setSessionState(updatedState);
      sessionStateRef.current = updatedState;
      await saveSessionState(updatedState);
    }
    
    setIsRitualActive(false);
    setRitualModalState('preparation');
    setSavedSession(null);
    setShowRitualModal(false);
  };

  const getPreparationSteps = (ritualType: string) => {
    const preparations = {
      morning: [
        'Find a quiet space with natural light',
        'Ensure you have 15 minutes uninterrupted',
        'Prepare yoga mat or comfortable surface',
        'Remove distractions (phone, notifications)',
        'Set intention for your morning practice'
      ],
      evening: [
        'Create dim, calming lighting',
        'Find a comfortable, quiet space',
        'Gather journal and writing materials',
        'Ensure 20 minutes of privacy',
        'Prepare for reflection and introspection'
      ],
      cleansing: [
        'Ensure good ventilation in your space',
        'Prepare cleansing materials (sage, incense)',
        'Find a private, undisturbed area',
        'Have access to water for cleansing',
        'Set intention for energy clearing'
      ],
      grounding: [
        'Access to outdoor space or open window',
        'Prepare comfortable seating or standing area',
        'Ensure minimal interruptions',
        'Connect with earth energy intention',
        'Remove shoes if possible for bare feet'
      ],
      energizing: [
        'Clear movement space for physical activity',
        'Ensure privacy for vocal exercises',
        'Prepare energizing music (optional)',
        'Set intention for energy activation',
        'Ensure you can move freely and safely'
      ]
    };
    return preparations[ritualType as keyof typeof preparations] || preparations.morning;
  };

  const skipStep = () => {
    if (!currentRitual) return;
    
    const currentStepData = currentRitual.steps[currentStep];
    if (currentStepData.isOptional) {
      // Clean up any active completion states
      cancelAutoAdvance();
      setStepCompleted(false);
      setIsStepOverTime(false);
      setShowCompletionPrompt(false);
      completionPulse.stopAnimation();
      completionPulse.setValue(1);
      
      nextStep();
    } else {
      Alert.alert(
        'Cannot Skip', 
        'This step is required for the ritual. You can continue with the current step or wait for it to complete naturally.',
        [
          { text: 'Continue Current Step', style: 'cancel' },
          { 
            text: 'Force Skip', 
            style: 'destructive', 
            onPress: () => {
              // Allow force skip with warning
              Alert.alert(
                'Force Skip',
                'Skipping required steps may affect the ritual\'s effectiveness. Are you sure?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Skip Anyway', style: 'destructive', onPress: nextStep }
                ]
              );
            }
          }
        ]
      );
    }
  };

  const completeRitual = async () => {
    if (!currentRitual) return;
    
    setIsRitualActive(false);
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    // Clear session state
    await clearSessionState();
    
    const session: RitualSession = {
      id: `session-${Date.now()}`,
      ritualId: currentRitual.id,
      userId: userData.name,
      completedAt: new Date(),
      rating: 5, // Default rating
      notes: 'Completed successfully',
    };
    
    await saveRitualSession(session);
    setRitualModalState('preparation');
    setSavedSession(null);
    setShowRitualModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Ritual Complete!', 'Great job completing your ritual. Your streak continues!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRitualTypeColor = (type: string) => {
    const ritualType = ritualTypes.find(rt => rt.id === type);
    return ritualType ? ritualType.color : iOS17Theme.colors.systemBlue;
  };

  const getTypePalette = (type: string) => {
    switch (type) {
      case 'morning': return RITUAL_COLORS.morning;
      case 'evening': return RITUAL_COLORS.evening;
      case 'cleansing': return RITUAL_COLORS.cleansing;
      case 'grounding': return RITUAL_COLORS.grounding;
      case 'energizing': return RITUAL_COLORS.energizing;
      default: return { primary: getRitualTypeColor(type), light: '#FFFFFF10', accent: getRitualTypeColor(type) } as any;
    }
  };

  const getRitualTypeIcon = (type: string) => {
    const ritualType = ritualTypes.find(rt => rt.id === type);
    return ritualType ? ritualType.icon : '🌟';
  };

  const getDifficultyColor = (difficulty: string) => {
    return (DIFFICULTY_COLORS as any)[difficulty] || iOS17Theme.colors.label;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!currentRitual) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.cardWrapper}>
        <View style={styles.cardInner}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Rituals</Text>
          <TouchableOpacity
            style={styles.streakButton}
            onPress={() => setShowStreakModal(true)}
          >
            <Text style={styles.streakButtonText}>🔥 {ritualStreak}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.ritualTypesScroll}
          contentContainerStyle={styles.ritualTypesContainer}
        >
          {ritualTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.ritualTypeButton,
                selectedRitualType === type.id && styles.selectedRitualTypeButton,
                { 
                  borderColor: type.color,
                  backgroundColor: selectedRitualType === type.id 
                    ? type.color
                    : `${type.color}1A`
                }
              ]}
              onPress={() => {
                setSelectedRitualType(type.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.ritualTypeIcon}>{type.icon}</Text>
              <Text style={[
                styles.ritualTypeText,
                selectedRitualType === type.id && styles.selectedRitualTypeText
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.ritualContainer}>
          <View style={styles.ritualHeader}>
            <Text style={styles.ritualName}>{currentRitual.name}</Text>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(currentRitual.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>
                {currentRitual.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.ritualDetails}>
            <Text style={styles.ritualDuration}>
              ⏱️ {currentRitual.duration} minutes
            </Text>
            <Text style={styles.ritualSteps}>
              📋 {currentRitual.steps.length} steps
            </Text>
          </View>

          <Text style={styles.ritualDescription}>
            Aligned with {currentRitual.zodiacAlignment.join(', ')} energy and {currentRitual.planetaryAlignment.join(', ')} influences.
          </Text>

          <View style={styles.ritualStepsPreview}>
            <Text style={styles.stepsPreviewTitle}>Steps</Text>
            {(showAllSteps ? currentRitual.steps : currentRitual.steps.slice(0, 3)).map((step, index) => (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepBulletDot} />
                <Text style={styles.stepText}>{showAllSteps ? `${index + 1}. ` : ''}{step.description}</Text>
              </View>
            ))}
            {currentRitual.steps.length > 3 && !showAllSteps && (
              <TouchableOpacity onPress={() => setShowAllSteps(true)}>
                <Text style={styles.moreSteps}>
                  +{currentRitual.steps.length - 3} more steps
                </Text>
              </TouchableOpacity>
            )}
            {showAllSteps && (
              <TouchableOpacity onPress={() => setShowAllSteps(false)}>
                <Text style={styles.moreSteps}>Show less</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startRitualButton, { backgroundColor: getRitualTypeColor(selectedRitualType) }]}
          onPress={startRitual}
        >
          <Text style={styles.startRitualButtonText}>Start Ritual</Text>
        </TouchableOpacity>
        </View>
      </View>

      {/* Combined Ritual Modal */}
      <Modal
        visible={showRitualModal}
        animationType="slide"
        onRequestClose={() => setShowRitualModal(false)}
      >
        {currentRitual && (
          <View style={styles.modalContainer}>
            <ImageBackground source={require('../../../assets/meditation.jpg')} style={styles.modalBackdrop} resizeMode="cover">
            </ImageBackground>
            <BlurView intensity={14} tint="systemMaterialDark" style={styles.modalBlurView}>
              {ritualModalState === 'preparation' ? (
                <>
                  <View style={styles.preparationHeader}>
                    <Text style={styles.preparationTitle}>Prepare for {currentRitual.name}</Text>
                  </View>
                  
                  <View style={styles.preparationContent}>
                    <Text style={styles.preparationSubtitle}>
                      Let's create the perfect environment for your practice
                    </Text>
                    
                    <View style={styles.preparationSteps}>
                      {getPreparationSteps(selectedRitualType).map((step, index) => (
                        <View key={index} style={styles.preparationStep}>
                          <View style={styles.preparationStepNumber}>
                            <Text style={styles.preparationStepNumberText}>{index + 1}</Text>
                          </View>
                          <Text style={styles.preparationStepText}>{step}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <View style={styles.preparationFooter}>
                      <Text style={styles.preparationNote}>
                        Take your time to set up your space. When you're ready, we'll begin your ritual practice.
                      </Text>
                      
                      <TouchableOpacity
                        style={[styles.beginRitualButton, { backgroundColor: getRitualTypeColor(selectedRitualType) }]}
                        onPress={beginRitualSession}
                      >
                        <Text style={styles.beginRitualButtonText}>I'm Ready to Begin</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : ritualModalState === 'resume' ? (
                <>
                  <View style={styles.preparationHeader}>
                    <Text style={styles.preparationTitle}>Continue Your Journey</Text>
                  </View>
                  
                  <View style={styles.preparationContent}>
                    <Text style={styles.preparationSubtitle}>
                      You have an unfinished {currentRitual.name} session
                    </Text>
                    
                    <View style={styles.resumeInfo}>
                      <View style={styles.resumeInfoItem}>
                        <Text style={styles.resumeInfoLabel}>Progress</Text>
                        <Text style={styles.resumeInfoValue}>Step {savedSession?.currentStep + 1} of {currentRitual.steps.length}</Text>
                      </View>
                      <View style={styles.resumeInfoItem}>
                        <Text style={styles.resumeInfoLabel}>Completed Steps</Text>
                        <Text style={styles.resumeInfoValue}>{savedSession?.completedSteps.length || 0}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.preparationFooter}>
                      <TouchableOpacity
                        style={[styles.resumeButton, { backgroundColor: getRitualTypeColor(selectedRitualType) }]}
                        onPress={resumeRitualSession}
                      >
                        <Text style={styles.resumeButtonText}>Resume Ritual</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.startNewButton}
                        onPress={startNewRitual}
                      >
                        <Text style={styles.startNewButtonText}>Start Fresh</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{currentRitual.name}</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => {
                        Alert.alert(
                          'End Session?',
                          'Your progress will be saved so you can resume later.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Save & Exit', style: 'destructive', onPress: saveInProgressAndClose },
                          ]
                        );
                      }}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
              
              <View style={styles.ritualSessionContent}>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    Step {currentStep + 1} of {currentRitual.steps.length}
                  </Text>
                  <View style={styles.stepProgressContainer}>
                    {currentRitual.steps.map((_, idx) => (
                      <View key={`step-${idx}`} style={styles.stepProgressItem}>
                        <View style={[
                          styles.stepIndicatorCircle,
                          completedSteps.includes(idx) && { 
                            backgroundColor: getTypePalette(selectedRitualType).primary,
                            shadowColor: getTypePalette(selectedRitualType).primary,
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                          },
                          idx === currentStep && { 
                            backgroundColor: getTypePalette(selectedRitualType).accent,
                            transform: [{ scale: 1.1 }],
                          },
                        ]}>
                          {completedSteps.includes(idx) && <Text style={styles.stepCheckmark}>✓</Text>}
                        </View>
                        {idx < currentRitual.steps.length - 1 && (
                          <View style={[
                            styles.stepConnector,
                            completedSteps.includes(idx) && { backgroundColor: getTypePalette(selectedRitualType).primary },
                          ]} />
                        )}
                      </View>
                    ))}
                  </View>
                  <View style={styles.progressMetaRow}>
                    {(() => {
                      const timingStatus = getStepTimingStatus();
                      const stepPct = timingStatus ? timingStatus.progressPercentage : 0;
                      
                      // Calculate total ritual progress based on ACTIVE time (excluding pauses)
                      const totalExpectedDurationSec = currentRitual.steps.reduce((s, st) => s + (st.duration || 0) * 60, 0);
                      
                      // Use step completion times for completed steps (active time)
                      const completedStepsActiveTime = timingState.stepCompletionTimes.reduce((sum, time) => sum + time, 0);
                      
                      // Current step active time (excluding pauses)
                      const currentStepActiveTime = calculateStepElapsedTime();
                      
                      // Total active time for progress calculation
                      const totalActiveTimeSec = completedStepsActiveTime + currentStepActiveTime;
                      
                      // Calculate progress percentage based on active time
                      const totalPct = totalExpectedDurationSec > 0 ? 
                        Math.round((totalActiveTimeSec / totalExpectedDurationSec) * 100) : 0;
                      
                      // Calculate remaining time based on expected durations of remaining steps
                      const remainingStepsDurationSec = currentRitual.steps.slice(currentStep + 1).reduce((s, st) => s + (st.duration || 0) * 60, 0);
                      const currentStepRemainingSec = timingStatus ? Math.max(0, timingStatus.remaining) : 0;
                      const totalRemainingSec = currentStepRemainingSec + remainingStepsDurationSec;
                      
                      const format = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
                      
                      return (
                        <>
                          <View style={styles.progressMetaItem}>
                            <Text style={styles.progressMetaLabel}>Step</Text>
                            <Text style={[
                              styles.progressMetaValue,
                              timingStatus?.isOverTime && styles.progressMetaValueOverTime
                            ]}>
                              {stepPct}%
                            </Text>
                          </View>
                          <View style={styles.progressMetaItem}>
                            <Text style={styles.progressMetaLabel}>Ritual</Text>
                            <Text style={[
                              styles.progressMetaValue,
                              totalPct > 100 && styles.progressMetaValueOverTime
                            ]}>
                              {totalPct}%
                            </Text>
                          </View>
                          <View style={styles.progressMetaItem}>
                            <Text style={styles.progressMetaLabel}>ETA</Text>
                            <Text style={styles.progressMetaValue}>
                              {totalRemainingSec > 0 ? format(totalRemainingSec) : '00:00'}
                            </Text>
                          </View>
                          {timingState.totalPauseDurationMs > 0 && (
                            <View style={styles.progressMetaItem}>
                              <Text style={styles.progressMetaLabel}>Paused</Text>
                              <Text style={[styles.progressMetaValue, styles.progressMetaValuePaused]}>
                                {format(Math.floor(timingState.totalPauseDurationMs / 1000))}
                              </Text>
                            </View>
                          )}
                        </>
                      );
                    })()}
                  </View>
                </View>

                <View style={styles.currentStepContainer}>
                  <Text style={styles.currentStepTitle}>
                    {currentRitual.steps[currentStep].description}
                  </Text>
                  {(() => {
                    const desc = currentRitual.steps[currentStep].description.toLowerCase();
                    const timingStatus = getStepTimingStatus();
                    let tip = '';
                    let encouragement = '';
                    
                    // Contextual tips based on step content
                    if (desc.includes('breath') || desc.includes('breathe')) {
                      tip = 'Tip: Inhale for 4, hold 4, exhale 6.';
                      encouragement = 'Focus on the rhythm of your breath.';
                    } else if (desc.includes('meditat')) {
                      tip = 'Tip: Notice sensations without judgment.';
                      encouragement = 'Let thoughts come and go like clouds.';
                    } else if (desc.includes('journal') || desc.includes('write')) {
                      tip = 'Tip: Let thoughts flow freely; don\'t edit.';
                      encouragement = 'Your authentic voice matters.';
                    } else if (desc.includes('stretch') || desc.includes('pose')) {
                      tip = 'Tip: Move slowly; respect your range.';
                      encouragement = 'Honor your body\'s wisdom.';
                    } else if (desc.includes('visualize')) {
                      tip = 'Tip: Use vivid colors and sensations.';
                      encouragement = 'Engage all your senses.';
                    } else if (desc.includes('gratitude') || desc.includes('grateful')) {
                      tip = 'Tip: Feel the emotion, not just think it.';
                      encouragement = 'Gratitude opens the heart.';
                    } else if (desc.includes('reflect') || desc.includes('review')) {
                      tip = 'Tip: Be honest and compassionate with yourself.';
                      encouragement = 'Self-reflection is a gift.';
                    }
                    
                    // Add timing-based encouragement
                    if (timingStatus?.isOverTime && !timingStatus.isSignificantlyOverTime) {
                      encouragement += ' Take your time - there\'s no rush.';
                    } else if (timingStatus?.isSignificantlyOverTime) {
                      encouragement += ' You\'re investing deeply in this practice.';
                    }
                    
                    if (!tip && !encouragement) return null;
                    
                    return (
                      <View style={styles.guidanceContainer}>
                        {tip && <Text style={styles.guidanceText}>{tip}</Text>}
                        {encouragement && <Text style={styles.encouragementText}>{encouragement}</Text>}
                      </View>
                    );
                  })()}
                  
                  <Animated.View style={[
                    styles.timerContainer,
                    stepCompleted && { transform: [{ scale: completionPulse }] },
                    timingState.isPaused && styles.timerContainerPaused
                  ]}>
                    <Text style={styles.timerLabel}>
                      {timingState.isPaused ? 'PAUSED' : 'CURRENT STEP'}
                    </Text>
                    <Text style={[
                      styles.timerDisplay,
                      stepCompleted && styles.timerDisplayCompleted,
                      isStepOverTime && styles.timerDisplayOverTime,
                      timingState.isPaused && styles.timerDisplayPaused
                    ]}>
                      {formatTime(timingState.stepTimer)}
                    </Text>
                    <Text style={[
                      styles.timerDescription,
                      stepCompleted && styles.timerDescriptionCompleted
                    ]}>
                      {(() => {
                        const timingStatus = getStepTimingStatus();
                        if (!timingStatus) return 'No time limit for this step';
                        
                        if (timingState.isPaused) {
                          const pauseDuration = timingState.pausedAtMs ? Math.floor((Date.now() - timingState.pausedAtMs) / 1000) : 0;
                          return `Paused for ${formatTime(pauseDuration)}. Total pause time: ${formatTime(Math.floor(timingState.totalPauseDurationMs / 1000))}`;
                        }
                        
                        if (stepCompleted) {
                          if (timingStatus.isSignificantlyOverTime) {
                            return `Step complete! You've spent ${formatTime(timingStatus.overTime)} extra time. Ready to continue?`;
                          } else if (timingStatus.isOverTime) {
                            return `Step complete! You can continue or proceed.`;
                          } else {
                            return `Step complete! Ready to continue?`;
                          }
                        } else {
                          if (timingStatus.isOverTime) {
                            return `Step time exceeded by ${formatTime(timingStatus.overTime)}. You can continue or proceed.`;
                          } else {
                            return `Step will complete in ${formatTime(timingStatus.remaining)}`;
                          }
                        }
                      })()}
                    </Text>
                  </Animated.View>
                  

                  {currentRitual.steps[currentStep].materials && (
                    <View style={styles.materialsContainer}>
                      <Text style={styles.materialsTitle}>Materials needed</Text>
                      <View style={styles.materialCardsRow}>
                        {currentRitual.steps[currentStep].materials!.map((material, index) => (
                          <View key={index} style={styles.materialCard}>
                            <Text style={styles.materialCardIcon}>✨</Text>
                            <Text style={styles.materialCardText}>{material}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.ritualControls}>
                  <View style={styles.leftControlsGroup}>
                    {currentRitual.steps[currentStep].isOptional && (
                      <TouchableOpacity
                        style={styles.skipButton}
                        onPress={skipStep}
                      >
                        <Text style={styles.skipButtonText}>Skip Step</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={styles.pauseButton}
                      onPress={togglePause}
                    >
                      <Text style={styles.pauseButtonText}>
                        {timingState.isPaused ? 'Resume' : 'Pause'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      { 
                        backgroundColor: stepCompleted 
                          ? getTypePalette(selectedRitualType).accent 
                          : getRitualTypeColor(selectedRitualType), 
                        shadowColor: getTypePalette(selectedRitualType).primary 
                      },
                    ]}
                    onPress={nextStep}
                  >
                    <Text style={styles.nextButtonText}>
                      {stepCompleted 
                        ? (currentStep < currentRitual.steps.length - 1 ? 'Continue Journey' : 'Complete Ritual')
                        : (currentStep < currentRitual.steps.length - 1 ? 'Continue Journey' : 'Complete Ritual')
                      }
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Step Completion Prompt */}
                {showCompletionPrompt && (
                  <View style={styles.completionPromptOverlay}>
                    <BlurView intensity={20} tint="systemMaterial" style={styles.completionPromptBlur}>
                      <View style={styles.completionPromptContent}>
                        <Text style={styles.completionPromptTitle}>
                          {(() => {
                            const timingStatus = getStepTimingStatus();
                            if (timingStatus?.isSignificantlyOverTime) {
                              return 'Step Complete!';
                            } else if (timingStatus?.isOverTime) {
                              return 'Step Complete!';
                            } else {
                              return 'Step Complete!';
                            }
                          })()}
                        </Text>
                        <Text style={styles.completionPromptSubtitle}>
                          {(() => {
                            const timingStatus = getStepTimingStatus();
                            if (timingStatus?.isSignificantlyOverTime) {
                              return `You've spent ${formatTime(timingStatus.overTime)} extra time on this step. Take your time - you can continue or move forward when ready.`;
                            } else if (timingStatus?.isOverTime) {
                              return 'You\'ve spent a bit extra time on this step. Ready to continue?';
                            } else {
                              return 'Great job! Ready to move to the next step?';
                            }
                          })()}
                        </Text>
                        
                        {autoAdvanceCountdown > 0 && (
                          <Text style={styles.autoAdvanceText}>
                            Auto-continuing in {autoAdvanceCountdown}s
                          </Text>
                        )}
                        
                        <View style={styles.completionPromptButtons}>
                          <TouchableOpacity
                            style={styles.continueButton}
                            onPress={cancelAutoAdvance}
                          >
                            <Text style={styles.continueButtonText}>Continue Current Step</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.nextStepButton, { backgroundColor: getRitualTypeColor(selectedRitualType) }]}
                            onPress={nextStep}
                          >
                            <Text style={styles.nextStepButtonText}>
                              {currentStep < currentRitual.steps.length - 1 ? 'Next Step' : 'Complete Ritual'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </BlurView>
                  </View>
                )}
              </View>
                </>
              )}
            </BlurView>
          </View>
        )}
      </Modal>

      {/* Streak Modal */}
      <Modal
        visible={showStreakModal}
        animationType="slide"
        onRequestClose={() => setShowStreakModal(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={20} tint="systemMaterial" style={styles.modalBlurView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ritual Streak</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowStreakModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.streakContent}>
              <Text style={styles.streakNumber}>{ritualStreak}</Text>
              <Text style={styles.streakLabel}>Days in a row</Text>
              
              <View style={styles.streakMilestones}>
                <Text style={styles.milestonesTitle}>Streak Milestones:</Text>
                <View style={styles.milestoneItem}>
                  <Text style={[styles.milestoneIcon, ritualStreak >= 7 && styles.achievedMilestone]}>
                    {ritualStreak >= 7 ? '✅' : '⭕'}
                  </Text>
                  <Text style={styles.milestoneText}>7 days - Building the habit</Text>
                </View>
                <View style={styles.milestoneItem}>
                  <Text style={[styles.milestoneIcon, ritualStreak >= 21 && styles.achievedMilestone]}>
                    {ritualStreak >= 21 ? '✅' : '⭕'}
                  </Text>
                  <Text style={styles.milestoneText}>21 days - Habit formation</Text>
                </View>
                <View style={styles.milestoneItem}>
                  <Text style={[styles.milestoneIcon, ritualStreak >= 66 && styles.achievedMilestone]}>
                    {ritualStreak >= 66 ? '✅' : '⭕'}
                  </Text>
                  <Text style={styles.milestoneText}>66 days - Automatic behavior</Text>
                </View>
              </View>

              <ScrollView style={styles.recentHistory}>
                <Text style={styles.historyTitle}>Recent Rituals:</Text>
                {ritualHistory.slice(0, 10).map((session) => (
                  <View key={session.id} style={styles.historyItem}>
                    <Text style={styles.historyDate}>
                      {formatDate(new Date(session.completedAt))}
                    </Text>
                    <Text style={styles.historyRitual}>
                      {rituals.find(r => r.id === session.ritualId)?.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </BlurView>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: iOS17Theme.spacing.md,
  },
  cardWrapper: {
    borderRadius: iOS17Theme.cornerRadius.large,
    marginHorizontal: iOS17Theme.spacing.md,
    borderWidth: 1,
    borderColor: iOS17Theme.colors.separator,
    backgroundColor: iOS17Theme.colors.systemBackground,
    overflow: 'hidden',
  },
  cardInner: {
    padding: iOS17Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.lg,
  },
  title: {
    ...iOS17Theme.text.sectionTitle,
    marginBottom: 0,
  },
  streakButton: {
    paddingHorizontal: iOS17Theme.spacing.sm,
    paddingVertical: iOS17Theme.spacing.xs,
    backgroundColor: iOS17Theme.colors.systemFill,
    borderRadius: iOS17Theme.cornerRadius.small,
  },
  streakButtonText: {
    ...iOS17Theme.text.caption,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  ritualTypesScroll: {
    marginBottom: iOS17Theme.spacing.md,
  },
  ritualTypesContainer: {
    paddingHorizontal: iOS17Theme.spacing.xs,
  },
  ritualTypeButton: {
    alignItems: 'center',
    paddingHorizontal: iOS17Theme.spacing.md,
    paddingVertical: iOS17Theme.spacing.md,
    marginHorizontal: iOS17Theme.spacing.xs,
    backgroundColor: iOS17Theme.colors.systemBackground,
    borderRadius: iOS17Theme.cornerRadius.medium,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 96,
    minHeight: 64,
    // glass-like feel
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  selectedRitualTypeButton: {
    backgroundColor: iOS17Theme.colors.systemFill,
  },
  ritualTypeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  ritualTypeText: {
    ...iOS17Theme.text.caption,
    textAlign: 'center',
    color: iOS17Theme.colors.secondaryLabel,
  },
  selectedRitualTypeText: {
    fontWeight: '600',
    color: iOS17Theme.colors.label,
  },
  ritualContainer: {
    marginBottom: iOS17Theme.spacing.xl,
  },
  ritualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.md,
  },
  ritualName: {
    ...iOS17Theme.text.cardTitle,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: iOS17Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: iOS17Theme.cornerRadius.small,
  },
  difficultyText: {
    ...iOS17Theme.text.caption2,
    color: '#0B1324',
    fontWeight: '600',
    fontSize: 11,
  },
  ritualDetails: {
    flexDirection: 'row',
    marginBottom: iOS17Theme.spacing.md,
  },
  ritualDuration: {
    ...iOS17Theme.text.caption2,
    color: iOS17Theme.colors.secondaryLabel,
    marginRight: iOS17Theme.spacing.md,
  },
  ritualSteps: {
    ...iOS17Theme.text.caption2,
    color: iOS17Theme.colors.secondaryLabel,
  },
  ritualDescription: {
    ...iOS17Theme.text.body,
    marginBottom: iOS17Theme.spacing.lg,
    fontStyle: 'normal',
    color: iOS17Theme.colors.label,
    lineHeight: 20,
  },
  ritualStepsPreview: {
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
    borderWidth: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: iOS17Theme.colors.tertiaryLabel,
    marginRight: iOS17Theme.spacing.sm,
  },
  stepText: {
    ...iOS17Theme.text.subheadline,
    color: '#FFFFFF',
    flex: 1,
  },
  stepsPreviewTitle: {
    ...iOS17Theme.text.subheadline,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: iOS17Theme.spacing.md,
  },
  stepPreview: {
    ...iOS17Theme.text.caption2,
    marginBottom: 2,
  },
  moreSteps: {
    ...iOS17Theme.text.caption2,
    color: iOS17Theme.colors.systemBlue,
    fontStyle: 'italic',
  },
  startRitualButton: {
    paddingVertical: iOS17Theme.spacing.lg,
    borderRadius: iOS17Theme.cornerRadius.large,
    alignItems: 'center',
    ...iOS17Theme.shadows.medium,
  },
  startRitualButtonText: {
    ...iOS17Theme.text.headline,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0B1324',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B1324',
  },
  modalBlurView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 72 : 48,
    borderBottomWidth: 0,
  },
  modalTitle: {
    ...iOS17Theme.text.sectionTitle,
    marginBottom: 0,
    fontSize: 26,
    lineHeight: 32,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF22',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ritualSessionContent: {
    flex: 1,
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.md,
  },
  progressContainer: {
    marginBottom: iOS17Theme.spacing.md,
  },
  progressText: {
    ...iOS17Theme.text.body,
    marginBottom: iOS17Theme.spacing.sm,
  },
  stepIndicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.sm,
  },
  stepProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: iOS17Theme.spacing.md,
  },
  stepProgressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicatorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF33',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF44',
  },
  stepCheckmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stepConnector: {
    width: 30,
    height: 2,
    backgroundColor: '#FFFFFF22',
    marginHorizontal: 4,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: iOS17Theme.spacing.md,
    paddingHorizontal: iOS17Theme.spacing.lg,
  },
  progressMetaItem: {
    alignItems: 'center',
  },
  progressMetaLabel: {
    ...iOS17Theme.text.caption2,
    color: iOS17Theme.colors.tertiaryLabel,
    marginBottom: 2,
  },
  progressMetaValue: {
    ...iOS17Theme.text.caption,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  progressMetaValueOverTime: {
    color: iOS17Theme.colors.systemOrange,
  },
  progressMetaValuePaused: {
    color: iOS17Theme.colors.secondaryLabel,
  },
  currentStepContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.md,
    paddingTop: iOS17Theme.spacing.md,
  },
  currentStepBadgeRow: {
    marginBottom: iOS17Theme.spacing.sm,
  },
  stepNumBadgeLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: iOS17Theme.colors.separator,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: iOS17Theme.colors.secondarySystemFill,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  stepNumTextLarge: {
    ...iOS17Theme.text.title2,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  currentStepTitle: {
    ...iOS17Theme.text.title2,
    textAlign: 'center',
    marginBottom: iOS17Theme.spacing.lg,
    lineHeight: 28,
  },
  guidanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: iOS17Theme.spacing.md,
    paddingVertical: iOS17Theme.spacing.sm,
    borderRadius: iOS17Theme.cornerRadius.medium,
    marginBottom: iOS17Theme.spacing.lg,
  },
  guidanceText: {
    ...iOS17Theme.text.footnote,
    color: iOS17Theme.colors.label,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 4,
  },
  encouragementText: {
    ...iOS17Theme.text.footnote,
    color: iOS17Theme.colors.systemBlue,
    textAlign: 'center',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: iOS17Theme.spacing.lg,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: iOS17Theme.colors.secondaryLabel,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: iOS17Theme.spacing.md,
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: '300',
    color: iOS17Theme.colors.label,
    letterSpacing: -2,
    marginBottom: iOS17Theme.spacing.lg,
    fontFamily: 'System',
  },
  timerDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: iOS17Theme.colors.label,
    textAlign: 'center',
    lineHeight: 22,
  },
  timerDisplayCompleted: {
    color: iOS17Theme.colors.systemGreen,
    fontWeight: '600',
  },
  timerDisplayOverTime: {
    color: iOS17Theme.colors.systemOrange,
    fontWeight: '600',
  },
  timerDescriptionCompleted: {
    color: iOS17Theme.colors.systemGreen,
    fontWeight: '600',
  },
  timerContainerPaused: {
    opacity: 0.7,
  },
  timerDisplayPaused: {
    color: iOS17Theme.colors.secondaryLabel,
  },
  preparationContent: {
    flex: 1,
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.md,
  },
  preparationSubtitle: {
    ...iOS17Theme.text.body,
    color: iOS17Theme.colors.secondaryLabel,
    textAlign: 'center',
    marginBottom: iOS17Theme.spacing.xl,
    lineHeight: 24,
  },
  preparationSteps: {
    marginBottom: iOS17Theme.spacing.xl,
  },
  preparationStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.lg,
  },
  preparationStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: iOS17Theme.spacing.md,
  },
  preparationStepNumberText: {
    ...iOS17Theme.text.caption,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  preparationStepText: {
    ...iOS17Theme.text.body,
    color: iOS17Theme.colors.label,
    flex: 1,
    lineHeight: 22,
  },
  preparationFooter: {
    alignItems: 'center',
  },
  preparationNote: {
    ...iOS17Theme.text.footnote,
    color: iOS17Theme.colors.secondaryLabel,
    textAlign: 'center',
    marginBottom: iOS17Theme.spacing.xl,
    lineHeight: 20,
  },
  beginRitualButton: {
    paddingHorizontal: iOS17Theme.spacing.xl,
    paddingVertical: iOS17Theme.spacing.lg,
    borderRadius: iOS17Theme.cornerRadius.large,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
  },
  beginRitualButtonText: {
    ...iOS17Theme.text.headline,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  preparationHeader: {
    alignItems: 'center',
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 100 : 76,
  },
  preparationTitle: {
    ...iOS17Theme.text.sectionTitle,
    marginBottom: 0,
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
  },
  resumeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: iOS17Theme.cornerRadius.medium,
    padding: iOS17Theme.spacing.lg,
    marginBottom: iOS17Theme.spacing.xl,
  },
  resumeInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.sm,
  },
  resumeInfoLabel: {
    ...iOS17Theme.text.footnote,
    color: iOS17Theme.colors.secondaryLabel,
  },
  resumeInfoValue: {
    ...iOS17Theme.text.body,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  resumeButton: {
    paddingHorizontal: iOS17Theme.spacing.xl,
    paddingVertical: iOS17Theme.spacing.lg,
    borderRadius: iOS17Theme.cornerRadius.large,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    marginBottom: iOS17Theme.spacing.md,
  },
  resumeButtonText: {
    ...iOS17Theme.text.headline,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  startNewButton: {
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  startNewButtonText: {
    ...iOS17Theme.text.body,
    color: iOS17Theme.colors.label,
    textAlign: 'center',
  },
  materialsContainer: {
    backgroundColor: '#FFFFFF10',
    padding: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.medium,
    marginBottom: iOS17Theme.spacing.lg,
  },
  materialsTitle: {
    ...iOS17Theme.text.body,
    marginBottom: iOS17Theme.spacing.sm,
  },
  materialCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  materialCard: {
    width: (width - iOS17Theme.spacing.lg * 2 - 8) / 2,
    backgroundColor: '#FFFFFF12',
    borderRadius: iOS17Theme.cornerRadius.medium,
    paddingVertical: iOS17Theme.spacing.md,
    paddingHorizontal: iOS17Theme.spacing.md,
    alignItems: 'flex-start',
  },
  materialCardIcon: {
    fontSize: 16,
    marginBottom: 6,
  },
  materialCardText: {
    ...iOS17Theme.text.body,
    color: '#FFFFFF',
  },
  ritualControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: iOS17Theme.spacing.xs,
    paddingBottom: iOS17Theme.spacing.xxxl,
  },
  leftControlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leftControlsSpacer: {
    width: 1,
    height: 1,
  },
  pauseButton: {
    paddingHorizontal: iOS17Theme.spacing.md,
    paddingVertical: iOS17Theme.spacing.sm,
    backgroundColor: iOS17Theme.colors.secondarySystemFill,
    borderRadius: iOS17Theme.cornerRadius.medium,
  },
  pauseButtonText: {
    ...iOS17Theme.text.body,
    color: iOS17Theme.colors.label,
  },
  modeButton: {
    paddingHorizontal: iOS17Theme.spacing.md,
    paddingVertical: iOS17Theme.spacing.sm,
    backgroundColor: iOS17Theme.colors.secondarySystemFill,
    borderRadius: iOS17Theme.cornerRadius.medium,
    marginLeft: 8,
  },
  modeButtonText: {
    ...iOS17Theme.text.body,
    color: iOS17Theme.colors.label,
  },
  skipButton: {
    paddingHorizontal: iOS17Theme.spacing.md,
    paddingVertical: iOS17Theme.spacing.sm,
    backgroundColor: iOS17Theme.colors.systemFill,
    borderRadius: iOS17Theme.cornerRadius.medium,
  },
  skipButtonText: {
    ...iOS17Theme.text.body,
    color: iOS17Theme.colors.secondaryLabel,
  },
  nextButton: {
    paddingHorizontal: iOS17Theme.spacing.xl,
    paddingVertical: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.medium,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    alignSelf: 'center',
  },
  nextButtonText: {
    ...iOS17Theme.text.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  streakContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.md,
  },
  streakNumber: {
    ...iOS17Theme.text.largeTitle,
    fontSize: 72,
    fontWeight: 'bold',
    color: iOS17Theme.colors.systemOrange,
    marginBottom: iOS17Theme.spacing.sm,
  },
  streakLabel: {
    ...iOS17Theme.text.title2,
    marginBottom: iOS17Theme.spacing.xl,
  },
  streakMilestones: {
    width: '100%',
    marginBottom: iOS17Theme.spacing.lg,
  },
  milestonesTitle: {
    ...iOS17Theme.text.subheadline,
    marginBottom: iOS17Theme.spacing.md,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.sm,
  },
  milestoneIcon: {
    fontSize: 20,
    marginRight: iOS17Theme.spacing.sm,
  },
  achievedMilestone: {
    color: iOS17Theme.colors.systemGreen,
  },
  milestoneText: {
    ...iOS17Theme.text.body,
  },
  recentHistory: {
    flex: 1,
    width: '100%',
  },
  historyTitle: {
    ...iOS17Theme.text.subheadline,
    marginBottom: iOS17Theme.spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: iOS17Theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: iOS17Theme.colors.separator,
  },
  historyDate: {
    ...iOS17Theme.text.caption,
    color: iOS17Theme.colors.secondaryLabel,
  },
  historyRitual: {
    ...iOS17Theme.text.body,
  },
  completionPromptOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  completionPromptBlur: {
    borderRadius: iOS17Theme.cornerRadius.large,
    overflow: 'hidden',
    marginHorizontal: iOS17Theme.spacing.lg,
    maxWidth: width - iOS17Theme.spacing.lg * 2,
  },
  completionPromptContent: {
    padding: iOS17Theme.spacing.xl,
    alignItems: 'center',
  },
  completionPromptTitle: {
    ...iOS17Theme.text.title2,
    textAlign: 'center',
    marginBottom: iOS17Theme.spacing.sm,
    color: iOS17Theme.colors.label,
  },
  completionPromptSubtitle: {
    ...iOS17Theme.text.body,
    textAlign: 'center',
    marginBottom: iOS17Theme.spacing.lg,
    color: iOS17Theme.colors.secondaryLabel,
    lineHeight: 22,
  },
  autoAdvanceText: {
    ...iOS17Theme.text.caption,
    color: iOS17Theme.colors.systemOrange,
    marginBottom: iOS17Theme.spacing.lg,
    fontWeight: '600',
  },
  completionPromptButtons: {
    flexDirection: 'row',
    gap: iOS17Theme.spacing.md,
    width: '100%',
  },
  continueButton: {
    flex: 1,
    paddingVertical: iOS17Theme.spacing.md,
    paddingHorizontal: iOS17Theme.spacing.lg,
    borderRadius: iOS17Theme.cornerRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  continueButtonText: {
    ...iOS17Theme.text.body,
    color: iOS17Theme.colors.label,
    fontWeight: '500',
  },
  nextStepButton: {
    flex: 1,
    paddingVertical: iOS17Theme.spacing.md,
    paddingHorizontal: iOS17Theme.spacing.lg,
    borderRadius: iOS17Theme.cornerRadius.medium,
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  nextStepButtonText: {
    ...iOS17Theme.text.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default IOS17DailyRituals;
