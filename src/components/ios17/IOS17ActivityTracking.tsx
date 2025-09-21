import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { iOS17Theme } from '../../theme/ios17Theme';

const { width, height } = Dimensions.get('window');

interface IOS17ActivityTrackingProps {
  currentStreak: number;
  hasReadToday: boolean;
  achievements: string[];
  onReadHoroscope: () => void;
  onStreakUpdate?: (newStreak: number) => void;
}

const IOS17ActivityTracking: React.FC<IOS17ActivityTrackingProps> = ({
  currentStreak,
  hasReadToday,
  achievements,
  onReadHoroscope,
  onStreakUpdate,
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [newStreak, setNewStreak] = useState(currentStreak);
  const [showHistory, setShowHistory] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: iOS17Theme.animationDurations.normal,
        useNativeDriver: true,
      }),
      Animated.timing(ringAnim, {
        toValue: currentStreak / 100, // Normalize to 0-1 for animation
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentStreak]);

  useEffect(() => {
    if (!hasReadToday) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
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
      
      onReadHoroscope();
      
      const updatedStreak = currentStreak + 1;
      setNewStreak(updatedStreak);
      
      setShowCelebration(true);
      
      Animated.parallel([
        Animated.spring(celebrationAnim, {
          toValue: 1,
          useNativeDriver: true,
          ...iOS17Theme.springConfigs.gentle,
        }),
        Animated.loop(
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ),
      ]).start();
      
      setTimeout(() => {
        closeCelebration();
      }, 3000);
    }
  };

  const closeCelebration = () => {
    Animated.timing(celebrationAnim, {
      toValue: 0,
      duration: iOS17Theme.animationDurations.normal,
      useNativeDriver: true,
    }).start(() => {
      setShowCelebration(false);
      sparkleAnim.setValue(0);
    });
  };

  const renderActivityRing = (progress: number, color: string, size: number = 120) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        {/* Background Ring */}
        <View
          style={[
            styles.ringBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: iOS17Theme.colors.systemFill,
            },
          ]}
        />
        
        {/* Progress Ring */}
        <View
          style={[
            styles.ringProgress,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
              borderWidth: 4,
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
        
        {/* Center Content */}
        <View style={styles.ringCenter}>
          <Text style={[styles.ringNumber, { color }]}>{progress}</Text>
          <Text style={styles.ringLabel}>Days</Text>
        </View>
      </View>
    );
  };

  const getStreakColor = () => {
    if (currentStreak === 0) return iOS17Theme.colors.systemBlue;
    if (currentStreak < 7) return iOS17Theme.colors.systemGreen;
    if (currentStreak < 30) return iOS17Theme.colors.systemOrange;
    return iOS17Theme.colors.cosmicGold;
  };

  const getStreakMessage = () => {
    if (currentStreak === 0) return "Start your cosmic journey today!";
    if (currentStreak === 1) return "Great start! Keep the momentum going";
    if (currentStreak < 7) return `${currentStreak} days strong! You're building a habit`;
    if (currentStreak < 30) return `Amazing! ${currentStreak} day streak!`;
    return `Incredible dedication! ${currentStreak} days of cosmic wisdom`;
  };

  const getMilestoneAchievements = () => {
    const milestones = [];
    if (currentStreak >= 3) milestones.push({ icon: '🌟', title: 'Stellar Start', color: iOS17Theme.colors.systemBlue });
    if (currentStreak >= 7) milestones.push({ icon: '🔥', title: 'Week Warrior', color: iOS17Theme.colors.systemOrange });
    if (currentStreak >= 30) milestones.push({ icon: '👑', title: 'Cosmic Master', color: iOS17Theme.colors.cosmicGold });
    if (currentStreak >= 100) milestones.push({ icon: '💎', title: 'Diamond Star', color: iOS17Theme.colors.systemPurple });
    return milestones;
  };

  const renderSparkles = () => {
    return [...Array(8)].map((_, index) => {
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
          <Text style={styles.sparkleText}>{iOS17Theme.symbols.sparkles}</Text>
        </Animated.View>
      );
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim },
      ]}
    >
      <Text style={styles.sectionTitle}>Your Cosmic Journey</Text>
      
      <View style={styles.trackingCard}>
        <BlurView
          intensity={20}
          tint="systemMaterial"
          style={styles.cardBlurView}
        >
          {/* Activity Ring Section */}
          <View style={styles.ringSection}>
            <View style={styles.ringContainer}>
              {renderActivityRing(currentStreak, getStreakColor())}
            </View>
            
            <View style={styles.streakInfo}>
              <Text style={styles.streakMessage}>{getStreakMessage()}</Text>
              <Text style={styles.streakSubtext}>
                {hasReadToday ? 'Reading complete for today!' : 'Read today\'s horoscope to continue your streak'}
              </Text>
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
                  <Text style={styles.readButtonIcon}>📖</Text>
                  <Text style={styles.readButtonText}>Read Today's Horoscope</Text>
                  <Text style={styles.readButtonSubtext}>Continue your streak!</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View style={styles.completedSection}>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedIcon}>{iOS17Theme.symbols.checkmark}</Text>
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsList}
            >
              {getMilestoneAchievements().map((achievement, index) => (
                <View key={index} style={[styles.achievementBadge, { borderColor: achievement.color }]}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                </View>
              ))}
              {getMilestoneAchievements().length === 0 && (
                <Text style={styles.noAchievements}>
                  Start reading to unlock achievements!
                </Text>
              )}
            </ScrollView>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowHistory(true)}
            >
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {/* Share functionality */}}
            >
              <Text style={styles.quickActionIcon}>{iOS17Theme.symbols.share}</Text>
              <Text style={styles.quickActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
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
            <BlurView
              intensity={20}
              tint="systemMaterial"
              style={styles.celebrationBlurView}
            >
              <Text style={styles.celebrationIcon}>🎉</Text>
              <Text style={styles.celebrationTitle}>Streak Updated!</Text>
              <Text style={styles.celebrationStreak}>{newStreak} Days</Text>
              <Text style={styles.celebrationMessage}>
                You're building an amazing cosmic habit!
              </Text>
              
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
            </BlurView>
          </Animated.View>
        </View>
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
  trackingCard: {
    borderRadius: iOS17Theme.cornerRadius.large,
    overflow: 'hidden',
    ...iOS17Theme.shadows.large,
  },
  cardBlurView: {
    padding: iOS17Theme.spacing.lg,
  },
  ringSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.lg,
  },
  ringContainer: {
    marginRight: iOS17Theme.spacing.lg,
  },
  ringBackground: {
    position: 'absolute',
    borderWidth: 4,
  },
  ringProgress: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  ringNumber: {
    ...iOS17Theme.typography.largeTitle,
    fontWeight: '700',
  },
  ringLabel: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.secondaryLabel,
  },
  streakInfo: {
    flex: 1,
  },
  streakMessage: {
    ...iOS17Theme.typography.headline,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.xs,
  },
  streakSubtext: {
    ...iOS17Theme.typography.footnote,
    color: iOS17Theme.colors.secondaryLabel,
  },
  actionSection: {
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.lg,
  },
  readButton: {
    backgroundColor: iOS17Theme.colors.cosmicPurple,
    paddingVertical: iOS17Theme.spacing.md,
    paddingHorizontal: iOS17Theme.spacing.lg,
    borderRadius: iOS17Theme.cornerRadius.medium,
    alignItems: 'center',
    minWidth: width * 0.7,
    ...iOS17Theme.shadows.medium,
  },
  readButtonIcon: {
    fontSize: 24,
    marginBottom: iOS17Theme.spacing.xs,
  },
  readButtonText: {
    ...iOS17Theme.typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  readButtonSubtext: {
    ...iOS17Theme.typography.footnote,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  completedSection: {
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: iOS17Theme.colors.systemGreen + '20',
    paddingHorizontal: iOS17Theme.spacing.md,
    paddingVertical: iOS17Theme.spacing.sm,
    borderRadius: iOS17Theme.cornerRadius.medium,
    marginBottom: iOS17Theme.spacing.xs,
  },
  completedIcon: {
    fontSize: 16,
    color: iOS17Theme.colors.systemGreen,
    marginRight: iOS17Theme.spacing.xs,
  },
  completedText: {
    ...iOS17Theme.typography.callout,
    color: iOS17Theme.colors.systemGreen,
    fontWeight: '600',
  },
  completedMessage: {
    ...iOS17Theme.typography.footnote,
    color: iOS17Theme.colors.secondaryLabel,
    textAlign: 'center',
  },
  achievementsSection: {
    marginBottom: iOS17Theme.spacing.lg,
  },
  achievementsTitle: {
    ...iOS17Theme.typography.headline,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.sm,
  },
  achievementsList: {
    paddingRight: iOS17Theme.spacing.md,
  },
  achievementBadge: {
    backgroundColor: iOS17Theme.colors.systemBackground,
    paddingHorizontal: iOS17Theme.spacing.md,
    paddingVertical: iOS17Theme.spacing.sm,
    borderRadius: iOS17Theme.cornerRadius.medium,
    alignItems: 'center',
    marginRight: iOS17Theme.spacing.sm,
    borderWidth: 1,
    ...iOS17Theme.shadows.small,
  },
  achievementIcon: {
    fontSize: 20,
    marginBottom: iOS17Theme.spacing.xs,
  },
  achievementTitle: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
    textAlign: 'center',
  },
  noAchievements: {
    ...iOS17Theme.typography.footnote,
    color: iOS17Theme.colors.tertiaryLabel,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: iOS17Theme.spacing.sm,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: iOS17Theme.spacing.xs,
  },
  quickActionText: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.secondaryLabel,
  },
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    borderRadius: iOS17Theme.cornerRadius.extraExtraLarge,
    overflow: 'hidden',
    margin: iOS17Theme.spacing.lg,
    minWidth: width * 0.8,
  },
  celebrationBlurView: {
    padding: iOS17Theme.spacing.xl,
    alignItems: 'center',
  },
  celebrationIcon: {
    fontSize: 48,
    marginBottom: iOS17Theme.spacing.md,
  },
  celebrationTitle: {
    ...iOS17Theme.typography.title2,
    color: iOS17Theme.colors.label,
    fontWeight: '700',
    marginBottom: iOS17Theme.spacing.xs,
    textAlign: 'center',
  },
  celebrationStreak: {
    ...iOS17Theme.typography.largeTitle,
    color: iOS17Theme.colors.cosmicPurple,
    fontWeight: '700',
    marginBottom: iOS17Theme.spacing.xs,
  },
  celebrationMessage: {
    ...iOS17Theme.typography.body,
    color: iOS17Theme.colors.secondaryLabel,
    textAlign: 'center',
    marginBottom: iOS17Theme.spacing.lg,
  },
  newAchievement: {
    backgroundColor: iOS17Theme.colors.systemFill,
    padding: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.medium,
    marginBottom: iOS17Theme.spacing.lg,
    alignItems: 'center',
  },
  newAchievementTitle: {
    ...iOS17Theme.typography.callout,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
    marginBottom: iOS17Theme.spacing.xs,
  },
  newAchievementName: {
    ...iOS17Theme.typography.footnote,
    color: iOS17Theme.colors.secondaryLabel,
  },
  celebrationCloseButton: {
    backgroundColor: iOS17Theme.colors.cosmicPurple,
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.sm,
    borderRadius: iOS17Theme.cornerRadius.medium,
  },
  celebrationCloseText: {
    ...iOS17Theme.typography.callout,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default IOS17ActivityTracking;
