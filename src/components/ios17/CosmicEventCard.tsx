import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { CosmicTheme } from '../../theme/cosmicTheme';
import { CelestialEvent } from '../../services/celestialEventsService';

const { width } = Dimensions.get('window');

interface CosmicEventCardProps {
  event: CelestialEvent;
  index: number;
  userData: {
    zodiacSign: string;
  };
  onPress: (event: CelestialEvent) => void;
  onBookmark: () => void;
  isBookmarked: boolean;
  getDaysUntilEvent: (date: Date) => number;
  getEventTypeColor: (type: string) => any;
  getImpactLevelColor: (level: string) => any;
}

const CosmicEventCard: React.FC<CosmicEventCardProps> = ({
  event,
  index,
  userData,
  onPress,
  onBookmark,
  isBookmarked,
  getDaysUntilEvent,
  getEventTypeColor,
  getImpactLevelColor,
}) => {
  // Animation Values
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const bookmarkScale = useRef(new Animated.Value(1)).current;
  const impactPulse = useRef(new Animated.Value(1)).current;

  // Calculate if event affects user
  const isAffectingUser = event.affectedSigns.includes(userData.zodiacSign);
  const daysUntil = getDaysUntilEvent(event.startDate);
  const eventColors = getEventTypeColor(event.type);
  const impactColors = getImpactLevelColor(event.impactLevel);

  // Entry Animation
  useEffect(() => {
    const delay = index * 100;
    
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          ...CosmicTheme.springs.gentle,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: CosmicTheme.animations.normal,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous glow animation for high impact events
    if (event.impactLevel === 'high') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }

    // Impact pulse animation
    if (event.impactLevel === 'high') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(impactPulse, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(impactPulse, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  // Handle Press
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(event);
  };

  // Handle Bookmark
  const handleBookmark = () => {
    Animated.sequence([
      Animated.timing(bookmarkScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bookmarkScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBookmark();
  };

  // Get Event Icon
  const getEventIcon = (type: string) => {
    const icons = {
      eclipse: '🌙',
      retrograde: '🔄',
      station: '⏸️',
      seasonal: '🍂',
      moon_phase: '🌕',
      meteor_shower: '☄️',
      supermoon: '🌕',
    };
    return icons[type as keyof typeof icons] || '⭐';
  };

  // Get Impact Glow Color
  const getImpactGlowColor = () => {
    return glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(0, 0, 0, 0)', impactColors.glow || 'rgba(255, 107, 107, 0.3)'],
    });
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: cardOpacity,
          transform: [{ scale: cardScale }],
        },
      ]}
    >
      {/* Glow Effect for High Impact Events */}
      {event.impactLevel === 'high' && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              backgroundColor: getImpactGlowColor(),
            },
          ]}
        />
      )}

      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <BlurView intensity={20} tint="dark" style={styles.cardBlur}>
          {/* Card Header with Gradient */}
          <LinearGradient
            colors={eventColors.gradient || [eventColors.primary, eventColors.secondary]}
            style={styles.cardHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.eventTypeContainer}>
                <Text style={styles.eventIcon}>{getEventIcon(event.type)}</Text>
                <View style={styles.eventTypeBadge}>
                  <Text style={styles.eventTypeText}>
                    {event.type.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.bookmarkButton}
                onPress={handleBookmark}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.bookmarkIcon,
                    {
                      transform: [{ scale: bookmarkScale }],
                    },
                  ]}
                >
                  <Text style={styles.bookmarkText}>
                    {isBookmarked ? '🔖' : '🔖'}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Event Name */}
            <Text style={styles.eventName} numberOfLines={2}>
              {event.name}
            </Text>

            {/* Event Details */}
            <View style={styles.eventDetails}>
              <Text style={styles.eventDate}>
                {event.startDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              
              <Animated.View
                style={[
                  styles.impactBadge,
                  {
                    backgroundColor: impactColors.primary,
                    transform: [{ scale: impactPulse }],
                  },
                ]}
              >
                <Text style={styles.impactText}>
                  {event.impactLevel.toUpperCase()}
                </Text>
              </Animated.View>
            </View>

            {/* Event Description */}
            <Text style={styles.eventDescription} numberOfLines={3}>
              {event.description}
            </Text>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownIcon}>⏰</Text>
                <Text style={styles.countdownText}>
                  {daysUntil > 0 ? `${daysUntil} days` : 'Today!'}
                </Text>
              </View>

              {isAffectingUser && (
                <View style={styles.affectingBadge}>
                  <Text style={styles.affectingText}>AFFECTS YOU</Text>
                </View>
              )}
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: CosmicTheme.cornerRadius.large + 4,
    zIndex: -1,
  },
  card: {
    borderRadius: CosmicTheme.cornerRadius.large,
    overflow: 'hidden',
    ...CosmicTheme.shadows.card,
  },
  cardBlur: {
    backgroundColor: CosmicTheme.colors.glassBackground,
    borderWidth: 1,
    borderColor: CosmicTheme.colors.glassBorder,
  },
  cardHeader: {
    padding: CosmicTheme.spacing.md,
    borderTopLeftRadius: CosmicTheme.cornerRadius.large,
    borderTopRightRadius: CosmicTheme.cornerRadius.large,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    fontSize: 20,
    marginRight: CosmicTheme.spacing.sm,
  },
  eventTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: CosmicTheme.spacing.sm,
    paddingVertical: CosmicTheme.spacing.xs,
    borderRadius: CosmicTheme.cornerRadius.small,
  },
  eventTypeText: {
    ...CosmicTheme.typography.impactText,
    color: CosmicTheme.colors.primaryText,
    fontSize: 10,
  },
  bookmarkButton: {
    padding: CosmicTheme.spacing.xs,
  },
  bookmarkIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkText: {
    fontSize: 16,
    opacity: 0.7,
  },
  cardContent: {
    padding: CosmicTheme.spacing.md,
  },
  eventName: {
    ...CosmicTheme.typography.stellarSubtitle,
    color: CosmicTheme.colors.primaryText,
    marginBottom: CosmicTheme.spacing.sm,
    lineHeight: 20,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: CosmicTheme.spacing.sm,
  },
  eventDate: {
    ...CosmicTheme.typography.countdownText,
    color: CosmicTheme.colors.secondaryText,
  },
  impactBadge: {
    paddingHorizontal: CosmicTheme.spacing.sm,
    paddingVertical: CosmicTheme.spacing.xs,
    borderRadius: CosmicTheme.cornerRadius.small,
  },
  impactText: {
    ...CosmicTheme.typography.impactText,
    color: CosmicTheme.colors.primaryText,
    fontSize: 9,
  },
  eventDescription: {
    ...CosmicTheme.typography.stellarCaption,
    color: CosmicTheme.colors.secondaryText,
    lineHeight: 18,
    marginBottom: CosmicTheme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownIcon: {
    fontSize: 12,
    marginRight: CosmicTheme.spacing.xs,
  },
  countdownText: {
    ...CosmicTheme.typography.countdownText,
    color: CosmicTheme.colors.accentText,
  },
  affectingBadge: {
    backgroundColor: CosmicTheme.colors.cosmicPurple,
    paddingHorizontal: CosmicTheme.spacing.sm,
    paddingVertical: CosmicTheme.spacing.xs,
    borderRadius: CosmicTheme.cornerRadius.small,
  },
  affectingText: {
    ...CosmicTheme.typography.impactText,
    color: CosmicTheme.colors.primaryText,
    fontSize: 8,
  },
});

export default CosmicEventCard;
