import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { CosmicTheme } from '../../theme/cosmicTheme';
import { CelestialEvent } from '../../services/celestialEventsService';

const { width, height } = Dimensions.get('window');

interface CosmicHeroSectionProps {
  events: CelestialEvent[];
  userData: {
    zodiacSign: string;
  };
  onEventPress: (event: CelestialEvent) => void;
}

const CosmicHeroSection: React.FC<CosmicHeroSectionProps> = ({
  events,
  userData,
  onEventPress,
}) => {
  // Animation Values
  const constellationAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  // Get featured events (next 3 events)
  const featuredEvents = events.slice(0, 3);

  // Constellation Animation
  useEffect(() => {
    // Continuous constellation movement
    Animated.loop(
      Animated.timing(constellationAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Entry animations
    Animated.stagger(200, [
      Animated.spring(titleAnim, {
        toValue: 1,
        ...CosmicTheme.springs.gentle,
        useNativeDriver: true,
      }),
      Animated.spring(subtitleAnim, {
        toValue: 1,
        ...CosmicTheme.springs.gentle,
        useNativeDriver: true,
      }),
      Animated.spring(cardsAnim, {
        toValue: 1,
        ...CosmicTheme.springs.gentle,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get constellation transform
  const getConstellationTransform = () => {
    return {
      transform: [
        {
          translateX: constellationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 50],
          }),
        },
        {
          translateY: constellationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -30],
          }),
        },
      ],
    };
  };

  // Get sparkle transform
  const getSparkleTransform = () => {
    return {
      transform: [
        {
          scale: sparkleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1.2],
          }),
        },
        {
          rotate: sparkleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
      opacity: sparkleAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 1, 0.3],
      }),
    };
  };

  // Render Constellation
  const renderConstellation = () => {
    const stars = Array.from({ length: 20 }, (_, i) => (
      <Animated.View
        key={i}
        style={[
          styles.star,
          {
            left: Math.random() * width,
            top: Math.random() * (height * 0.4),
            ...getConstellationTransform(),
          },
        ]}
      >
        <Text style={styles.starIcon}>✨</Text>
      </Animated.View>
    ));

    return <View style={styles.constellation}>{stars}</View>;
  };

  // Render Featured Event Card
  const renderFeaturedCard = (event: CelestialEvent, index: number) => {
    const daysUntil = Math.ceil(
      (event.startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <Animated.View
        key={event.id}
        style={[
          styles.featuredCard,
          {
            transform: [
              {
                translateY: cardsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
              {
                scale: cardsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <BlurView intensity={15} tint="dark" style={styles.cardBlur}>
          <LinearGradient
            colors={['rgba(106, 70, 193, 0.3)', 'rgba(236, 72, 153, 0.3)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.eventIcon}>⭐</Text>
                <View style={styles.eventBadge}>
                  <Text style={styles.eventBadgeText}>
                    {event.type.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.eventName} numberOfLines={2}>
                {event.name}
              </Text>
              
              <View style={styles.cardFooter}>
                <Text style={styles.countdownText}>
                  {daysUntil > 0 ? `${daysUntil} days` : 'Today!'}
                </Text>
                <View style={styles.impactIndicator}>
                  <Text style={styles.impactText}>
                    {event.impactLevel.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={CosmicTheme.gradients.primary}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Constellation Background */}
      {renderConstellation()}

      {/* Sparkle Effects */}
      <Animated.View style={[styles.sparkle1, getSparkleTransform()]}>
        <Text style={styles.sparkleIcon}>✨</Text>
      </Animated.View>
      <Animated.View style={[styles.sparkle2, getSparkleTransform()]}>
        <Text style={styles.sparkleIcon}>⭐</Text>
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title Section */}
        <Animated.View
          style={[
            styles.titleSection,
            {
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.title}>Cosmic Events</Text>
          <Animated.Text
            style={[
              styles.subtitle,
              {
                transform: [
                  {
                    translateY: subtitleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            Discover celestial happenings affecting your {userData.zodiacSign} sign
          </Animated.Text>
        </Animated.View>

        {/* Featured Events Timeline */}
        {featuredEvents.length > 0 && (
          <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>Upcoming Events</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timelineContent}
              decelerationRate="fast"
              snapToInterval={width * 0.8}
              snapToAlignment="center"
            >
              {featuredEvents.map((event, index) => renderFeaturedCard(event, index))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  constellation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
  },
  starIcon: {
    fontSize: 12,
    opacity: 0.6,
  },
  sparkle1: {
    position: 'absolute',
    top: 60,
    right: 40,
  },
  sparkle2: {
    position: 'absolute',
    top: 120,
    left: 30,
  },
  sparkleIcon: {
    fontSize: 20,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: CosmicTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: CosmicTheme.spacing.lg,
  },
  titleSection: {
    marginBottom: CosmicTheme.spacing.xl,
  },
  title: {
    ...CosmicTheme.typography.cosmicTitle,
    color: CosmicTheme.colors.primaryText,
    marginBottom: CosmicTheme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: CosmicTheme.spacing.md,
  },
  timelineContainer: {
    flex: 1,
  },
  timelineTitle: {
    ...CosmicTheme.typography.stellarSubtitle,
    color: CosmicTheme.colors.primaryText,
    marginBottom: CosmicTheme.spacing.md,
    textAlign: 'center',
  },
  timelineContent: {
    paddingHorizontal: CosmicTheme.spacing.md,
  },
  featuredCard: {
    width: width * 0.75,
    height: 120,
    marginRight: CosmicTheme.spacing.md,
    borderRadius: CosmicTheme.cornerRadius.large,
    overflow: 'hidden',
    ...CosmicTheme.shadows.card,
  },
  cardBlur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardGradient: {
    flex: 1,
    padding: CosmicTheme.spacing.md,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventIcon: {
    fontSize: 16,
  },
  eventBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: CosmicTheme.spacing.sm,
    paddingVertical: CosmicTheme.spacing.xs,
    borderRadius: CosmicTheme.cornerRadius.small,
  },
  eventBadgeText: {
    ...CosmicTheme.typography.impactText,
    color: CosmicTheme.colors.primaryText,
    fontSize: 9,
  },
  eventName: {
    ...CosmicTheme.typography.stellarSubtitle,
    color: CosmicTheme.colors.primaryText,
    fontSize: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countdownText: {
    ...CosmicTheme.typography.countdownText,
    color: CosmicTheme.colors.accentText,
  },
  impactIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: CosmicTheme.spacing.sm,
    paddingVertical: CosmicTheme.spacing.xs,
    borderRadius: CosmicTheme.cornerRadius.small,
  },
  impactText: {
    ...CosmicTheme.typography.impactText,
    color: CosmicTheme.colors.primaryText,
    fontSize: 8,
  },
});

export default CosmicHeroSection;
