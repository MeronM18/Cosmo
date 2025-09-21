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
}

const IOS17LifeAreas: React.FC<IOS17LifeAreasProps> = ({ onCategoryPress }) => {
  const [selectedArea, setSelectedArea] = useState<LifeArea | null>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const lifeAreas: LifeArea[] = [
    {
      id: 'love',
      title: 'Love & Relationships',
      icon: iOS17Theme.symbols.heart,
      description: 'Your emotional connections and romantic prospects',
      detailedReading: 'Venus is sending positive energy your way, creating opportunities for deep emotional connections. Whether you\'re single or partnered, this is a time to open your heart and express your feelings authentically. Trust your romantic instincts.',
      tips: ['Be open to new connections', 'Express your feelings honestly', 'Practice self-love first'],
      luckyElement: 'Rose Quartz',
      color: iOS17Theme.colors.systemPink,
    },
    {
      id: 'career',
      title: 'Career & Finance',
      icon: '💼',
      description: 'Professional opportunities and financial insights',
      detailedReading: 'Mars is energizing your career sector, bringing dynamic opportunities for advancement. Your leadership qualities are being recognized. Take calculated risks and trust your professional instincts.',
      tips: ['Network with colleagues', 'Present new ideas confidently', 'Focus on long-term goals'],
      luckyElement: 'Green Aventurine',
      color: iOS17Theme.colors.systemGreen,
    },
    {
      id: 'health',
      title: 'Health & Wellness',
      icon: '🏥',
      description: 'Physical and mental well-being focus',
      detailedReading: 'The Moon\'s influence encourages you to prioritize your wellness routine. Listen to your body\'s signals and make adjustments to support your energy levels. Mental clarity comes through physical care.',
      tips: ['Stay hydrated throughout the day', 'Take breaks from screens', 'Practice mindful breathing'],
      luckyElement: 'Clear Quartz',
      color: iOS17Theme.colors.systemBlue,
    },
    {
      id: 'growth',
      title: 'Personal Growth',
      icon: '🧠',
      description: 'Self-improvement and spiritual development',
      detailedReading: 'Jupiter\'s expansive energy is opening new pathways for personal development. This is an excellent time for learning, exploring new philosophies, and expanding your consciousness.',
      tips: ['Read inspiring books', 'Try meditation or journaling', 'Set meaningful goals'],
      luckyElement: 'Amethyst',
      color: iOS17Theme.colors.systemPurple,
    },
  ];

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
                  <Text style={styles.sectionIcon}>{area.icon}</Text>
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
                  <BlurView
                    intensity={20}
                    tint="systemMaterial"
                    style={styles.modalBlurView}
                  >
                    <View style={styles.modalHeader}>
                      <View style={styles.modalTitleContainer}>
                        <View style={[styles.modalIconContainer, { backgroundColor: selectedArea.color + '20' }]}>
                          <Text style={styles.modalIcon}>{selectedArea.icon}</Text>
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
                  </BlurView>
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
    marginBottom: iOS17Theme.spacing.lg,
  },
  sectionTitle: {
    ...iOS17Theme.typography.title2,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.md,
  },
  sectionsContainer: {
    backgroundColor: iOS17Theme.colors.systemBackground,
    borderRadius: iOS17Theme.cornerRadius.large,
    overflow: 'hidden',
    ...iOS17Theme.shadows.medium,
  },
  sectionItem: {
    backgroundColor: iOS17Theme.colors.systemBackground,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: iOS17Theme.spacing.md,
    paddingVertical: iOS17Theme.spacing.md,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: iOS17Theme.spacing.md,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionText: {
    flex: 1,
  },
  sectionItemTitle: {
    ...iOS17Theme.typography.callout,
    color: iOS17Theme.colors.label,
    fontWeight: '500',
    marginBottom: 2,
  },
  sectionDescription: {
    ...iOS17Theme.typography.footnote,
    color: iOS17Theme.colors.secondaryLabel,
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
  modalTitle: {
    ...iOS17Theme.typography.title3,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: iOS17Theme.colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
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
    color: iOS17Theme.colors.label,
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.sm,
  },
  readingText: {
    ...iOS17Theme.typography.body,
    color: iOS17Theme.colors.label,
    lineHeight: 24,
  },
  tipsSection: {
    paddingVertical: iOS17Theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: iOS17Theme.colors.separator,
  },
  tipsTitle: {
    ...iOS17Theme.typography.headline,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.sm,
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
    color: iOS17Theme.colors.label,
    flex: 1,
    lineHeight: 22,
  },
  luckyElementSection: {
    paddingVertical: iOS17Theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: iOS17Theme.colors.separator,
  },
  luckyElementTitle: {
    ...iOS17Theme.typography.headline,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.sm,
  },
  luckyElementCard: {
    backgroundColor: iOS17Theme.colors.systemFill,
    padding: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.medium,
    alignItems: 'center',
  },
  luckyElementText: {
    ...iOS17Theme.typography.title3,
    color: iOS17Theme.colors.cosmicPurple,
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.xs,
  },
  luckyElementDescription: {
    ...iOS17Theme.typography.footnote,
    color: iOS17Theme.colors.secondaryLabel,
    textAlign: 'center',
  },
});

export default IOS17LifeAreas;
