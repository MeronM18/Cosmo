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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';
import { AppColors } from '../theme/appTheme';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Greetings, ${userData.name}. I am Luna, your cosmic guide. The stars have been whispering about your journey, and I'm here to help illuminate your path. What wisdom do you seek today?`,
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [lunaAnimation, setLunaAnimation] = useState<'idle' | 'thinking' | 'speaking' | 'listening'>('idle');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const lunaGlowAnim = useRef(new Animated.Value(1)).current;
  const voiceWaveAnim = useRef(new Animated.Value(0)).current;
  const starTwinkleAnim = useRef(new Animated.Value(0)).current;
  const shootingStarAnim = useRef(new Animated.Value(0)).current;

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
    // Star twinkling animation
    const twinkleAnimation = Animated.loop(
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
    twinkleAnimation.start();

    // Shooting star animation (occasional)
    const createShootingStar = () => {
      shootingStarAnim.setValue(0);
      Animated.timing(shootingStarAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {
        // Schedule next shooting star (random interval 3-8 seconds)
        const nextDelay = Math.random() * 5000 + 3000;
        setTimeout(createShootingStar, nextDelay);
      });
    };

    // Start first shooting star after 2 seconds
    setTimeout(createShootingStar, 2000);

    return () => {
      twinkleAnimation.stop();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLunaAnimation('listening');
    setIsTyping(true);

    // Simulate Luna's response
    setTimeout(() => {
      setLunaAnimation('thinking');
      lunaGlowAnim.setValue(1.5);
      
      setTimeout(() => {
        const lunaResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: generateLunaResponse(inputText.trim()),
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, lunaResponse]);
        setIsTyping(false);
        setLunaAnimation('speaking');
        
        // Reset glow after speaking
        setTimeout(() => {
          setLunaAnimation('idle');
          lunaGlowAnim.setValue(1);
        }, 2000);
      }, 2000);
    }, 1000);
  };

  const generateLunaResponse = (userInput: string): string => {
    const responses = {
      greeting: [
        "The cosmic winds carry your greeting, dear one. I sense the stars aligning in your favor today.",
        "Greetings, starlight. Your energy radiates with such beautiful potential.",
        "Welcome, cosmic traveler. The universe has been waiting for this moment of connection."
      ],
      love: [
        "Love flows through the cosmos like starlight, touching every heart that opens to receive it. Your romantic journey is written in the stars.",
        "The planets dance in harmony, and I see Venus smiling upon your love life. Trust in the timing of the universe.",
        "Your heart is a constellation of its own, shining with the promise of deep, meaningful connections."
      ],
      career: [
        "The cosmic currents suggest a time of growth and opportunity in your professional realm. Trust your instincts.",
        "Mercury's influence brings clarity to your career path. The stars whisper of new beginnings ahead.",
        "Your professional journey is guided by the same stars that light your way. Success is written in your cosmic blueprint."
      ],
      support: [
        "You are never alone in this vast cosmos, dear one. The stars themselves hold space for your feelings.",
        "Like the moon that waxes and wanes, your emotions are part of nature's beautiful rhythm. This too shall pass.",
        "The universe embraces you with infinite love. You are stronger than you know, and the cosmos believes in you."
      ],
      learning: [
        "The study of the stars is the study of the soul. Each planet tells a story, each sign reveals a truth.",
        "Astrology is the language of the cosmos, and you are learning to speak it fluently. The universe is your teacher.",
        "Knowledge of the stars is wisdom of the heart. You are opening doors to understanding the very fabric of existence."
      ],
      default: [
        "The cosmic patterns shift and dance, revealing new insights with each passing moment. Your question touches the very essence of the universe.",
        "The stars whisper secrets that only the open heart can hear. Your curiosity is a gift to the cosmos.",
        "In the vast tapestry of the universe, your question weaves a new thread of understanding. The cosmos responds with infinite wisdom."
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

  const handleQuickPrompt = (prompt: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText(prompt.text);
  };

  const handleVoiceInput = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start voice recording animation
      const voiceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(voiceWaveAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(voiceWaveAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      voiceAnimation.start();
      
      // Simulate voice input
      setTimeout(() => {
        setIsRecording(false);
        voiceAnimation.stop();
        setInputText("Tell me about my love life today");
      }, 3000);
    }
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
            resizeMode="contain"
          />
        </Animated.View>

        {/* Voice Wave Effect */}
        {isRecording && (
          <Animated.View
            style={[
              styles.voiceWave,
              {
                opacity: voiceWaveAnim,
                transform: [
                  {
                    scale: voiceWaveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.5],
                    }),
                  },
                ],
              },
            ]}
          />
        )}
      </View>
    );
  };

  const renderMessageBubble = (message: Message) => {
    if (message.isUser) {
      return (
        <View key={message.id} style={styles.userMessageContainer}>
          <View style={styles.userBubble}>
            <LinearGradient
              colors={['rgba(139, 95, 191, 0.8)', 'rgba(79, 195, 247, 0.6)']}
              style={styles.userBubbleGradient}
            >
              <Text style={styles.userMessageText}>{message.text}</Text>
            </LinearGradient>
          </View>
        </View>
      );
    }

    return (
      <View key={message.id} style={styles.lunaMessageContainer}>
        <View style={styles.lunaBubble}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(139, 95, 191, 0.2)']}
            style={styles.lunaBubbleGradient}
          >
            <Text style={styles.lunaMessageText}>{message.text}</Text>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.lunaMessageContainer}>
        <View style={styles.typingBubble}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(139, 95, 191, 0.2)']}
            style={styles.lunaBubbleGradient}
          >
            <Text style={styles.typingText}>Luna is consulting the cosmic patterns...</Text>
            <View style={styles.typingDots}>
              {[...Array(3)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.typingDot,
                    {
                      opacity: lunaGlowAnim.interpolate({
                        inputRange: [0, 1, 2],
                        outputRange: [0.3, 1, 0.3],
                      }),
                    },
                  ]}
                />
              ))}
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderQuickPrompts = () => {
    return (
      <View style={styles.quickPromptsContainer}>
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
      </View>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Cosmic Background */}
      <LinearGradient
        colors={['#0B0B2F', '#1A1A3E', '#2D1B69']}
        style={styles.backgroundGradient}
      >
        {/* Animated Starfield */}
        <View style={styles.starfield}>
          {[...Array(100)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.star,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  opacity: starTwinkleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [
                      Math.random() * 0.4 + 0.2,
                      Math.random() * 0.8 + 0.6,
                      Math.random() * 0.4 + 0.2,
                    ],
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
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <View style={styles.backButtonContainer}>
              <Text style={styles.backButtonIcon}>‹</Text>
              <View style={styles.starAccent} />
            </View>
          </TouchableOpacity>
        )}

        {/* Luna Avatar */}
        {renderLunaAvatar()}

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {messages.map(renderMessageBubble)}
          {renderTypingIndicator()}
        </ScrollView>

        {/* Quick Prompts */}
        {renderQuickPrompts()}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask Luna anything..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={handleVoiceInput}
            >
              <LinearGradient
                colors={isRecording ? ['#FF6B6B', '#FF8E8E'] : ['#8A4FFF', '#A569FF']}
                style={styles.voiceButtonGradient}
              >
                <Text style={styles.voiceButtonIcon}>🎤</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <LinearGradient
                colors={inputText.trim() ? ['#FFD700', '#FFA500'] : ['#666', '#888']}
                style={styles.sendButtonGradient}
              >
                <Text style={styles.sendButtonIcon}>✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
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
  },
  lunaImage: {
    width: 100,
    height: 100,
  },
  voiceWave: {
    position: 'absolute',
    top: 50,
    left: 50,
    right: 50,
    bottom: 50,
    borderWidth: 2,
    borderColor: '#4FC3F7',
    borderRadius: 60,
  },

  // Message Styles
  messagesContainer: {
    flex: 1,
    marginTop: 175,
    marginBottom: 200,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  userBubbleGradient: {
    padding: 16,
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  lunaBubbleGradient: {
    padding: 16,
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
