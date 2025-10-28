import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Image,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColors } from '../theme/appTheme';
import { OpenAIService } from '../services/openai';
import { useUser } from '../contexts/UserContext';

const { width, height } = Dimensions.get('window');

// Much faster typing configuration - no pauses
const TYPING_CONFIG = {
  baseSpeed: 20, // Much faster base speed
  fastSpeed: 15, // Very fast for normal characters
  hapticWordMinLength: 4, // Less frequent haptics
};

// Conversation storage functions
const CONVERSATION_STORAGE_KEY = 'luna_conversation_history';
const DAILY_HISTORY_STORAGE_KEY = 'luna_daily_history';
const HISTORY_INDEX_KEY = 'luna_history_index';
const LAST_CONVERSATION_DATE_KEY = 'luna_last_conversation_date';

// Data structures for chat history
interface DailyLog {
  date: string; // YYYY-MM-DD format
  messages: Message[];
  metadata: SessionMetadata;
  summary: string;
  topics: string[];
}

interface SessionMetadata {
  startTime: string;
  endTime: string;
  messageCount: number;
  primaryTopics: string[];
  conversationDuration: number; // in minutes
}

interface HistoryIndex {
  availableDates: string[];
  totalSessions: number;
  lastUpdated: string;
}

const getStoredConversation = async (): Promise<Message[] | null> => {
  try {
    // Ensure we're using AsyncStorage, not localStorage
    if (typeof AsyncStorage !== 'undefined') {
      const stored = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects and ensure proper message structure
        return parsed.map((msg: any) => ({
          id: msg.id || `msg-${Date.now()}`,
          role: msg.role || (msg.isUser ? 'user' : 'assistant'),
          content: msg.content || msg.text || '',
          timestamp: new Date(msg.timestamp),
          isTyping: msg.isTyping || false,
          fullContent: msg.fullContent || msg.content || msg.text || '',
          typingCompleted: msg.typingCompleted !== false // Default to true for existing messages
        }));
      }
    }
  } catch (error) {
    console.error('Error loading conversation history:', error);
  }
  return null;
};

const storeConversation = async (messages: Message[]) => {
  try {
    // Ensure we're using AsyncStorage, not localStorage
    if (typeof AsyncStorage !== 'undefined') {
      // Only store the last 20 messages to prevent storage bloat
      const recentMessages = messages.slice(-20);
      await AsyncStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(recentMessages));
    }
  } catch (error) {
    console.error('Error storing conversation history:', error);
  }
};

