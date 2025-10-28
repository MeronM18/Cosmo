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
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { iOS17Theme } from '../../theme/ios17Theme';
import { JournalEntry, Goal, SectionProps } from '../../types/horoscopeExtensions';

interface IOS17AstroJournalProps extends SectionProps {
  selectedTimePeriod: string;
}

const { width } = Dimensions.get('window');

const IOS17AstroJournal: React.FC<IOS17AstroJournalProps> = ({
  userData,
  selectedTimePeriod,
  onPremiumUpgrade,
}) => {
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);
  const [showJournal, setShowJournal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [currentMood, setCurrentMood] = useState(3);
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  const [newGratitudeItem, setNewGratitudeItem] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  
  // Mood emojis
  const moodEmojis = ['😔', '😐', '😊', '😄', '🌟'];
  const moodLabels = ['Low', 'Okay', 'Good', 'Great', 'Best'];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const moodAnimations = useRef(moodEmojis.map(() => new Animated.Value(0))).current;
  const insets = useSafeAreaInsets();

  // Daily reflection prompts based on zodiac sign and time period
  const getReflectionPrompt = (zodiacSign: string, timePeriod: string): string => {
    const prompts: Record<string, Record<string, string>> = {
      'Aries': {
        daily: "What bold action did you take today that moved you closer to your goals?",
        weekly: "How did you channel your natural leadership energy this week?",
        yearly: "What new territory are you ready to explore this year?"
      },
      'Taurus': {
        daily: "What brought you comfort and stability today?",
        weekly: "How did you create beauty and pleasure in your life this week?",
        yearly: "What foundations are you building for lasting security this year?"
      },
      'Gemini': {
        daily: "What new information or connection enriched your day?",
        weekly: "How did you share your knowledge or learn something new this week?",
        yearly: "What skills or knowledge do you want to master this year?"
      },
      'Cancer': {
        daily: "How did you nurture yourself or others today?",
        weekly: "What emotional growth did you experience this week?",
        yearly: "How are you creating a home and family life that fulfills you this year?"
      },
      'Leo': {
        daily: "How did you express your authentic self today?",
        weekly: "What creative project or performance brought you joy this week?",
        yearly: "How are you stepping into your full potential and receiving recognition this year?"
      },
      'Virgo': {
        daily: "What service or helpful action did you perform today?",
        weekly: "How did you organize or improve something in your life this week?",
        yearly: "What skills are you perfecting to make a meaningful contribution this year?"
      },
      'Libra': {
        daily: "How did you create harmony or balance in your relationships today?",
        weekly: "What decisions did you make that honored your values this week?",
        yearly: "How are you building partnerships and creating beauty in your life this year?"
      },
      'Scorpio': {
        daily: "What transformation or deep insight did you experience today?",
        weekly: "How did you dive deep into your truth and emerge stronger this week?",
        yearly: "What profound changes are you creating in your life this year?"
      },
      'Sagittarius': {
        daily: "What adventure or new perspective did you explore today?",
        weekly: "How did you expand your understanding of the world this week?",
        yearly: "What higher ideals or vision are you pursuing this year?"
      },
      'Capricorn': {
        daily: "What step did you take toward your long-term goals today?",
        weekly: "How did you demonstrate discipline and determination this week?",
        yearly: "What legacy are you building and what heights are you climbing this year?"
      },
      'Aquarius': {
        daily: "How did you contribute to positive change or innovation today?",
        weekly: "What connections did you make with your community this week?",
        yearly: "How are you revolutionizing your life and inspiring others this year?"
      },
      'Pisces': {
        daily: "How did you connect with your intuition or spiritual nature today?",
        weekly: "What compassionate service or creative expression did you offer this week?",
        yearly: "How are you dissolving boundaries and merging with universal love this year?"
      }
    };

    return prompts[zodiacSign]?.[timePeriod.toLowerCase()] || 
      "How did you align with the cosmic energy today and what insights did you receive?";
  };

  useEffect(() => {
    const initializeJournal = async () => {
      try {
        console.log('🚀 Initializing journal...');
        const history = await loadJournalHistory();
        await loadTodayEntry(history);
        animateIn();
        console.log('✅ Journal initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing journal:', error);
        // Fallback initialization
        animateIn();
      }
    };
    
    initializeJournal();
  }, [selectedTimePeriod]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...iOS17Theme.springConfigs.gentle,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Stagger mood button animations
    const staggerDelay = 50;
    moodAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * staggerDelay,
        useNativeDriver: true,
      }).start();
    });
  };

  const loadTodayEntry = async (history: JournalEntry[] = journalHistory) => {
    try {
      console.log('📝 Creating new entry for today');
      const prompt = getReflectionPrompt(userData.zodiacSign, selectedTimePeriod);
      const uniqueId = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newEntry: JournalEntry = {
        id: uniqueId,
        userId: userData.name,
        date: new Date(),
        prompt,
        response: '',
        mood: 3,
        planetaryInfluence: `${userData.zodiacSign} energy`,
        goals: [],
        gratitudeItems: [],
      };
      
      setCurrentEntry(newEntry);
      setJournalText('');
      setCurrentMood(3);
      setGratitudeItems([]);
      setGoals([]);
      
      console.log('✅ New entry created:', newEntry.id);
    } catch (error) {
      console.error('❌ Error creating new entry:', error);
      // Fallback to creating a new entry
      const prompt = getReflectionPrompt(userData.zodiacSign, selectedTimePeriod);
      const uniqueId = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newEntry: JournalEntry = {
        id: uniqueId,
        userId: userData.name,
        date: new Date(),
        prompt,
        response: '',
        mood: 3,
        planetaryInfluence: `${userData.zodiacSign} energy`,
        goals: [],
        gratitudeItems: [],
      };
      
      setCurrentEntry(newEntry);
      setJournalText('');
      setCurrentMood(3);
      setGratitudeItems([]);
      setGoals([]);
    }
  };

  const loadJournalHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('journalHistory');
      if (history) {
        const parsedHistory = JSON.parse(history);
        // Validate and migrate data if needed
        const validatedHistory = parsedHistory.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date), // Ensure date is properly parsed
          goals: entry.goals || [],
          gratitudeItems: entry.gratitudeItems || [],
        }));
        setJournalHistory(validatedHistory);
        console.log('📚 Loaded journal history:', validatedHistory.length, 'entries');
        return validatedHistory;
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading journal history:', error);
      // If data is corrupted, clear it and start fresh
      try {
        await AsyncStorage.removeItem('journalHistory');
        console.log('🧹 Cleared corrupted journal history');
      } catch (clearError) {
        console.error('❌ Error clearing corrupted history:', clearError);
      }
      return [];
    }
  };

  const saveJournalEntry = async () => {
    if (!currentEntry || !journalText.trim()) {
      Alert.alert('Required', 'Please write something in your journal entry.');
      return false;
    }

    try {
      // Generate unique ID for new entry
      const uniqueId = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const updatedEntry: JournalEntry = {
        ...currentEntry,
        id: uniqueId, // Always create new unique ID
        response: journalText,
        mood: currentMood,
        gratitudeItems,
        goals,
        date: new Date(), // Update to current timestamp
      };

      // Add new entry to history (allow multiple entries per day)
      const newHistory = [updatedEntry, ...journalHistory];
      
      // Update state
      setJournalHistory(newHistory);
      setCurrentEntry(updatedEntry);
      
      // Persist to AsyncStorage
      await AsyncStorage.setItem('journalHistory', JSON.stringify(newHistory));
      
      // Reset form for new entry
      setJournalText('');
      setCurrentMood(3);
      setGratitudeItems([]);
      setGoals([]);
      
      // Create new entry for next journal entry
      const prompt = getReflectionPrompt(userData.zodiacSign, selectedTimePeriod);
      const newEntryId = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newEntry: JournalEntry = {
        id: newEntryId,
        userId: userData.name,
        date: new Date(),
        prompt,
        response: '',
        mood: 3,
        planetaryInfluence: `${userData.zodiacSign} energy`,
        goals: [],
        gratitudeItems: [],
      };
      setCurrentEntry(newEntry);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Show success popup
      Alert.alert(
        '✅ Journal Entry Saved!',
        'Your cosmic reflections have been preserved in the stars.',
        [{ text: 'Continue', style: 'default' }]
      );
      
      console.log('✅ Journal entry saved successfully:', {
        id: updatedEntry.id,
        date: updatedEntry.date,
        responseLength: updatedEntry.response.length,
        mood: updatedEntry.mood,
        gratitudeCount: updatedEntry.gratitudeItems.length,
        goalsCount: updatedEntry.goals.length
      });
      return true;
    } catch (error) {
      console.error('❌ Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save journal entry. Please try again.');
      return false;
    }
  };

  const addGratitudeItem = () => {
    if (newGratitudeItem.trim()) {
      setGratitudeItems([...gratitudeItems, newGratitudeItem.trim()]);
      setNewGratitudeItem('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removeGratitudeItem = (index: number) => {
    setGratitudeItems(gratitudeItems.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      const goal: Goal = {
        id: `goal-${Date.now()}`,
        text: newGoal.trim(),
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isCompleted: false,
        astrologicalTiming: 'Current favorable transit',
      };
      setGoals([...goals, goal]);
      setNewGoal('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleGoalCompletion = (goalId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, isCompleted: !goal.isCompleted } : goal
    ));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderGratitudeItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.gratitudeItem}>
      <Text style={styles.gratitudeItemText}>✨ {item}</Text>
      <TouchableOpacity
        onPress={() => removeGratitudeItem(index)}
        style={styles.removeButton}
      >
        <Text style={styles.removeButtonText}>{iOS17Theme.symbols.xmark}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <TouchableOpacity
      style={styles.goalItem}
      onPress={() => toggleGoalCompletion(item.id)}
    >
      <Text style={[
        styles.goalText,
        item.isCompleted && styles.completedGoalText
      ]}>
        {item.isCompleted ? iOS17Theme.symbols.checkmark : iOS17Theme.symbols.circle} {item.text}
      </Text>
    </TouchableOpacity>
  );

  const formatDateTime = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (entryDate.getTime() === today.getTime()) {
      // Today - show time
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      // Other days - show date and time
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  const renderHistoryItem = ({ item }: { item: JournalEntry }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <View style={styles.historyDateContainer}>
          <Text style={styles.historyDate}>
            {formatDate(new Date(item.date))}
          </Text>
          <Text style={styles.historyTime}>
            {formatDateTime(new Date(item.date))}
          </Text>
        </View>
        <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(item.mood) }]}>
          <Text style={styles.moodIndicatorText}>
            {moodEmojis[item.mood - 1]}
          </Text>
        </View>
      </View>
      <Text style={styles.historyPrompt}>{item.prompt}</Text>
      <Text style={styles.historyResponse}>{item.response}</Text>
      {item.gratitudeItems.length > 0 && (
        <View style={styles.historyGratitude}>
          <Text style={styles.historyGratitudeTitle}>Gratitude:</Text>
          {item.gratitudeItems.map((gratitudeItem, index) => (
            <Text key={index} style={styles.historyGratitudeItem}>
              ✨ {gratitudeItem}
            </Text>
          ))}
        </View>
      )}
      {item.goals.length > 0 && (
        <View style={styles.historyGoals}>
          <Text style={styles.historyGoalsTitle}>Goals:</Text>
          {item.goals.map((goal, index) => (
            <Text key={index} style={styles.historyGoalItem}>
              🎯 {goal.text}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMoodColor = (mood: number) => {
    const colors = [
      '#FF6B9D', // Red for Low mood
      '#FFA726', // Orange for Okay mood
      '#4CAF50', // Green for Good mood
      '#2196F3', // Blue for Great mood
      '#8A4FFF'  // Cosmic Purple for Best mood (matches journal button)
    ];
    return colors[mood - 1] || '#FFA726';
  };

  if (!currentEntry) {
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
      <BlurView intensity={15} tint="systemMaterial" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>Astro Journal</Text>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={async () => {
              await loadJournalHistory();
              setShowHistory(true);
            }}
          >
            <Text style={styles.historyIcon}>↺</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>{currentEntry.prompt}</Text>
        </View>

        <View style={styles.moodContainer}>
          <Text style={styles.moodLabel}>How are you feeling today?</Text>
          <View style={styles.moodSelector}>
            {moodEmojis.map((emoji, index) => (
              <Animated.View
                key={index}
                style={[
                  { opacity: moodAnimations[index] }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.moodButton,
                    currentMood === index + 1 && styles.selectedMoodButton,
                    { backgroundColor: currentMood === index + 1 ? getMoodColor(index + 1) : iOS17Theme.colors.tertiarySystemFill }
                  ]}
                  onPress={() => {
                    setCurrentMood(index + 1);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.moodEmoji}>{emoji}</Text>
                  <Text style={[
                    styles.moodButtonLabel,
                    currentMood === index + 1 && styles.selectedMoodLabel
                  ]} numberOfLines={1}>
                    {moodLabels[index]}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.gratitudeContainer}>
          <Text style={styles.sectionTitle}>Gratitude</Text>
          <View style={styles.gratitudeInputContainer}>
            <TextInput
              style={styles.gratitudeInput}
              placeholder="What are you grateful for today?"
              placeholderTextColor={iOS17Theme.colors.quaternaryLabel}
              value={newGratitudeItem}
              onChangeText={setNewGratitudeItem}
              allowFontScaling={true}
              maxFontSizeMultiplier={1.3}
              onSubmitEditing={addGratitudeItem}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addGratitudeItem}
            >
              <Text style={styles.addButtonText}>{iOS17Theme.symbols.plus}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.gratitudeItems}>
            {gratitudeItems.map((item, index) => (
              <View key={index}>
                {renderGratitudeItem({ item, index })}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.goalsContainer}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <View style={styles.goalInputContainer}>
            <TextInput
              style={styles.goalInput}
              placeholder="What do you want to achieve?"
              placeholderTextColor={iOS17Theme.colors.quaternaryLabel}
              value={newGoal}
              onChangeText={setNewGoal}
              allowFontScaling={true}
              maxFontSizeMultiplier={1.3}
              onSubmitEditing={addGoal}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addGoal}
            >
              <Text style={styles.addButtonText}>{iOS17Theme.symbols.plus}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.goalsList}>
            {goals.map((goal, index) => (
              <View key={index}>
                {renderGoalItem({ item: goal })}
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.journalButton}
          onPress={() => setShowJournal(true)}
        >
          <Text style={styles.journalButtonText}>📝 Write Journal Entry</Text>
        </TouchableOpacity>
      </BlurView>

      {/* Journal Writing Modal */}
      <Modal
        visible={showJournal}
        animationType="slide"
        onRequestClose={() => setShowJournal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <BlurView intensity={15} tint="systemMaterial" style={styles.modalBlurView}>
            <View style={[styles.modalHeader, { paddingTop: insets.top + iOS17Theme.spacing.lg }]}>
              <Text style={styles.modalTitle}>Journal Entry</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowJournal(false)}
              >
                <Text style={styles.closeButtonText}>{iOS17Theme.symbols.xmark}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.journalContent}>
              <Text style={styles.journalPrompt}>
                {currentEntry.prompt}
              </Text>
              
              <TextInput
                style={styles.journalInput}
                placeholder="Share your thoughts and reflections..."
                placeholderTextColor={iOS17Theme.colors.quaternaryLabel}
                value={journalText}
                onChangeText={setJournalText}
                allowFontScaling={true}
                maxFontSizeMultiplier={1.3}
                multiline
                textAlignVertical="top"
                maxLength={1000}
              />
              
              <Text style={styles.characterCount}>
                {journalText.length}/1000 characters
              </Text>
              
              <TouchableOpacity
                style={[styles.saveButton, !journalText.trim() && styles.disabledButton]}
                onPress={async () => {
                  const saved = await saveJournalEntry();
                  if (saved) {
                    setShowJournal(false);
                  }
                }}
                disabled={!journalText.trim()}
              >
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>

      {/* History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={15} tint="systemMaterial" style={styles.modalBlurView}>
            <View style={[styles.modalHeader, { paddingTop: insets.top + iOS17Theme.spacing.lg }]}>
              <Text style={styles.modalTitle}>Journal History</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowHistory(false)}
              >
                <Text style={styles.closeButtonText}>{iOS17Theme.symbols.xmark}</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.historyScrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {journalHistory.length > 0 ? (
                journalHistory
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first
                  .map((entry, index) => (
                    <View key={entry.id || index}>
                      {renderHistoryItem({ item: entry })}
                    </View>
                  ))
              ) : (
                <View style={styles.emptyHistoryContainer}>
                  <Text style={styles.emptyHistoryIcon}>📖</Text>
                  <Text style={styles.emptyHistory}>No journal entries yet</Text>
                  <Text style={styles.emptyHistorySubtext}>Start your cosmic journey by writing your first entry!</Text>
                </View>
              )}
            </ScrollView>
          </BlurView>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: iOS17Theme.spacing.xl,
    marginHorizontal: iOS17Theme.spacing.md,
  },
  card: {
    borderRadius: iOS17Theme.cornerRadius.large,
    padding: iOS17Theme.spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: iOS17Theme.colors.separator,
    overflow: 'hidden',
    ...iOS17Theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.lg,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  title: {
    ...iOS17Theme.typography.largeTitle,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
    marginBottom: 0,
    textAlign: 'center',
    flex: 1,
  },
  historyButton: {
    backgroundColor: iOS17Theme.colors.systemFill,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: iOS17Theme.colors.separator,
    ...iOS17Theme.shadows.small,
  },
  historyIcon: {
    fontSize: 18,
    color: iOS17Theme.colors.label,
  },
  promptContainer: {
    marginBottom: iOS17Theme.spacing.md,
    paddingBottom: iOS17Theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: iOS17Theme.colors.separator,
  },
  promptText: {
    ...iOS17Theme.typography.body,
    lineHeight: 24,
    color: iOS17Theme.colors.label,
    fontStyle: 'italic',
  },
  moodContainer: {
    marginBottom: iOS17Theme.spacing.lg,
  },
  moodLabel: {
    ...iOS17Theme.typography.headline,
    color: iOS17Theme.colors.secondaryLabel,
    marginBottom: iOS17Theme.spacing.md,
    fontWeight: '600',
  },
  moodButtonLabel: {
    ...iOS17Theme.typography.caption2,
    color: iOS17Theme.colors.secondaryLabel,
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '500',
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: iOS17Theme.spacing.xs,
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: iOS17Theme.spacing.sm,
    borderRadius: iOS17Theme.cornerRadius.medium,
    borderWidth: 2,
    borderColor: 'transparent',
    width: 60,
    height: 60,
    ...iOS17Theme.shadows.small,
  },
  selectedMoodButton: {
    borderColor: iOS17Theme.colors.label,
    ...iOS17Theme.shadows.medium,
  },
  moodEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  selectedMoodLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 9,
    textAlign: 'center',
  },
  gratitudeContainer: {
    marginBottom: iOS17Theme.spacing.sm,
  },
  sectionTitle: {
    ...iOS17Theme.typography.headline,
    color: iOS17Theme.colors.label,
    marginBottom: iOS17Theme.spacing.md,
    fontWeight: '600',
  },
  gratitudeInputContainer: {
    flexDirection: 'row',
    marginBottom: iOS17Theme.spacing.md,
  },
  gratitudeInput: {
    flex: 1,
    ...iOS17Theme.typography.body,
    color: '#FFFFFF',
    fontSize: 16,
    textAlignVertical: 'center',
    backgroundColor: iOS17Theme.colors.tertiarySystemFill,
    borderRadius: iOS17Theme.cornerRadius.medium,
    padding: iOS17Theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: iOS17Theme.colors.separator,
    marginRight: iOS17Theme.spacing.md,
    height: 58,
    maxHeight: 58,
  },
  addButton: {
    backgroundColor: iOS17Theme.colors.cosmicPurple,
    borderRadius: iOS17Theme.cornerRadius.medium,
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    ...iOS17Theme.shadows.small,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  gratitudeItems: {
    maxHeight: 200,
  },
  gratitudeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: iOS17Theme.colors.secondarySystemGroupedBackground,
    padding: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.medium,
    marginBottom: iOS17Theme.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: iOS17Theme.colors.separator,
  },
  gratitudeItemText: {
    ...iOS17Theme.typography.body,
    flex: 1,
    color: iOS17Theme.colors.label,
  },
  removeButton: {
    padding: iOS17Theme.spacing.sm,
    borderRadius: iOS17Theme.cornerRadius.small,
    backgroundColor: iOS17Theme.colors.systemRed,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  goalsContainer: {
    marginBottom: iOS17Theme.spacing.xl,
  },
  goalInputContainer: {
    flexDirection: 'row',
    marginBottom: iOS17Theme.spacing.md,
  },
  goalInput: {
    flex: 1,
    ...iOS17Theme.typography.body,
    color: '#FFFFFF',
    fontSize: 16,
    textAlignVertical: 'center',
    backgroundColor: iOS17Theme.colors.tertiarySystemFill,
    borderRadius: iOS17Theme.cornerRadius.medium,
    padding: iOS17Theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: iOS17Theme.colors.separator,
    marginRight: iOS17Theme.spacing.md,
    height: 58,
    maxHeight: 58,
  },
  goalsList: {
    maxHeight: 200,
  },
  goalItem: {
    backgroundColor: iOS17Theme.colors.secondarySystemGroupedBackground,
    padding: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.medium,
    marginBottom: iOS17Theme.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: iOS17Theme.colors.separator,
    minHeight: 44,
    justifyContent: 'center',
  },
  goalText: {
    ...iOS17Theme.typography.body,
    color: iOS17Theme.colors.label,
  },
  completedGoalText: {
    textDecorationLine: 'line-through',
    color: iOS17Theme.colors.secondaryLabel,
  },
  journalButton: {
    backgroundColor: iOS17Theme.colors.cosmicPurple,
    paddingVertical: iOS17Theme.spacing.lg,
    paddingHorizontal: iOS17Theme.spacing.xl,
    borderRadius: iOS17Theme.cornerRadius.medium,
    alignItems: 'center',
    minHeight: 44,
    ...iOS17Theme.shadows.medium,
  },
  journalButtonText: {
    ...iOS17Theme.typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: iOS17Theme.colors.systemGroupedBackground,
  },
  modalBlurView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: iOS17Theme.spacing.xl,
    paddingVertical: iOS17Theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: iOS17Theme.colors.separator,
  },
  modalTitle: {
    ...iOS17Theme.typography.title2,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
    marginBottom: 0,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: iOS17Theme.colors.secondarySystemFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: iOS17Theme.colors.separator,
    ...iOS17Theme.shadows.small,
  },
  closeButtonText: {
    ...iOS17Theme.typography.headline,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  journalContent: {
    flex: 1,
    paddingHorizontal: iOS17Theme.spacing.xl,
    paddingVertical: iOS17Theme.spacing.lg,
  },
  journalPrompt: {
    ...iOS17Theme.typography.headline,
    color: iOS17Theme.colors.label,
    marginBottom: iOS17Theme.spacing.lg,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  journalInput: {
    ...iOS17Theme.typography.body,
    color: '#FFFFFF',
    backgroundColor: iOS17Theme.colors.secondarySystemGroupedBackground,
    borderRadius: iOS17Theme.cornerRadius.medium,
    padding: iOS17Theme.spacing.lg,
    minHeight: 200,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: iOS17Theme.colors.separator,
    marginBottom: iOS17Theme.spacing.md,
    lineHeight: 24,
  },
  characterCount: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.tertiaryLabel,
    textAlign: 'right',
    marginBottom: iOS17Theme.spacing.xl,
  },
  saveButton: {
    backgroundColor: iOS17Theme.colors.cosmicPurple,
    paddingVertical: iOS17Theme.spacing.lg,
    borderRadius: iOS17Theme.cornerRadius.medium,
    alignItems: 'center',
    minHeight: 44,
    ...iOS17Theme.shadows.medium,
  },
  disabledButton: {
    backgroundColor: iOS17Theme.colors.tertiarySystemFill,
    ...iOS17Theme.shadows.small,
  },
  saveButtonText: {
    ...iOS17Theme.typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  historyScrollView: {
    flex: 1,
    paddingHorizontal: iOS17Theme.spacing.xl,
  },
  historyItem: {
    paddingVertical: iOS17Theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: iOS17Theme.colors.separator,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.md,
  },
  historyDateContainer: {
    flex: 1,
  },
  historyDate: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  historyTime: {
    ...iOS17Theme.typography.caption2,
    color: iOS17Theme.colors.tertiaryLabel,
    marginTop: 2,
  },
  moodIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...iOS17Theme.shadows.small,
  },
  moodIndicatorText: {
    fontSize: 16,
  },
  historyPrompt: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.tertiaryLabel,
    fontStyle: 'italic',
    marginBottom: iOS17Theme.spacing.sm,
  },
  historyResponse: {
    ...iOS17Theme.typography.body,
    color: iOS17Theme.colors.label,
    marginBottom: iOS17Theme.spacing.md,
    lineHeight: 22,
  },
  historyGratitude: {
    backgroundColor: iOS17Theme.colors.tertiarySystemFill,
    padding: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: iOS17Theme.colors.separator,
  },
  historyGratitudeTitle: {
    ...iOS17Theme.typography.caption1,
    fontWeight: '600',
    color: iOS17Theme.colors.label,
    marginBottom: iOS17Theme.spacing.xs,
  },
  historyGratitudeItem: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.secondaryLabel,
    marginBottom: 2,
  },
  historyGoals: {
    backgroundColor: iOS17Theme.colors.tertiarySystemFill,
    padding: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: iOS17Theme.colors.separator,
    marginTop: iOS17Theme.spacing.sm,
  },
  historyGoalsTitle: {
    ...iOS17Theme.typography.caption1,
    fontWeight: '600',
    color: iOS17Theme.colors.label,
    marginBottom: iOS17Theme.spacing.xs,
  },
  historyGoalItem: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.secondaryLabel,
    marginBottom: 2,
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: iOS17Theme.spacing.xxxl,
    paddingHorizontal: iOS17Theme.spacing.lg,
  },
  emptyHistoryIcon: {
    fontSize: 48,
    marginBottom: iOS17Theme.spacing.md,
  },
  emptyHistory: {
    ...iOS17Theme.typography.headline,
    textAlign: 'center',
    color: iOS17Theme.colors.label,
    marginBottom: iOS17Theme.spacing.sm,
    fontWeight: '600',
  },
  emptyHistorySubtext: {
    ...iOS17Theme.typography.body,
    textAlign: 'center',
    color: iOS17Theme.colors.secondaryLabel,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});

export default IOS17AstroJournal;
