import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { OpenAIService } from '../services/openai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AIChatScreenProps {
  onGoBack?: () => void;
}

// Much faster typing configuration - no pauses
const TYPING_CONFIG = {
  baseSpeed: 20, // Much faster base speed
  fastSpeed: 15, // Very fast for normal characters
  hapticWordMinLength: 4, // Less frequent haptics
};

export default function AIChatScreen({ onGoBack }: AIChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: "Hi my name is Luna, what can I help you with?",
        timestamp: new Date(),
      };
      
      setTimeout(() => {
        typeMessage(welcomeMessage);
      }, 200); // Faster initial delay
    }
  }, [hasInitialized]);

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
    };

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
        isTypingRef.current = false;
        setMessages(prev => prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, isTyping: false }
            : msg
        ));
        
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 50);
      }
    };

    // Start immediately - no delay
    typingTimeoutRef.current = setTimeout(typeNextCharacter, 5);
  };

  const stopTyping = () => {
    isTypingRef.current = false;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    stopTyping();

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      const conversationHistory = messages
        .filter(msg => !msg.isTyping)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await OpenAIService.sendMessage(inputText, conversationHistory);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      // Start typing immediately after API response
      setTimeout(() => {
        setIsLoading(false);
        typeMessage(assistantMessage);
      }, 100); // Much shorter delay

    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Error', error.message);
      console.error('Chat error:', error);
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear the conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            stopTyping();
            setMessages([]);
            
            const welcomeMessage: Message = {
                id: `welcome-clear-${Date.now()}`,
                role: 'assistant',
                content: "Fresh start! What's up?",
                timestamp: new Date(),
              };
            
            setTimeout(() => {
              typeMessage(welcomeMessage);
            }, 200); // Faster delay
          },
        },
      ]
    );
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await OpenAIService.testAstrologer();
      
      const testMessage: Message = {
        id: `test-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setTimeout(() => {
        setIsLoading(false);
        typeMessage(testMessage);
      }, 100); // Faster delay
      
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Error', `Connection failed: ${error.message}`);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Luna - AI Astrologer</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={testConnection}>
            <Text style={styles.headerButtonText}>Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={clearChat}>
            <Text style={styles.headerButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <Text style={[
              styles.messageText,
              message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
            ]}>
              {message.content}
            </Text>
            <Text style={[
              styles.timestamp,
              message.role === 'user' ? styles.userTimestamp : styles.assistantTimestamp,
            ]}>
              {formatTimestamp(message.timestamp)}
            </Text>
          </View>
        ))}
        
        {isLoading && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={styles.loadingContainer}>
              <PulsingLoader />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask Luna about your cosmic journey..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Faster pulsing loader
const PulsingLoader = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600, // Faster pulse
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    const dotsInterval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 300); // Faster dots

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
      clearInterval(dotsInterval);
    };
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.loaderContent, { opacity: pulseAnim }]}>
      <Text style={styles.loaderEmoji}>🌙</Text>
      <Text style={styles.loaderText}>
        Luna is consulting the stars{'.'.repeat(dotCount)}
      </Text>
      <Text style={styles.loaderSparkle}>✨</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#6366f1',
    borderRadius: 6,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#6366f1',
    borderRadius: 6,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f3f4',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 5,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: '#666',
  },
  loadingContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  loaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  loaderText: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 16,
    minWidth: 180,
  },
  loaderSparkle: {
    fontSize: 16,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    backgroundColor: '#f8f9fa',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});