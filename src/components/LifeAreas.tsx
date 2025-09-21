import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface LifeCategory {
  id: string;
  title: string;
  icon: string;
  gradientColors: [string, string];
  description: string;
  detailedReading: string;
  tips: string[];
  luckyElement: string;
}

interface LifeAreasProps {
  onCategoryPress?: (categoryId: string) => void;
}

const LifeAreas: React.FC<LifeAreasProps> = ({ onCategoryPress }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  const [selectedCategory, setSelectedCategory] = useState<LifeCategory | null>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const lifeCategories: LifeCategory[] = [
    {
      id: 'love',
      title: 'Love & Romance',
      icon: '💕',
      gradientColors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)'],
      description: 'Your emotional connections and romantic prospects are highlighted today.',
      detailedReading: 'Venus is sending positive energy your way, creating opportunities for deep emotional connections. Whether you\'re single or partnered, this is a time to open your heart and express your feelings authentically. Trust your romantic instincts.',
      tips: ['Be open to new connections', 'Express your feelings honestly', 'Practice self-love first'],
      luckyElement: 'Rose Quartz'
    },
    {
      id: 'career',
      title: 'Career & Success',
      icon: '🚀',
      gradientColors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)'],
      description: 'Professional opportunities and financial insights await your attention.',
      detailedReading: 'Mars is energizing your career sector, bringing dynamic opportunities for advancement. Your leadership qualities are being recognized. Take calculated risks and trust your professional instincts.',
      tips: ['Network with colleagues', 'Present new ideas confidently', 'Focus on long-term goals'],
      luckyElement: 'Green Aventurine'
    },
    {
      id: 'health',
      title: 'Health & Vitality',
      icon: '🌟',
      gradientColors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)'],
      description: 'Focus on your physical and mental well-being for optimal energy.',
      detailedReading: 'The Moon\'s influence encourages you to prioritize your wellness routine. Listen to your body\'s signals and make adjustments to support your energy levels. Mental clarity comes through physical care.',
      tips: ['Stay hydrated throughout the day', 'Take breaks from screens', 'Practice mindful breathing'],
      luckyElement: 'Clear Quartz'
    },
    {
      id: 'growth',
      title: 'Personal Growth',
      icon: '🌱',
      gradientColors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)'],
      description: 'Self-improvement and spiritual development opportunities arise.',
      detailedReading: 'Jupiter\'s expansive energy is opening new pathways for personal development. This is an excellent time for learning, exploring new philosophies, and expanding your consciousness.',
      tips: ['Read inspiring books', 'Try meditation or journaling', 'Set meaningful goals'],
      luckyElement: 'Amethyst'
    },
    {
      id: 'social',
      title: 'Social & Friendships',
      icon: '👥',
      gradientColors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)'],
      description: 'Your social connections and friendships bring joy and support.',
      detailedReading: 'Mercury enhances your communication skills, making this an ideal time to strengthen friendships and build new social connections. Your charisma is particularly magnetic right now.',
      tips: ['Reach out to old friends', 'Join community activities', 'Be a good listener'],
      luckyElement: 'Citrine'
    },
    {
      id: 'spirituality',
      title: 'Spiritual Journey',
      icon: '🕉️',
      gradientColors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)'],
      description: 'Connect with your higher self and explore deeper meanings.',
      detailedReading: 'Neptune\'s mystical influence is heightening your spiritual awareness. Pay attention to dreams, synchronicities, and intuitive insights. Your connection to the divine is strengthening.',
      tips: ['Practice daily meditation', 'Pay attention to signs', 'Trust your intuition'],
      luckyElement: 'Moonstone'
    }
  ];

  const getModalGradientColors = (categoryId: string): [string, string, string] => {
    const colorMap: { [key: string]: [string, string, string] } = {
      'love': ['#FF6B9D', '#FF1744', '#1A0B3A'],
      'career': ['#4CAF50', '#2E7D32', '#1A0B3A'],
      'health': ['#2196F3', '#1565C0', '#1A0B3A'],
      'growth': ['#9C27B0', '#6A1B9A', '#1A0B3A'],
      'social': ['#FF9800', '#F57C00', '#1A0B3A'],
      'spirituality': ['#673AB7', '#512DA8', '#1A0B3A']
    };
    return colorMap[categoryId] || ['#8A4FFF', '#6B46C1', '#1A0B3A'];
  };

  const openCategoryModal = (category: LifeCategory) => {
    setSelectedCategory(category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 15,
        overshootClamping: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeCategoryModal = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: height,
        useNativeDriver: true,
        tension: 65,
        friction: 15,
        overshootClamping: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Remove overlay after animation completes
      setSelectedCategory(null);
    });
  };

  const handleCategoryPress = (category: LifeCategory) => {
    openCategoryModal(category);
    onCategoryPress?.(category.id);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>Life Areas</Text>
      
      <View style={styles.categoriesGrid}>
        {lifeCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={category.gradientColors}
              style={styles.categoryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.categoryContent}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryTitle, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>{category.title}</Text>
                <View style={styles.categoryIndicator}>
                  <Text style={styles.indicatorText}>Tap to explore</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Detail Modal */}
      <Modal
        visible={selectedCategory !== null}
        transparent={true}
        animationType="none"
        onRequestClose={closeCategoryModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity 
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={closeCategoryModal}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                {selectedCategory && (
                  <LinearGradient
                    colors={getModalGradientColors(selectedCategory.id)}
                    style={styles.modalGradient}
                  >
                    <View style={styles.modalHeader}>
                      <View style={styles.modalTitleContainer}>
                        <Text style={styles.modalIcon}>{selectedCategory.icon}</Text>
                        <Text style={[styles.modalTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>{selectedCategory.title}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeCategoryModal}
                      >
                        <Text style={styles.closeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                      <View style={styles.readingSection}>
                        <Text style={[styles.readingTitle, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>Today's Insight</Text>
                        <Text style={styles.readingText}>{selectedCategory.detailedReading}</Text>
                      </View>

                      <View style={styles.tipsSection}>
                        <Text style={[styles.tipsTitle, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>Cosmic Tips</Text>
                        {selectedCategory.tips.map((tip, index) => (
                          <View key={index} style={styles.tipItem}>
                            <Text style={styles.tipBullet}>✨</Text>
                            <Text style={styles.tipText}>{tip}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.luckyElementSection}>
                        <Text style={[styles.luckyElementTitle, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>Lucky Element</Text>
                        <View style={styles.luckyElementCard}>
                          <Text style={styles.luckyElementText}>{selectedCategory.luckyElement}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  categoryCard: {
    width: (width - 60) / 2,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  categoryContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: height * 0.75,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 24,
  },
  readingSection: {
    marginBottom: 24,
  },
  readingTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },
  readingText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    opacity: 0.9,
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 20,
    opacity: 0.9,
  },
  luckyElementSection: {
    marginBottom: 24,
  },
  luckyElementTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },
  luckyElementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  luckyElementText: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: '700',
    marginBottom: 8,
  },
  luckyElementDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default LifeAreas;