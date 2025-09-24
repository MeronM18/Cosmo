import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { iOS17Theme } from '../../theme/ios17Theme';

const { width, height } = Dimensions.get('window');

interface LifeArea {
  id: string;
  title: string;
  icon: string;
  description: string;
  detailedReading: string;
  tips: string[];
  luckyElement: string;
  color: string;
}

interface IOS17LifeAreasProps {
  onCategoryPress?: (categoryId: string) => void;
  userZodiacSign?: string;
}

const IOS17LifeAreas: React.FC<IOS17LifeAreasProps> = ({ onCategoryPress, userZodiacSign = 'Scorpio' }) => {
  const [selectedArea, setSelectedArea] = useState<LifeArea | null>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Generate zodiac-specific life area data
  const getZodiacLifeAreas = (zodiacSign: string): LifeArea[] => {
    const zodiacLifeAreasMap: Record<string, LifeArea[]> = {
      'Aries': [
        {
          id: 'love',
          title: 'Love & Relationships',
          icon: iOS17Theme.symbols.heart,
          description: 'Your emotional connections and romantic prospects',
          detailedReading: 'Mars energizes your love life with passion and directness. Your bold approach attracts admirers who appreciate your confidence. Be open to spontaneous romantic encounters.',
          tips: ['Take the lead in relationships', 'Be direct about your feelings', 'Plan adventurous dates'],
          luckyElement: 'Ruby',
          color: '#C2185B',
        },
        {
          id: 'career',
          title: 'Career & Finance',
          icon: '💼',
          description: 'Professional opportunities and financial insights',
          detailedReading: 'Your pioneering spirit opens new career paths. Leadership opportunities arise naturally. Your competitive nature drives success in sales and management roles.',
          tips: ['Take initiative on projects', 'Network with industry leaders', 'Consider starting your own venture'],
          luckyElement: 'Carnelian',
          color: '#2E7D32',
        },
        {
          id: 'health',
          title: 'Health & Wellness',
          icon: '🏥',
          description: 'Physical and mental well-being focus',
          detailedReading: 'High energy levels support intense workouts. Your competitive nature thrives in sports and fitness challenges. Watch for stress-related tension in shoulders.',
          tips: ['Engage in competitive sports', 'Try high-intensity workouts', 'Practice stress management'],
          luckyElement: 'Red Jasper',
          color: '#1E3A8A',
        },
        {
          id: 'growth',
          title: 'Personal Growth',
          icon: '🧠',
          description: 'Self-improvement and spiritual development',
          detailedReading: 'Your natural leadership abilities expand through new challenges. Learning martial arts or competitive skills enhances your confidence and discipline.',
          tips: ['Take on leadership roles', 'Learn competitive skills', 'Set ambitious personal goals'],
          luckyElement: 'Garnet',
          color: '#6B46C1',
        },
      ],
      'Taurus': [
        {
          id: 'love',
          title: 'Love & Relationships',
          icon: iOS17Theme.symbols.heart,
          description: 'Your emotional connections and romantic prospects',
          detailedReading: 'Venus blesses your relationships with stability and sensuality. Your loyal nature creates lasting bonds. Focus on building trust through consistent actions.',
          tips: ['Plan romantic dinners', 'Give thoughtful gifts', 'Create comfortable spaces together'],
          luckyElement: 'Rose Quartz',
          color: '#C2185B',
        },
        {
          id: 'career',
          title: 'Career & Finance',
          icon: '💼',
          description: 'Professional opportunities and financial insights',
          detailedReading: 'Your practical approach builds solid financial foundations. Real estate and luxury goods investments align with your values. Patience brings long-term rewards.',
          tips: ['Invest in quality items', 'Consider real estate', 'Build emergency savings'],
          luckyElement: 'Green Aventurine',
          color: '#2E7D32',
        },
        {
          id: 'health',
          title: 'Health & Wellness',
          icon: '🏥',
          description: 'Physical and mental well-being focus',
          detailedReading: 'Your connection to nature supports wellness through gardening and outdoor activities. Mindful eating and regular routines maintain your vitality.',
          tips: ['Spend time in nature', 'Practice mindful eating', 'Establish daily routines'],
          luckyElement: 'Jade',
          color: '#1E3A8A',
        },
        {
          id: 'growth',
          title: 'Personal Growth',
          icon: '🧠',
          description: 'Self-improvement and spiritual development',
          detailedReading: 'Your appreciation for beauty guides spiritual growth through art and music. Learning about sustainable living aligns with your values.',
          tips: ['Explore art and music', 'Learn about sustainability', 'Practice gratitude daily'],
          luckyElement: 'Emerald',
          color: '#6B46C1',
        },
      ],
      // Add more zodiac signs as needed...
    };

    return zodiacLifeAreasMap[zodiacSign] || [
      {
        id: 'love',
        title: 'Love & Relationships',
        icon: iOS17Theme.symbols.heart,
        description: 'Your emotional connections and romantic prospects',
        detailedReading: 'Venus is sending positive energy your way, creating opportunities for deep emotional connections. Whether you\'re single or partnered, this is a time to open your heart and express your feelings authentically. Trust your romantic instincts.',
        tips: ['Be open to new connections', 'Express your feelings honestly', 'Practice self-love first'],
        luckyElement: 'Rose Quartz',
        color: '#C2185B',
      },
      {
        id: 'career',
        title: 'Career & Finance',
        icon: '💼',
        description: 'Professional opportunities and financial insights',
        detailedReading: 'Mars is energizing your career sector, bringing dynamic opportunities for advancement. Your leadership qualities are being recognized. Take calculated risks and trust your professional instincts.',
        tips: ['Network with colleagues', 'Present new ideas confidently', 'Focus on long-term goals'],
        luckyElement: 'Green Aventurine',
        color: '#2E7D32',
      },
      {
        id: 'health',
        title: 'Health & Wellness',
        icon: '🏥',
        description: 'Physical and mental well-being focus',
        detailedReading: 'The Moon\'s influence encourages you to prioritize your wellness routine. Listen to your body\'s signals and make adjustments to support your energy levels. Mental clarity comes through physical care.',
        tips: ['Stay hydrated throughout the day', 'Take breaks from screens', 'Practice mindful breathing'],
        luckyElement: 'Clear Quartz',
        color: '#1E3A8A',
      },
      {
        id: 'growth',
        title: 'Personal Growth',
        icon: '🧠',
        description: 'Self-improvement and spiritual development',
        detailedReading: 'Jupiter\'s expansive energy is opening new pathways for personal development. This is an excellent time for learning, exploring new philosophies, and expanding your consciousness.',
        tips: ['Read inspiring books', 'Try meditation or journaling', 'Set meaningful goals'],
        luckyElement: 'Amethyst',
        color: '#6B46C1',
      },
    ];

    return zodiacLifeAreasMap[zodiacSign] || zodiacLifeAreasMap['Aries'];
  };

  const lifeAreas: LifeArea[] = getZodiacLifeAreas(userZodiacSign);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: iOS17Theme.animationDurations.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  const openAreaModal = (area: LifeArea) => {
    setSelectedArea(area);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        ...iOS17Theme.springConfigs.gentle,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: iOS17Theme.animationDurations.normal,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeAreaModal = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: height,
        useNativeDriver: true,
        ...iOS17Theme.springConfigs.gentle,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: iOS17Theme.animationDurations.normal,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedArea(null);
    });
  };

  const handleAreaPress = (area: LifeArea) => {
    openAreaModal(area);
    onCategoryPress?.(area.id);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim },
      ]}
    >
      <Text style={styles.sectionTitle}>Life Areas</Text>
      
      <View style={styles.sectionsContainer}>
        {lifeAreas.map((area, index) => (
          <TouchableOpacity
            key={area.id}
            style={styles.sectionItem}
            onPress={() => handleAreaPress(area)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionContent}>
              <View style={styles.sectionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: area.color + '20' }]}>
                  <Text style={area.id === 'love' ? styles.redHeartIcon : styles.sectionIcon}>{area.icon}</Text>
                </View>
                <View style={styles.sectionText}>
                  <Text style={styles.sectionItemTitle}>{area.title}</Text>
                  <Text style={styles.sectionDescription}>{area.description}</Text>
                </View>
              </View>
              <Text style={styles.chevron}>{iOS17Theme.symbols.chevronRight}</Text>
            </View>
            {index < lifeAreas.length - 1 && <View style={styles.separator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal */}
      <Modal
        visible={selectedArea !== null}
        transparent={true}
        animationType="none"
        onRequestClose={closeAreaModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={closeAreaModal}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {selectedArea && (
                  <LinearGradient
                    colors={[selectedArea.color, selectedArea.color]}
                    style={styles.modalBlurView}
                  >
                    <View style={styles.modalHeader}>
                      <View style={styles.modalTitleContainer}>
                        <View style={[styles.modalIconContainer, { backgroundColor: selectedArea.color + '20' }]}>
                          <Text style={selectedArea.id === 'love' ? styles.modalRedHeartIcon : [styles.modalIcon, { color: selectedArea.color }]}>{selectedArea.icon}</Text>
                        </View>
                        <Text style={styles.modalTitle}>{selectedArea.title}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeAreaModal}
                      >
                        <Text style={styles.closeButtonText}>{iOS17Theme.symbols.xmark}</Text>
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                      <View style={styles.readingSection}>
                        <Text style={styles.readingTitle}>Today's Insight</Text>
                        <Text style={styles.readingText}>{selectedArea.detailedReading}</Text>
                      </View>

                      <View style={styles.tipsSection}>
                        <Text style={styles.tipsTitle}>Cosmic Tips</Text>
                        {selectedArea.tips.map((tip, index) => (
                          <View key={index} style={styles.tipItem}>
                            <Text style={styles.tipBullet}>{iOS17Theme.symbols.sparkles}</Text>
                            <Text style={styles.tipText}>{tip}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.luckyElementSection}>
                        <Text style={styles.luckyElementTitle}>Lucky Element</Text>
                        <View style={styles.luckyElementCard}>
                          <Text style={styles.luckyElementText}>{selectedArea.luckyElement}</Text>
                          <Text style={styles.luckyElementDescription}>
                            Carry or meditate with this crystal today for enhanced energy
                          </Text>
                        </View>
                      </View>
                    </ScrollView>
                  </LinearGradient>
                )}
              </Animated.View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: iOS17Theme.spacing.md,
    marginBottom: iOS17Theme.spacing.sm,
  },
  sectionTitle: {
    ...iOS17Theme.text.sectionTitle,
  },
  sectionsContainer: {
    backgroundColor: iOS17Theme.colors.systemBackground,
    borderRadius: iOS17Theme.cornerRadius.large,
    overflow: 'hidden',
    ...iOS17Theme.shadows.medium,
  },
  sectionItem: {
    backgroundColor: iOS17Theme.colors.secondarySystemFill,
    borderWidth: 1,
    borderColor: iOS17Theme.colors.separator,
    marginHorizontal: iOS17Theme.spacing.xs,
    marginVertical: iOS17Theme.spacing.xs,
    borderRadius: iOS17Theme.cornerRadius.medium,
    ...iOS17Theme.shadows.small,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.lg,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: iOS17Theme.spacing.md,
    backgroundColor: 'rgba(138, 79, 255, 0.2)',
    borderWidth: 1,
    borderColor: iOS17Theme.colors.cosmicPurple,
  },
  sectionIcon: {
    fontSize: 18,
  },
  redHeartIcon: {
    fontSize: 18,
    color: '#FF6B9D',
  },
  sectionText: {
    flex: 1,
  },
  sectionItemTitle: {
    ...iOS17Theme.text.cardTitle,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  sectionDescription: {
    ...iOS17Theme.text.secondaryText,
  },
  chevron: {
    fontSize: 16,
    color: iOS17Theme.colors.tertiaryLabel,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: iOS17Theme.colors.separator,
    marginLeft: 64,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: height * 0.75,
    borderTopLeftRadius: iOS17Theme.cornerRadius.extraExtraLarge,
    borderTopRightRadius: iOS17Theme.cornerRadius.extraExtraLarge,
    overflow: 'hidden',
  },
  modalBlurView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: iOS17Theme.colors.separator,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: iOS17Theme.spacing.md,
  },
  modalIcon: {
    fontSize: 18,
  },
  modalRedHeartIcon: {
    fontSize: 18,
    color: '#FF6B9D',
  },
  modalTitle: {
    ...iOS17Theme.typography.title3,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: iOS17Theme.spacing.lg,
  },
  readingSection: {
    paddingVertical: iOS17Theme.spacing.lg,
  },
  readingTitle: {
    ...iOS17Theme.typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  readingText: {
    ...iOS17Theme.typography.body,
    color: '#FFFFFF',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tipsSection: {
    paddingVertical: iOS17Theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: iOS17Theme.colors.separator,
  },
  tipsTitle: {
    ...iOS17Theme.typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: iOS17Theme.spacing.sm,
  },
  tipBullet: {
    fontSize: 14,
    marginRight: iOS17Theme.spacing.sm,
    marginTop: 2,
  },
  tipText: {
    ...iOS17Theme.typography.body,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  luckyElementSection: {
    paddingVertical: iOS17Theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: iOS17Theme.colors.separator,
  },
  luckyElementTitle: {
    ...iOS17Theme.typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  luckyElementCard: {
    backgroundColor: iOS17Theme.colors.systemFill,
    padding: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.medium,
    alignItems: 'center',
  },
  luckyElementText: {
    ...iOS17Theme.typography.title3,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  luckyElementDescription: {
    ...iOS17Theme.typography.footnote,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default IOS17LifeAreas;
