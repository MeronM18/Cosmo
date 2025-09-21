import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface CosmicJourneyProps {
  hasReadToday: boolean;
  currentStreak: number;
  achievements: string[];
  onReadHoroscope: () => void;
  onStreakUpdate?: (newStreak: number) => void;
}

const CosmicJourney: React.FC<CosmicJourneyProps> = ({ 
  hasReadToday, 
  currentStreak, 
  achievements, 
  onReadHoroscope,
  onStreakUpdate 
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [newStreak, setNewStreak] = useState(currentStreak);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hasReadToday) {
      // Pulse animation for read button
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [hasReadToday]);

  const handleReadHoroscope = () => {
    if (!hasReadToday) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Call the parent's read horoscope handler (which uses StreakManager)
      onReadHoroscope();
      
      // Show celebration with updated streak
      const updatedStreak = currentStreak + 1;
      setNewStreak(updatedStreak);
      
      setShowCelebration(true);
      
      // Celebration animations
      Animated.parallel([
        Animated.spring(celebrationAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.loop(
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ),
      ]).start();
      
      // Auto-hide celebration after 3 seconds
      setTimeout(() => {
        closeCelebration();
      }, 3000);
    }
  };

  const closeCelebration = () => {
    Animated.timing(celebrationAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowCelebration(false);
      sparkleAnim.setValue(0);
    });
  };

  const getStreakMessage = () => {
    if (currentStreak === 0) return "Start your cosmic journey today!";
    if (currentStreak === 1) return "Great start! Keep the momentum going";
    if (currentStreak < 7) return `${currentStreak} days strong! You're building a habit`;
    if (currentStreak < 30) return `Amazing! ${currentStreak} day streak!`;
    return `Incredible dedication! ${currentStreak} days of cosmic wisdom`;
  };

  const getStreakColor = () => {
    if (currentStreak === 0) return '#8A4FFF';
    if (currentStreak < 7) return '#4CAF50';
    if (currentStreak < 30) return '#FF9800';
    return '#FFD700';
  };

  const getMilestoneAchievements = () => {
    const milestones = [];
    if (currentStreak >= 3) milestones.push({ icon: '🌟', title: 'Stellar Start' });
    if (currentStreak >= 7) milestones.push({ icon: '🔥', title: 'Week Warrior' });
    if (currentStreak >= 30) milestones.push({ icon: '👑', title: 'Cosmic Master' });
    if (currentStreak >= 100) milestones.push({ icon: '💎', title: 'Diamond Star' });
    return milestones;
  };

  const renderSparkles = () => {
    return [...Array(8)].map((_, index) => {
      const delay = index * 200;
      const rotation = sparkleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });
      
      const opacity = sparkleAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 0],
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.sparkle,
            {
              left: Math.random() * (width - 40),
              top: Math.random() * 200 + 100,
              opacity,
              transform: [{ rotate: rotation }],
            }
          ]}
        >
          <Text style={styles.sparkleText}>✨</Text>
        </Animated.View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Cosmic Journey</Text>
      
      {/* Main Journey Card */}
      <View style={styles.journeyCard}>
        <LinearGradient
          colors={[getStreakColor() + '20', getStreakColor() + '40']}
          style={styles.journeyGradient}
        >
          {/* Streak Display */}
          <View style={styles.streakHeader}>
            <View style={styles.streakBadge}>
              <Text style={styles.fireIcon}>🔥</Text>
              <Text style={[styles.streakNumber, { color: getStreakColor() }]}>
                {currentStreak}
              </Text>
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakLabel}>Day Streak</Text>
              <Text style={styles.streakMessage}>{getStreakMessage()}</Text>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionSection}>
            {!hasReadToday ? (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={styles.readButton}
                  onPress={handleReadHoroscope}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#8A4FFF', '#6366F1']}
                    style={styles.readButtonGradient}
                  >
                    <Text style={styles.readButtonIcon}>📖</Text>
                    <Text style={styles.readButtonText}>Read Today's Horoscope</Text>
                    <Text style={styles.readButtonSubtext}>Continue your streak!</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View style={styles.completedSection}>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedIcon}>✅</Text>
                  <Text style={styles.completedText}>Reading Complete!</Text>
                </View>
                <Text style={styles.completedMessage}>
                  You've maintained your {currentStreak} day streak!
                </Text>
              </View>
            )}
          </View>

          {/* Achievement Badges */}
          <View style={styles.achievementsSection}>
            <Text style={styles.achievementsTitle}>Achievements</Text>
            <View style={styles.achievementsList}>
              {getMilestoneAchievements().map((achievement, index) => (
                <View key={index} style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                </View>
              ))}
              {getMilestoneAchievements().length === 0 && (
                <Text style={styles.noAchievements}>
                  Start reading to unlock achievements!
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Celebration Modal */}
      <Modal
        visible={showCelebration}
        transparent={true}
        animationType="none"
      >
        <View style={styles.celebrationOverlay}>
          {renderSparkles()}
          
          <Animated.View
            style={[
              styles.celebrationModal,
              {
                opacity: celebrationAnim,
                transform: [
                  {
                    scale: celebrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    })
                  }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#8A4FFF']}
              style={styles.celebrationGradient}
            >
              <Text style={styles.celebrationIcon}>🎉</Text>
              <Text style={styles.celebrationTitle}>Streak Updated!</Text>
              <Text style={styles.celebrationStreak}>{newStreak} Days</Text>
              <Text style={styles.celebrationMessage}>
                You're building an amazing cosmic habit!
              </Text>
              
              {/* New Achievement Alert */}
              {(newStreak === 3 || newStreak === 7 || newStreak === 30 || newStreak === 100) && (
                <View style={styles.newAchievement}>
                  <Text style={styles.newAchievementTitle}>🏆 New Achievement!</Text>
                  <Text style={styles.newAchievementName}>
                    {newStreak === 3 && 'Stellar Start'}
                    {newStreak === 7 && 'Week Warrior'}
                    {newStreak === 30 && 'Cosmic Master'}
                    {newStreak === 100 && 'Diamond Star'}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.celebrationCloseButton}
                onPress={closeCelebration}
              >
                <Text style={styles.celebrationCloseText}>Continue</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
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
  journeyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  journeyGradient: {
    padding: 24,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 16,
  },
  fireIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  streakInfo: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  streakMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  actionSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  readButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#8A4FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  readButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: width * 0.7,
  },
  readButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  readButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  readButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  completedSection: {
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  completedIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  completedText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '700',
  },
  completedMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  achievementsSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 20,
  },
  achievementsTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  achievementBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  achievementIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  noAchievements: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 20,
  },
  celebrationModal: {
    borderRadius: 24,
    overflow: 'hidden',
    margin: 20,
    minWidth: width * 0.8,
  },
  celebrationGradient: {
    padding: 32,
    alignItems: 'center',
  },
  celebrationIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  celebrationStreak: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  celebrationMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  newAchievement: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  newAchievementTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  newAchievementName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  celebrationCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  celebrationCloseText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CosmicJourney;
