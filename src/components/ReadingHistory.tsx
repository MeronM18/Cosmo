import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';
import { CompletedReading, HoroscopeData } from '../services/horoscopesState';

const { width } = Dimensions.get('window');

interface ReadingHistoryProps {
  completedReadings: CompletedReading[];
  horoscopes: {
    today: HoroscopeData | null;
    yesterday: HoroscopeData | null;
    tomorrow: HoroscopeData | null;
    weekly: HoroscopeData | null;
    monthly: HoroscopeData | null;
    cached: HoroscopeData[];
  };
  onUpdateReading?: (readingId: string, updates: Partial<CompletedReading>) => void;
}

const ReadingHistory: React.FC<ReadingHistoryProps> = ({ 
  completedReadings, 
  horoscopes,
  onUpdateReading 
}) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'yesterday' | 'tomorrow' | 'weekly' | 'monthly'>('all');
  const [selectedReading, setSelectedReading] = useState<CompletedReading | null>(null);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tempMoodRating, setTempMoodRating] = useState<number>(0);
  const [tempAccuracyRating, setTempAccuracyRating] = useState<number>(0);
  const [tempNotes, setTempNotes] = useState<string>('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getFilteredReadings = () => {
    if (selectedPeriod === 'all') {
      return completedReadings.sort((a, b) => new Date(b.readDate).getTime() - new Date(a.readDate).getTime());
    }
    return completedReadings
      .filter(reading => reading.period === selectedPeriod)
      .sort((a, b) => new Date(b.readDate).getTime() - new Date(a.readDate).getTime());
  };

  const getHoroscopeForReading = (reading: CompletedReading): HoroscopeData | null => {
    const horoscopeMap = {
      today: horoscopes.today,
      yesterday: horoscopes.yesterday,
      tomorrow: horoscopes.tomorrow,
      weekly: horoscopes.weekly,
      monthly: horoscopes.monthly
    };
    
    return horoscopeMap[reading.period] || horoscopes.cached.find(h => h.id === reading.horoscopeId) || null;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPeriodIcon = (period: string) => {
    const icons = {
      today: '🌟',
      yesterday: '📅',
      tomorrow: '🔮',
      weekly: '📊',
      monthly: '🌙'
    };
    return icons[period as keyof typeof icons] || '📖';
  };

  const getPeriodColor = (period: string) => {
    const colors = {
      today: '#FFD700',
      yesterday: '#8A4FFF',
      tomorrow: '#6366F1',
      weekly: '#4CAF50',
      monthly: '#FF9800'
    };
    return colors[period as keyof typeof colors] || '#8A4FFF';
  };

  const handleReadingPress = (reading: CompletedReading) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReading(reading);
    setShowReadingModal(true);
  };

  const handleRateReading = (reading: CompletedReading) => {
    setSelectedReading(reading);
    setTempMoodRating(reading.moodRating || 0);
    setTempAccuracyRating(reading.accuracyRating || 0);
    setTempNotes(reading.notes || '');
    setShowRatingModal(true);
  };

  const saveRating = () => {
    if (selectedReading && onUpdateReading) {
      onUpdateReading(selectedReading.id, {
        moodRating: tempMoodRating,
        accuracyRating: tempAccuracyRating,
        notes: tempNotes
      });
      setShowRatingModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const renderStars = (rating: number, onPress?: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress?.(star)}
            style={styles.starButton}
          >
            <Text style={[styles.star, star <= rating && styles.starActive]}>
              ⭐
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReadingCard = (reading: CompletedReading) => {
    const horoscope = getHoroscopeForReading(reading);
    const periodColor = getPeriodColor(reading.period);
    
    return (
      <TouchableOpacity
        key={reading.id}
        style={styles.readingCard}
        onPress={() => handleReadingPress(reading)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[periodColor + '20', periodColor + '40']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.periodInfo}>
              <Text style={styles.periodIcon}>{getPeriodIcon(reading.period)}</Text>
              <View>
                <Text style={[styles.periodText, { color: periodColor }]}>
                  {reading.period.charAt(0).toUpperCase() + reading.period.slice(1)} Reading
                </Text>
                <Text style={styles.dateText}>{formatDate(reading.readDate)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.rateButton}
              onPress={(e) => {
                e.stopPropagation();
                handleRateReading(reading);
              }}
            >
              <Text style={styles.rateButtonText}>Rate</Text>
            </TouchableOpacity>
          </View>
          
          {horoscope && (
            <View style={styles.cardContent}>
              <Text style={styles.horoscopePreview} numberOfLines={3}>
                {horoscope.content.main}
              </Text>
              <View style={styles.cardFooter}>
                <View style={styles.ratingsContainer}>
                  {reading.moodRating ? (
                    <View style={styles.ratingItem}>
                      <Text style={styles.ratingLabel}>Mood:</Text>
                      {renderStars(reading.moodRating)}
                    </View>
                  ) : null}
                  {reading.accuracyRating ? (
                    <View style={styles.ratingItem}>
                      <Text style={styles.ratingLabel}>Accuracy:</Text>
                      {renderStars(reading.accuracyRating)}
                    </View>
                  ) : null}
                </View>
                {reading.notes && (
                  <Text style={styles.notesPreview} numberOfLines={1}>
                    💭 {reading.notes}
                  </Text>
                )}
              </View>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  const filteredReadings = getFilteredReadings();

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
      <Text style={[styles.sectionTitle, { fontFamily: 'Cinzel_700Bold' }]}>
        Your Reading History
      </Text>
      
      {/* Period Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'today', 'yesterday', 'tomorrow', 'weekly', 'monthly'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.filterButton,
                selectedPeriod === period && styles.filterButtonActive
              ]}
              onPress={() => {
                setSelectedPeriod(period as any);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[
                styles.filterButtonText,
                selectedPeriod === period && styles.filterButtonTextActive
              ]}>
                {period === 'all' ? 'All' : period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reading List */}
      <ScrollView style={styles.readingsList} showsVerticalScrollIndicator={false}>
        {filteredReadings.length > 0 ? (
          filteredReadings.map(renderReadingCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📚</Text>
            <Text style={[styles.emptyStateTitle, { fontFamily: 'Cinzel_400Regular' }]}>
              No Readings Yet
            </Text>
            <Text style={styles.emptyStateText}>
              Start reading your horoscopes to build your cosmic journey history!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Reading Detail Modal */}
      <Modal
        visible={showReadingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReadingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReading && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { fontFamily: 'Cinzel_700Bold' }]}>
                    {getPeriodIcon(selectedReading.period)} {selectedReading.period.charAt(0).toUpperCase() + selectedReading.period.slice(1)} Reading
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowReadingModal(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody}>
                  <Text style={styles.modalDate}>{formatDate(selectedReading.readDate)}</Text>
                  
                  {(() => {
                    const horoscope = getHoroscopeForReading(selectedReading);
                    if (!horoscope) return <Text>Reading not found</Text>;
                    
                    return (
                      <>
                        <Text style={styles.modalMainReading}>{horoscope.content.main}</Text>
                        
                        <View style={styles.modalCategories}>
                          <Text style={[styles.categoryTitle, { fontFamily: 'Cinzel_400Regular' }]}>Love & Relationships</Text>
                          <Text style={styles.categoryText}>{horoscope.content.categories.love}</Text>
                          
                          <Text style={[styles.categoryTitle, { fontFamily: 'Cinzel_400Regular' }]}>Career & Ambition</Text>
                          <Text style={styles.categoryText}>{horoscope.content.categories.career}</Text>
                          
                          <Text style={[styles.categoryTitle, { fontFamily: 'Cinzel_400Regular' }]}>Health & Wellness</Text>
                          <Text style={styles.categoryText}>{horoscope.content.categories.health}</Text>
                          
                          <Text style={[styles.categoryTitle, { fontFamily: 'Cinzel_400Regular' }]}>Personal Growth</Text>
                          <Text style={styles.categoryText}>{horoscope.content.categories.growth}</Text>
                        </View>
                        
                        <View style={styles.modalLuckyElements}>
                          <Text style={[styles.luckyTitle, { fontFamily: 'Cinzel_400Regular' }]}>Lucky Elements</Text>
                          <View style={styles.luckyGrid}>
                            <View style={styles.luckyItem}>
                              <Text style={styles.luckyLabel}>Color</Text>
                              <Text style={styles.luckyValue}>{horoscope.content.luckyElements.color}</Text>
                            </View>
                            <View style={styles.luckyItem}>
                              <Text style={styles.luckyLabel}>Number</Text>
                              <Text style={styles.luckyValue}>{horoscope.content.luckyElements.number}</Text>
                            </View>
                            <View style={styles.luckyItem}>
                              <Text style={styles.luckyLabel}>Time</Text>
                              <Text style={styles.luckyValue}>{horoscope.content.luckyElements.time}</Text>
                            </View>
                            <View style={styles.luckyItem}>
                              <Text style={styles.luckyLabel}>Direction</Text>
                              <Text style={styles.luckyValue}>{horoscope.content.luckyElements.direction}</Text>
                            </View>
                          </View>
                        </View>
                      </>
                    );
                  })()}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ratingModalContent}>
            <Text style={[styles.ratingModalTitle, { fontFamily: 'Cinzel_700Bold' }]}>
              Rate Your Reading
            </Text>
            
            <View style={styles.ratingSection}>
              <Text style={styles.ratingSectionTitle}>How was your mood?</Text>
              {renderStars(tempMoodRating, setTempMoodRating)}
            </View>
            
            <View style={styles.ratingSection}>
              <Text style={styles.ratingSectionTitle}>How accurate was the reading?</Text>
              {renderStars(tempAccuracyRating, setTempAccuracyRating)}
            </View>
            
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes (optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={tempNotes}
                onChangeText={setTempNotes}
                placeholder="Add your thoughts about this reading..."
                multiline
                numberOfLines={3}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
            
            <View style={styles.ratingModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveRating}
              >
                <Text style={styles.saveButtonText}>Save Rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#8A4FFF',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  readingsList: {
    flex: 1,
  },
  readingCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  rateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    flex: 1,
  },
  horoscopePreview: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 4,
  },
  notesPreview: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  modalBody: {
    padding: 20,
  },
  modalDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  modalMainReading: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalCategories: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    color: '#8A4FFF',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  modalLuckyElements: {
    marginTop: 20,
  },
  luckyTitle: {
    fontSize: 16,
    color: '#8A4FFF',
    fontWeight: '600',
    marginBottom: 12,
  },
  luckyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  luckyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    minWidth: '45%',
    alignItems: 'center',
  },
  luckyLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  luckyValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ratingModalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    width: width * 0.9,
    padding: 20,
  },
  ratingModalTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingSectionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  starActive: {
    color: '#FFD700',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  ratingModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#8A4FFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReadingHistory;