const clearStoredConversation = async () => {
  try {
    // Ensure we're using AsyncStorage, not localStorage
    if (typeof AsyncStorage !== 'undefined') {
      await AsyncStorage.removeItem(CONVERSATION_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error clearing conversation history:', error);
  }
};

// Daily history storage functions
const getTodayDateString = (): string => {
  // Use local time to avoid UTC date rollover issues
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // YYYY-MM-DD format in local time
};

const archiveDailyConversation = async (messages: Message[], dateString?: string): Promise<void> => {
  try {
    if (typeof AsyncStorage !== 'undefined' && messages.length > 0) {
      const archiveDate = dateString || getTodayDateString();
      
      // Create session metadata
      const userMessages = messages.filter(msg => msg.role === 'user');
      const assistantMessages = messages.filter(msg => msg.role === 'assistant');
      
      const metadata: SessionMetadata = {
        startTime: messages[0]?.timestamp.toISOString() || new Date().toISOString(),
        endTime: messages[messages.length - 1]?.timestamp.toISOString() || new Date().toISOString(),
        messageCount: messages.length,
        primaryTopics: extractTopics(messages),
        conversationDuration: calculateDuration(messages)
      };
      
      // Generate summary
      const summary = generateDailySummary(messages, metadata);
      
      const dailyLog: DailyLog = {
        date: archiveDate,
        messages: messages,
        metadata: metadata,
        summary: summary,
        topics: metadata.primaryTopics
      };
      
      // Store daily log
      await AsyncStorage.setItem(`${DAILY_HISTORY_STORAGE_KEY}_${archiveDate}`, JSON.stringify(dailyLog));
      
      // Update history index
      await updateHistoryIndex(archiveDate);
      
      console.log(`Archived daily conversation for ${archiveDate}: ${messages.length} messages`);
    }
  } catch (error) {
    console.error('Error archiving daily conversation:', error);
  }
};

const getDailyHistory = async (): Promise<DailyLog[]> => {
  try {
    if (typeof AsyncStorage !== 'undefined') {
      const index = await getHistoryIndex();
      const dailyLogs: DailyLog[] = [];
      
      for (const date of index.availableDates) {
        const stored = await AsyncStorage.getItem(`${DAILY_HISTORY_STORAGE_KEY}_${date}`);
        if (stored) {
          const dailyLog = JSON.parse(stored);
          // Convert timestamp strings back to Date objects
          dailyLog.messages = dailyLog.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          dailyLogs.push(dailyLog);
        }
      }
      
      // Sort by date (newest first)
      return dailyLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } catch (error) {
    console.error('Error loading daily history:', error);
  }
  return [];
};

const getHistoryIndex = async (): Promise<HistoryIndex> => {
  try {
    if (typeof AsyncStorage !== 'undefined') {
      const stored = await AsyncStorage.getItem(HISTORY_INDEX_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (error) {
    console.error('Error loading history index:', error);
  }
  return { availableDates: [], totalSessions: 0, lastUpdated: new Date().toISOString() };
};

const updateHistoryIndex = async (date: string): Promise<void> => {
  try {
    if (typeof AsyncStorage !== 'undefined') {
      const index = await getHistoryIndex();
      
      if (!index.availableDates.includes(date)) {
        index.availableDates.push(date);
        index.totalSessions++;
      }
      
      index.lastUpdated = new Date().toISOString();
      
      // Keep only last 90 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      index.availableDates = index.availableDates.filter(d => new Date(d) >= cutoffDate);
      
      await AsyncStorage.setItem(HISTORY_INDEX_KEY, JSON.stringify(index));
    }
  } catch (error) {
    console.error('Error updating history index:', error);
  }
};

// Helper functions for daily history
const extractTopics = (messages: Message[]): string[] => {
  const topics: string[] = [];
  const userMessages = messages.filter(msg => msg.role === 'user');
  
  userMessages.forEach(msg => {
    const content = msg.content.toLowerCase();
    if (content.includes('love') || content.includes('relationship') || content.includes('partner') || 
        content.includes('marriage') || content.includes('marry') || content.includes('wedding') ||
        content.includes('boyfriend') || content.includes('girlfriend') || content.includes('soulmate')) {
      topics.push('Love & Relationships');
    }
    if (content.includes('career') || content.includes('work') || content.includes('job') ||
        content.includes('money') || content.includes('finance') || content.includes('success')) {
      topics.push('Career & Goals');
    }
    if (content.includes('daily') || content.includes('today') || content.includes('guidance') ||
        content.includes('tomorrow') || content.includes('this week') || content.includes('future')) {
      topics.push('Daily Guidance');
    }
    if (content.includes('learn') || content.includes('astrology') || content.includes('zodiac') ||
        content.includes('horoscope') || content.includes('sign') || content.includes('planet')) {
      topics.push('Astrology Learning');
    }
    if (content.includes('support') || content.includes('help') || content.includes('advice') ||
        content.includes('worried') || content.includes('anxious') || content.includes('stressed')) {
      topics.push('Emotional Support');
    }
  });
  
  return [...new Set(topics)]; // Remove duplicates
};

const calculateDuration = (messages: Message[]): number => {
  if (messages.length < 2) return 0;
  
  const startTime = new Date(messages[0].timestamp);
  const endTime = new Date(messages[messages.length - 1].timestamp);
  
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes
};

const generateDailySummary = (messages: Message[], metadata: SessionMetadata): string => {
  const userMessages = messages.filter(msg => msg.role === 'user');
  const assistantMessages = messages.filter(msg => msg.role === 'assistant');
  
  if (userMessages.length === 0) return 'No conversation recorded.';
  
  const topics = metadata.primaryTopics;
  const topicText = topics.length > 0 ? ` Discussed: ${topics.join(', ')}.` : '';
  
  return `Had ${userMessages.length} exchanges with Luna.${topicText} Conversation lasted ${metadata.conversationDuration} minutes.`;
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  fullContent?: string; // Store the complete intended message
  typingCompleted?: boolean; // Track if typing animation finished
}

interface LunaChatContentProps {
  userData: {
    name: string;
    zodiacSign: string;
    isPremium: boolean;
    readingStreak?: number;
    cosmicRating?: number;
    luckyNumbers?: number[];
    compatibleSigns?: string[];
  };
  onScroll?: any;
  onBack?: () => void;
}

const LunaChatContent: React.FC<LunaChatContentProps> = ({ userData, onScroll, onBack }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  // Use personalized user data from context
  const { user } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  
  // Race condition protection
  const [isResetting, setIsResetting] = useState(false);
  const [greetingCreated, setGreetingCreated] = useState(false);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lunaAnimation, setLunaAnimation] = useState<'idle' | 'thinking' | 'speaking' | 'listening'>('idle');
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, opacity: number[]}>>([]);
  
  // History panel state
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [dailyHistory, setDailyHistory] = useState<DailyLog[]>([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(getTodayDateString());
  const dateCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-scroll state
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Fallback greeting timer
  const fallbackGreetingTimer = useRef<NodeJS.Timeout | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const lunaGlowAnim = useRef(new Animated.Value(1)).current;
  const starTwinkleAnim = useRef(new Animated.Value(0)).current;
  const shootingStarAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideInAnim = useRef(new Animated.Value(50)).current;
  const quickPromptsAnim = useRef(new Animated.Value(1)).current;
  
  // Background animation refs
  const twinkleAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const shootingStarTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Typing animation refs
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Quick prompt suggestions
  const quickPrompts = [
    {
      id: '1',
      text: 'Daily Guidance',
      icon: '⭐',
      category: 'guidance',
      color: '#FFD700'
    },
    {
      id: '2',
      text: 'Love & Relationships',
      icon: '💕',
      category: 'love',
      color: '#FF69B4'
    },
    {
      id: '3',
      text: 'Career & Goals',
      icon: '🎯',
      category: 'career',
      color: '#4FC3F7'
    },
    {
      id: '4',
      text: 'Emotional Support',
      icon: '🤗',
      category: 'support',
      color: '#8A4FFF'
    },
    {
      id: '5',
      text: 'Learn Astrology',
      icon: '📚',
      category: 'learning',
      color: '#FFFFFF'
    }
  ];

  useEffect(() => {
    // Generate static star positions once
    const generateStarPositions = () => {
      const stars = [];
      for (let i = 0; i < 100; i++) {
        stars.push({
          left: Math.random() * width,
          top: Math.random() * height,
          opacity: [
            Math.random() * 0.2 + 0.1,
            Math.random() * 0.4 + 0.3,
            Math.random() * 0.2 + 0.1,
          ]
        });
      }
      setStarPositions(stars);
    };

    generateStarPositions();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideInAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Star twinkling animation (controllable)
    const startTwinkleAnimation = () => {
      if (twinkleAnimationRef.current) {
        twinkleAnimationRef.current.stop();
      }
      twinkleAnimationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(starTwinkleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(starTwinkleAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      twinkleAnimationRef.current.start();
    };

    // Shooting star animation (controllable)
    const createShootingStar = () => {
      if (isUserTyping) return; // Don't show shooting stars while typing
      shootingStarAnim.setValue(0);
      Animated.timing(shootingStarAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {
        // Schedule next shooting star (random interval 3-8 seconds)
        const nextDelay = Math.random() * 5000 + 3000;
        shootingStarTimeoutRef.current = setTimeout(createShootingStar, nextDelay);
      });
    };

    // Start animations only if user is not typing
    if (!isUserTyping) {
      startTwinkleAnimation();
      // Start first shooting star after 2 seconds
      shootingStarTimeoutRef.current = setTimeout(createShootingStar, 2000);
    }

    return () => {
      if (twinkleAnimationRef.current) {
        twinkleAnimationRef.current.stop();
      }
      if (shootingStarTimeoutRef.current) {
        clearTimeout(shootingStarTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting - cleaning up typing animation');
      stopTyping();
      
      // Clear fallback greeting timer
      if (fallbackGreetingTimer.current) {
        clearTimeout(fallbackGreetingTimer.current);
      }
      
      // Clear date check interval
      if (dateCheckIntervalRef.current) {
        clearInterval(dateCheckIntervalRef.current as any);
      }
    };
  }, []);

  // Daily reset logic - check if date has changed and persist last date
  useEffect(() => {
    // Skip if currently resetting to avoid race conditions
    if (isResetting) {
      return;
    }

    const checkDailyReset = async () => {
      const today = getTodayDateString();
      const storedLastDate = await AsyncStorage.getItem(LAST_CONVERSATION_DATE_KEY);
      const lastDate = storedLastDate || currentDate;
      
      if (lastDate !== today) {
        console.log('📅 Daily reset detected - date changed from', lastDate, 'to', today);
        
        // Set resetting flag to prevent multiple resets
        setIsResetting(true);
        
        // Date boundary crossed: archive under lastDate to ensure correct key
        if (messages.length > 1) {
          await archiveDailyConversation(messages, lastDate);
        }
        
        // Clear all data and reset state
        await clearStoredConversation();
        await AsyncStorage.setItem(LAST_CONVERSATION_DATE_KEY, today);
        
        // Reset all state variables for fresh start
        setMessages([]);
        setHasUserSentMessage(false);
        setCurrentDate(today);
        setHasInitialized(false);
        setGreetingCreated(false);
        
        // Allow new initialization to proceed with a longer delay to ensure clean state
        setTimeout(() => {
          console.log('🔄 Daily reset complete - allowing fresh initialization');
          setIsResetting(false);
        }, 100);
        
      } else {
        // Keep last date fresh
        await AsyncStorage.setItem(LAST_CONVERSATION_DATE_KEY, today);
      }
    };
    
    checkDailyReset();
  }, [currentDate, messages, isResetting]);

  // Background date monitor: detect midnight rollover or timezone jumps
  useEffect(() => {
    if (dateCheckIntervalRef.current) {
      clearInterval(dateCheckIntervalRef.current as any);
    }
    dateCheckIntervalRef.current = setInterval(() => {
      const today = getTodayDateString();
      if (today !== currentDate) {
        setCurrentDate(today);
      }
    }, 60 * 1000); // check every minute
    return () => {
      if (dateCheckIntervalRef.current) {
        clearInterval(dateCheckIntervalRef.current as any);
      }
    };
  }, [currentDate]);

  // Initialize conversation - load history or show welcome message
  useEffect(() => {
    if (!hasInitialized) {
      console.log('🚀 Starting conversation initialization');
      setHasInitialized(true);
      
      const initializeConversation = async () => {
        try {
          // Add a small delay to ensure component is fully mounted
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Initialize last conversation date if not present
          const today = getTodayDateString();
          const storedLastDate = await AsyncStorage.getItem(LAST_CONVERSATION_DATE_KEY);
          if (!storedLastDate) {
            await AsyncStorage.setItem(LAST_CONVERSATION_DATE_KEY, today);
          }

          // Try to load conversation history from storage
          const savedMessages = await getStoredConversation();
          
          if (savedMessages && savedMessages.length > 0) {
            console.log('📱 Loading existing conversation with', savedMessages.length, 'messages');
            
            // Load existing conversation exactly as it was stored
            // Sort messages by timestamp to ensure proper chronological order
            const sortedMessages = savedMessages.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            setMessages(sortedMessages);
            
            // Check if user has already sent messages
            const hasUserMessages = sortedMessages.some(msg => msg.role === 'user');
            setHasUserSentMessage(hasUserMessages);
            
            // Mark greeting as already created since it exists in saved messages
            setGreetingCreated(true);
            
            // Check for and complete any interrupted typing animations
            checkForIncompleteMessages(sortedMessages);
            
            // Trigger auto-scroll to show latest messages
            setShouldAutoScroll(true);
          } else {
            console.log('🆕 No saved messages - creating new conversation');
            // No saved messages - this is a truly new conversation
            showGreetingWithAnimation();
          }
        } catch (error) {
          console.error('❌ Error initializing conversation:', error);
          // Show welcome message even if storage fails
          showGreetingWithAnimation();
        }
      };
      
      initializeConversation();
    }
  }, [hasInitialized]);

  // Fallback greeting mechanism - ensures greeting always appears
  useEffect(() => {
    // Clear any existing fallback timer
    if (fallbackGreetingTimer.current) {
      clearTimeout(fallbackGreetingTimer.current);
    }

    // Only set fallback if we've initialized but have no messages and no greeting created
    // Also ensure we're not in the middle of a reset to avoid race conditions
    if (hasInitialized && messages.length === 0 && !greetingCreated && !isResetting) {
      console.log('⏰ Setting fallback greeting timer');
      fallbackGreetingTimer.current = setTimeout(() => {
        // Double-check conditions before triggering fallback to prevent duplicates
        if (messages.length === 0 && !greetingCreated && !isResetting) {
          console.log('🆘 Fallback greeting triggered - ensuring user sees greeting');
          showGreetingWithAnimation();
        } else {
          console.log('🚫 Fallback greeting cancelled - conditions changed');
        }
      }, 2000); // 2 second fallback
    }

    // Cleanup timer on unmount or when conditions change
    return () => {
      if (fallbackGreetingTimer.current) {
        clearTimeout(fallbackGreetingTimer.current);
      }
    };
  }, [hasInitialized, messages.length, greetingCreated, isResetting]);

  // Centralized greeting creation with guards
  const createGreetingMessage = (): Message => {
    return {
      id: `greeting-${Date.now()}`,
      role: 'assistant',
      content: "Hi my name is Luna, what can I help you with?",
      timestamp: new Date(),
    };
  };

  const checkForIncompleteMessages = (loadedMessages: Message[]) => {
    console.log('🔍 Checking for incomplete typing animations...');
    
    // Find any assistant messages that didn't complete typing
    const incompleteMessages = loadedMessages.filter(msg => 
      msg.role === 'assistant' && 
      msg.typingCompleted === false && 
      msg.fullContent && 
      msg.content !== msg.fullContent
    );

    if (incompleteMessages.length > 0) {
      console.log(`🔄 Found ${incompleteMessages.length} incomplete messages, completing them...`);
      
      // Complete each incomplete message
      incompleteMessages.forEach((msg, index) => {
        setTimeout(() => {
          console.log('🎬 Resuming typing for interrupted message:', msg.id);
          
          // Update the message to show the full content with typing animation
          const completeMessage: Message = {
            ...msg,
            content: msg.fullContent || msg.content,
            isTyping: false,
            typingCompleted: true
          };
          
          // If it's the last message, show typing animation
          const isLastMessage = index === incompleteMessages.length - 1;
          if (isLastMessage) {
            typeMessage({
              ...msg,
              content: msg.fullContent || msg.content
            });
          } else {
            // Just update the content without animation for older messages
            setMessages(prev => prev.map(prevMsg => 
              prevMsg.id === msg.id ? completeMessage : prevMsg
            ));
          }
        }, index * 100); // Stagger completions
      });
    } else {
      console.log('✅ No incomplete messages found');
    }
  };

  const showGreetingWithAnimation = () => {
    // Enhanced guards to prevent duplicate greetings
    if (greetingCreated) {
      console.log('🚫 Greeting creation blocked - already created this session');
      return;
    }

    // Check if messages already exist
    if (messages.length > 0) {
      console.log('🚫 Greeting creation blocked - messages already exist');
      setGreetingCreated(true); // Mark as created since conversation exists
      return;
    }

    // Check if we're in the middle of a reset
    if (isResetting) {
      console.log('🚫 Greeting creation blocked - system is resetting');
      return;
    }

    // Check if a greeting message already exists in messages (extra safety)
    const hasExistingGreeting = messages.some(msg => 
      msg.role === 'assistant' && 
      msg.content.includes('Hi my name is Luna')
    );
    
    if (hasExistingGreeting) {
      console.log('🚫 Greeting creation blocked - greeting already exists in messages');
      setGreetingCreated(true);
      return;
    }

    console.log('✨ Creating greeting message with typing animation');
    console.log('📊 Current state - messages:', messages.length, 'greetingCreated:', greetingCreated, 'hasInitialized:', hasInitialized, 'isResetting:', isResetting);
    
    // Set flag immediately to prevent race conditions
    setGreetingCreated(true);
    
    const greetingMessage = createGreetingMessage();
    typeMessage(greetingMessage);
  };

  const triggerHapticFeedback = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        await Haptics.selectionAsync();
      }
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  const typeMessage = (message: Message) => {
    const fullText = message.content;
    let currentIndex = 0;
    let currentText = '';
    let currentWord = '';
    
    const typingMessage: Message = {
      ...message,
      content: '',
      isTyping: true,
      fullContent: fullText, // Store the complete intended message
      typingCompleted: false, // Mark as incomplete initially
    };

    console.log('🎬 Starting typing animation for message:', message.id);
    setMessages(prev => [...prev, typingMessage]);
    isTypingRef.current = true;

    const typeNextCharacter = () => {
      if (currentIndex < fullText.length && isTypingRef.current) {
        const currentChar = fullText[currentIndex];
        currentText += currentChar;
        currentIndex++;

        // Track word completion for haptics (less frequent)
        if (currentChar === ' ' || currentChar === '\n' || currentIndex === fullText.length) {
          if (currentWord.length >= TYPING_CONFIG.hapticWordMinLength) {
            triggerHapticFeedback();
          }
          currentWord = '';
        } else if (currentChar.match(/[a-zA-Z]/)) {
          currentWord += currentChar;
        }

        // Update the message content
        setMessages(prev => prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, content: currentText }
            : msg
        ));

        // MUCH FASTER TYPING - NO PAUSES, CONSISTENT SPEED
        let typingSpeed = TYPING_CONFIG.fastSpeed;
        
        // Only very slight variation for long texts to make it feel natural
        if (fullText.length > 200) {
          typingSpeed = TYPING_CONFIG.baseSpeed - 5; // Even faster for long texts
        }

        // Minimal randomness - just 2ms variation
        const randomVariation = Math.random() * 4 - 2; // ±2ms only
        const finalSpeed = Math.max(10, typingSpeed + randomVariation);

        typingTimeoutRef.current = setTimeout(typeNextCharacter, finalSpeed);

        // More frequent scrolling for faster typing
        if (currentIndex % 3 === 0) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 10);
        }
      } else {
        // Typing complete
        console.log('✅ Typing animation completed for message:', message.id);
        isTypingRef.current = false;
        setMessages(prev => prev.map(msg => 
          msg.id === message.id 
            ? { 
                ...msg, 
                isTyping: false, 
                content: fullText, // Ensure full content is displayed
                typingCompleted: true // Mark as completed
              }
            : msg
        ));
        
        setTimeout(() => {
          scrollToBottom(true, 0);
        }, 50);
      }
    };

    // Start immediately - no delay
    typingTimeoutRef.current = setTimeout(typeNextCharacter, 5);
  };

  const stopTyping = () => {
    console.log('⏹️ Stopping typing animation');
    isTypingRef.current = false;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Mark any currently typing messages as interrupted (not completed)
    setMessages(prev => prev.map(msg => 
      msg.isTyping 
        ? { 
            ...msg, 
            isTyping: false,
            typingCompleted: false // Mark as interrupted, not completed
          }
        : msg
    ));
  };

  // Store conversation history whenever messages change
  useEffect(() => {
    if (messages.length > 1) { // Don't store just the initial welcome message
      storeConversation(messages);
    }
  }, [messages]);

  // Auto-scroll effect - triggers when messages are loaded or updated
  useEffect(() => {
    handleAutoScroll();
  }, [messages, shouldAutoScroll]);

  // Keyboard event listeners for proper scrolling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Scroll to bottom when keyboard appears
      setTimeout(() => {
        scrollToBottom(true, 0);
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Scroll to bottom when keyboard hides
      setTimeout(() => {
        scrollToBottom(true, 0);
      }, 100);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Animate quick prompts out when user sends first message
  useEffect(() => {
    if (hasUserSentMessage) {
      Animated.timing(quickPromptsAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [hasUserSentMessage]);

  // Control background animations based on typing state
  useEffect(() => {
    if (isUserTyping) {
      // Stop background animations when user is typing
      if (twinkleAnimationRef.current) {
        twinkleAnimationRef.current.stop();
      }
      if (shootingStarTimeoutRef.current) {
        clearTimeout(shootingStarTimeoutRef.current);
      }
    } else {
      // Restart background animations when user stops typing
      const startTwinkleAnimation = () => {
        if (twinkleAnimationRef.current) {
          twinkleAnimationRef.current.stop();
        }
        twinkleAnimationRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(starTwinkleAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(starTwinkleAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        );
        twinkleAnimationRef.current.start();
      };

      const createShootingStar = () => {
        shootingStarAnim.setValue(0);
        Animated.timing(shootingStarAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }).start(() => {
          const nextDelay = Math.random() * 5000 + 3000;
          shootingStarTimeoutRef.current = setTimeout(createShootingStar, nextDelay);
        });
      };

      startTwinkleAnimation();
      shootingStarTimeoutRef.current = setTimeout(createShootingStar, 2000);
    }
  }, [isUserTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    stopTyping();
    setIsUserTyping(false); // User finished typing
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setHasUserSentMessage(true);
    const currentInput = inputText.trim();
    setInputText('');
    setLunaAnimation('listening');
    setIsLoading(true);

    // Scroll to show the new message
    setTimeout(() => {
      scrollToBottom(true, 0);
    }, 100);

    try {
      const conversationHistory = messages
        .filter(msg => !msg.isTyping)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      setLunaAnimation('thinking');
      lunaGlowAnim.setValue(1.5);

      // Call OpenAI service with raw message (same as AIChatScreen)
      const response = await OpenAIService.sendMessage(currentInput, conversationHistory, user);

      const lunaResponse: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setIsLoading(false);
      setLunaAnimation('speaking');
      
      // Start typing animation immediately after API response
      typeMessage(lunaResponse);
      
      // Reset glow after speaking
      setTimeout(() => {
        setLunaAnimation('idle');
        lunaGlowAnim.setValue(1);
      }, 2000);

    } catch (error: any) {
      console.error('Luna chat error:', error);
      setIsLoading(false);
      setLunaAnimation('idle');
      lunaGlowAnim.setValue(1);

      // Determine error type and show appropriate response
      let errorMessage = 'Having some technical difficulties. Please try again in a moment.';
      let alertTitle = 'Connection Issue';
      
      if (error.message.includes('API key')) {
        errorMessage = 'There seems to be a configuration issue. Please check your settings.';
        alertTitle = 'Configuration Error';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network connection seems unstable. Please check your internet connection.';
        alertTitle = 'Network Issue';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Too many requests right now. Please wait a moment before trying again.';
        alertTitle = 'Rate Limit';
      }

      // Store the failed message for retry
      setLastFailedMessage(currentInput);

      // Show fallback response with cosmic theme
      const fallbackResponse: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: generateFallbackResponse(currentInput),
        timestamp: new Date(),
      };
      
      // Use typing animation for fallback response too
      typeMessage(fallbackResponse);
      
      // Show error alert with cosmic theme and retry option
      Alert.alert(
        alertTitle,
        errorMessage,
        [
          { text: 'Understood', style: 'default' },
          { text: 'Retry', style: 'default', onPress: retryLastMessage }
        ]
      );
    }
  };

  const generateFallbackResponse = (userInput: string): string => {
    const responses = {
      greeting: [
        "Hey girl! What's going on?",
        "Hi babe! What's the drama today?",
        "Hey! Spill the tea, what's happening?"
      ],
      love: [
        "Wait, is this about Ethan again? What's he doing now?",
        "Girl, Sebastian's being confusing again isn't he?",
        "Ugh, Alex drama? Tell me everything!",
        "Let me guess - Damien's playing games again?",
        "Oh no, what's Gabriel doing this time?"
      ],
      career: [
        "Work being annoying again? What's up?",
        "Ugh, work drama? I'm here for it.",
        "Career stuff stressing you out? What's going on?"
      ],
      support: [
        "Girl, what's wrong? You know I'm here.",
        "Okay something's up, talk to me.",
        "You sound stressed, what's happening?"
      ],
      learning: [
        "Ooh, getting into the deep stuff! What do you want to know?",
        "I love when you ask the good questions! What's up?",
        "Okay I'm intrigued, tell me more!"
      ],
      default: [
        "Wait, what? I didn't catch that.",
        "Girl, you're confusing me. What's going on?",
        "Okay I'm lost, fill me in!"
      ]
    };

    const input = userInput.toLowerCase();
    let category = 'default';

    if (input.includes('hello') || input.includes('hi') || input.includes('greet')) {
      category = 'greeting';
    } else if (input.includes('love') || input.includes('relationship') || input.includes('romance')) {
      category = 'love';
    } else if (input.includes('career') || input.includes('work') || input.includes('job') || input.includes('money')) {
      category = 'career';
    } else if (input.includes('sad') || input.includes('help') || input.includes('support') || input.includes('struggle')) {
      category = 'support';
    } else if (input.includes('learn') || input.includes('astrology') || input.includes('stars') || input.includes('zodiac')) {
      category = 'learning';
    }

    const categoryResponses = responses[category as keyof typeof responses];
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  };

  const handleQuickPrompt = async (prompt: any) => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    
    setIsUserTyping(false); // User finished typing
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Immediately send the prompt without filling input field
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt.text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setHasUserSentMessage(true);
    setLunaAnimation('listening');
    setIsLoading(true);

    // Scroll to show the new message
    setTimeout(() => {
      scrollToBottom(true, 0);
    }, 100);

    try {
      const conversationHistory = messages
        .filter(msg => !msg.isTyping)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      setLunaAnimation('thinking');
      lunaGlowAnim.setValue(1.5);

      // Call OpenAI service with raw message (same as AIChatScreen)
      const response = await OpenAIService.sendMessage(prompt.text, conversationHistory, user);

      const lunaResponse: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setIsLoading(false);
      setLunaAnimation('speaking');
      
      // Start typing animation immediately after API response
      typeMessage(lunaResponse);
      
      // Reset glow after speaking
      setTimeout(() => {
        setLunaAnimation('idle');
        lunaGlowAnim.setValue(1);
      }, 2000);

    } catch (error: any) {
      console.error('Luna chat error:', error);
      setIsLoading(false);
      setLunaAnimation('idle');
      lunaGlowAnim.setValue(1);

      // Show fallback response with cosmic theme
      const fallbackResponse: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: generateFallbackResponse(prompt.text),
        timestamp: new Date(),
      };
      
      // Use typing animation for fallback response too
      typeMessage(fallbackResponse);
    }
  };

  const clearConversation = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear your conversation with Luna? This will delete all messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await resetChatRoom();
          }
        }
      ]
    );
  };

  const resetChatRoom = async () => {
    try {
      console.log('🌙 Starting chat room reset...');
      
      // Set resetting flag to prevent multiple resets
      setIsResetting(true);
      
      // Clear all Luna chat storage
      await clearStoredConversation();
      await AsyncStorage.removeItem(LAST_CONVERSATION_DATE_KEY);
      
      // Reset all state variables
      setMessages([]);
      setHasUserSentMessage(false);
      setLastFailedMessage(null);
      setHasInitialized(false);
      setGreetingCreated(false);
      
      // Reset animations
      quickPromptsAnim.setValue(1);
      lunaGlowAnim.setValue(1);
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      console.log('🌙 Luna chat room has been reset!');
      
      // Allow fresh initialization after brief delay
      setTimeout(() => {
        console.log('🔄 Reset complete - allowing fresh initialization');
        setIsResetting(false);
      }, 100);
      
    } catch (error) {
      console.error('❌ Error resetting chat room:', error);
      // Release lock even if error occurs
      setIsResetting(false);
    }
  };

  // History panel functions
  const openHistoryPanel = async () => {
    try {
      const history = await getDailyHistory();
      setDailyHistory(history);
      setShowHistoryPanel(true);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const closeHistoryPanel = () => {
    setShowHistoryPanel(false);
    setSelectedHistoryDate(null);
  };

  const selectHistoryDate = (date: string) => {
    setSelectedHistoryDate(selectedHistoryDate === date ? null : date);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Auto-scroll functions
  const scrollToBottom = (animated: boolean = true, delay: number = 0) => {
    if (scrollViewRef.current) {
      const scrollAction = () => {
        scrollViewRef.current?.scrollToEnd({ animated });
      };
      
      if (delay > 0) {
        setTimeout(scrollAction, delay);
      } else {
        scrollAction();
      }
    }
  };

  const handleAutoScroll = () => {
    if (shouldAutoScroll && messages.length > 0) {
      // Delay to ensure messages are fully rendered
      const delay = isInitialLoad ? 800 : 300;
      scrollToBottom(true, delay);
      
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
      setShouldAutoScroll(false);
    }
  };

  const retryLastMessage = async () => {
    if (!lastFailedMessage) return;
    
    setInputText(lastFailedMessage);
    setLastFailedMessage(null);
    
    // Trigger the send message after a brief delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };


  const renderLunaAvatar = () => {
    return (
      <View style={styles.lunaContainer}>
        {/* Luna Image */}
        <Animated.View
          style={[
            styles.lunaImageContainer,
            {
              opacity: lunaGlowAnim,
            },
          ]}
        >
          <Image
            source={require('../../assets/girl.png')}
            style={styles.lunaImage}
            resizeMode="cover"
          />
        </Animated.View>
      </View>
    );
  };

  const renderMessageBubble = (message: Message) => {
    if (message.role === 'user') {
      return (
        <View key={message.id} style={styles.userMessageContainer}>
          <View style={styles.userBubble}>
            <Text style={styles.userMessageText}>{message.content}</Text>
          </View>
        </View>
      );
    }

    return (
      <View key={message.id} style={styles.lunaMessageContainer}>
        <View style={styles.lunaBubble}>
          <Text style={styles.lunaMessageText}>{message.content}</Text>
        </View>
      </View>
    );
  };


  const renderQuickPrompts = () => {
    return (
      <>
        <Text style={[styles.quickPromptsTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
          Quick Guidance
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickPromptsScroll}
        >
          {quickPrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt.id}
              style={[styles.quickPromptCard, { borderColor: prompt.color }]}
              onPress={() => handleQuickPrompt(prompt)}
            >
              <LinearGradient
                colors={[`${prompt.color}20`, `${prompt.color}10`]}
                style={styles.quickPromptGradient}
              >
                <Text style={styles.quickPromptIcon}>{prompt.icon}</Text>
                <Text style={styles.quickPromptText}>{prompt.text}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </>
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
          opacity: fadeInAnim,
          transform: [{ translateY: slideInAnim }]
        }
      ]}
    >
      {/* Cosmic Background */}
      <LinearGradient
        colors={['#0B0B2F', '#1A1A3E', '#2D1B69']}
        style={styles.backgroundGradient}
      >
        {/* Animated Starfield */}
        <View style={styles.starfield}>
          {starPositions.map((star, i) => (
            <Animated.View
              key={i}
              style={[
                styles.star,
                {
                  left: star.left,
                  top: star.top,
                  opacity: starTwinkleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: star.opacity,
                  }),
                },
              ]}
            />
          ))}
          
          {/* Shooting Star */}
          <Animated.View
            style={[
              styles.shootingStar,
              {
                opacity: shootingStarAnim,
                transform: [
                  {
                    translateX: shootingStarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, width + 100],
                    }),
                  },
                  {
                    translateY: shootingStarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, height - 100],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

        {/* Back Button */}
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            onLongPress={clearConversation}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonContainer}>
              <Text style={styles.backButtonIcon}>‹</Text>
              <View style={styles.starAccent} />
            </View>
          </TouchableOpacity>
        )}

        {/* Luna Avatar - Back to original position */}
        {renderLunaAvatar()}

        {/* History Button - Positioned separately */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={openHistoryPanel}
        >
          <LinearGradient
            colors={['#8A4FFF', '#A569FF']}
            style={styles.historyButtonGradient}
          >
            <Text style={styles.historyButtonIcon}>📚</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={[
            styles.messagesContainer,
            hasUserSentMessage && styles.messagesContainerExpanded
          ]}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {messages.map(renderMessageBubble)}
        </ScrollView>

        {/* Quick Prompts - animate out when user sends first message */}
        {!hasUserSentMessage && (
          <Animated.View
            style={[
              styles.quickPromptsContainer,
              {
                opacity: quickPromptsAnim,
                transform: [
                  {
                    translateY: quickPromptsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {renderQuickPrompts()}
          </Animated.View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
                setIsUserTyping(text.length > 0);
              }}
              allowFontScaling={true}
              maxFontSizeMultiplier={1.3}
              onFocus={() => setIsUserTyping(true)}
              onBlur={() => setIsUserTyping(false)}
              placeholder="Ask Luna anything... 💫"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              maxLength={100}
              keyboardType="default"
              textContentType="none"
              autoCorrect={true}
              enablesReturnKeyAutomatically={true}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <LinearGradient
                colors={inputText.trim() && !isLoading ? ['#FFD700', '#FFA500'] : ['#666', '#888']}
                style={styles.sendButtonGradient}
              >
                <Text style={styles.sendButtonIcon}>
                  {isLoading ? '⏳' : '↑'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* History Panel */}
      {showHistoryPanel && (
        <View style={styles.historyOverlay}>
          <TouchableOpacity
            style={styles.historyOverlayBackground}
            onPress={closeHistoryPanel}
            activeOpacity={1}
          />
          <Animated.View style={styles.historyPanel}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
                Chat History
              </Text>
            </View>
            
            <ScrollView style={styles.historyContent} showsVerticalScrollIndicator={false}>
              {dailyHistory.length === 0 ? (
                <View style={styles.historyEmpty}>
                  <Text style={styles.historyEmptyText}>No chat history yet</Text>
                  <Text style={styles.historyEmptySubtext}>Start chatting with Luna to build your history!</Text>
                </View>
              ) : (
                dailyHistory.map((log) => (
                  <View key={log.date} style={styles.historyEntry}>
                    <TouchableOpacity
                      style={styles.historyEntryHeader}
                      onPress={() => selectHistoryDate(log.date)}
                    >
                      <View style={styles.historyEntryInfo}>
                        <Text style={[styles.historyEntryDate, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
                          {formatDate(log.date)}
                        </Text>
                        <Text style={styles.historyEntrySummary}>
                          {log.metadata.messageCount} messages • {log.metadata.conversationDuration} min
                        </Text>
                        {log.topics.length > 0 && (
                          <View style={styles.historyTopics}>
                            {log.topics.map((topic, index) => (
                              <View key={index} style={styles.historyTopicTag}>
                                <Text style={styles.historyTopicText}>{topic}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                      <Text style={styles.historyExpandIcon}>
                        {selectedHistoryDate === log.date ? '▼' : '▶'}
                      </Text>
                    </TouchableOpacity>
                    
                    {selectedHistoryDate === log.date && (
                      <View style={styles.historyMessages}>
                        {log.messages.map((message) => (
                          <View key={message.id} style={styles.historyMessageContainer}>
                            {message.role === 'user' ? (
                              <View style={styles.historyUserMessage}>
                                <Text style={styles.historyUserText}>{message.content}</Text>
                              </View>
                            ) : (
                              <View style={styles.historyLunaMessage}>
                                <Text style={styles.historyLunaText}>{message.content}</Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  shootingStar: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: '#FFD700',
    borderRadius: 1.5,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  
  // Luna Character Styles
  lunaContainer: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  lunaImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: AppColors.cosmicGold,
    shadowColor: AppColors.goldGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  lunaImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  voiceWave: {
    position: 'absolute',
    top: 40,
    left: 40,
    right: 40,
    bottom: 40,
    borderWidth: 2,
    borderColor: '#4FC3F7',
    borderRadius: 60,
  },

  // History Button Styles
  historyButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 10,
  },
  historyButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },

  // History Panel Styles
  historyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  historyOverlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  historyPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: '#1A1A3E',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  historyContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  historyEmptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyEmptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  historyEntry: {
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  historyEntryInfo: {
    flex: 1,
  },
  historyEntryDate: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  historyEntrySummary: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  historyTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyTopicTag: {
    backgroundColor: 'rgba(139, 95, 191, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  historyTopicText: {
    fontSize: 10,
    color: '#A569FF',
    fontWeight: '500',
  },
  historyExpandIcon: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 10,
  },
  historyMessages: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyMessageContainer: {
    marginVertical: 8,
  },
  historyUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(139, 95, 191, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: '80%',
  },
  historyUserText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  historyLunaMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: '80%',
  },
  historyLunaText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Message Styles
  messagesContainer: {
    flex: 1,
    marginTop: 175,
    marginBottom: 200,
  },
  messagesContainerExpanded: {
    marginBottom: 120, // More space when quick prompts are hidden
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120, // Add bottom padding for better spacing
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(139, 95, 191, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  lunaMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lunaBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(138, 79, 255, 0.3)',
  },
  lunaMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 22,
  },
  typingBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  typingText: {
    color: '#B8A9C9',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    backgroundColor: '#FFD700',
    borderRadius: 3,
    marginRight: 4,
  },

  // Quick Prompts Styles
  quickPromptsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  quickPromptsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  quickPromptsScroll: {
    flexDirection: 'row',
  },
  quickPromptCard: {
    marginRight: 12,
    borderRadius: 15,
    borderWidth: 1,
    overflow: 'hidden',
  },
  quickPromptGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  quickPromptIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickPromptText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },

  // Input Styles
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    maxHeight: 100,
    paddingVertical: 8,
    lineHeight: 22, // Better line height for emoji display
    textAlignVertical: 'top', // Android alignment
  },
  voiceButton: {
    marginLeft: 8,
    marginRight: 8,
  },
  voiceButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonIcon: {
    fontSize: 18,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderColor: '#FF6B6B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  sendButton: {
    marginLeft: 4,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonIcon: {
    fontSize: 18,
  },
  
  // Back Button Styles
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: 'rgba(138, 79, 255, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButtonIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 24,
  },
  starAccent: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 3,
    height: 3,
    backgroundColor: '#FFD700',
    borderRadius: 1.5,
  },
});

export default LunaChatContent;
