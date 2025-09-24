import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { iOS17Theme } from '../../theme/ios17Theme';
import { CelestialEvent } from '../../services/celestialEventsService';
import CelestialEventCard from './CelestialEventCard';

const { width } = Dimensions.get('window');

// Calculate precise dimensions for perfect card centering
const CARD_WIDTH = width * 0.8; // 80% of screen width
const CARD_SPACING = 50; // Space between cards
const LEFT_PADDING = 0; // Minimal left padding to bring card left
const RIGHT_PADDING = (width - CARD_WIDTH) / 2 + 50; // Center the last card horizontally + extra space
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING; // Distance between card centers

interface CelestialEventCardsContainerProps {
  events: CelestialEvent[];
  onEventPress: (event: CelestialEvent) => void;
  title?: string;
  subtitle?: string;
}

const CelestialEventCardsContainer: React.FC<CelestialEventCardsContainerProps> = ({
  events,
  onEventPress,
  title,
  subtitle = 'Discover cosmic happenings',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getCardStyle = (index: number): 'light' | 'dark' => {
    // Alternate between light and dark styles
    return index % 2 === 0 ? 'light' : 'dark';
  };

  if (events.length === 0) {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>🌙 No upcoming events</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="center"
        pagingEnabled={false}
        bounces={true}
        bouncesZoom={false}
        alwaysBounceHorizontal={false}
      >
        {events.map((event, index) => (
          <View
            key={event.id}
            style={[
              styles.cardWrapper,
              index < events.length - 1 && { marginRight: CARD_SPACING }
            ]}
          >
            <CelestialEventCard
              event={event}
              onPress={onEventPress}
              style={getCardStyle(index)}
            />
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: iOS17Theme.spacing.xs,
    marginBottom: iOS17Theme.spacing.sm,
  },
  header: {
    paddingHorizontal: iOS17Theme.spacing.lg,
    marginBottom: iOS17Theme.spacing.xs,
  },
  title: {
    ...iOS17Theme.text.sectionTitle,
    marginBottom: iOS17Theme.spacing.xs,
  },
  subtitle: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.secondaryLabel,
  },
  scrollContent: {
    paddingLeft: LEFT_PADDING,
    paddingRight: RIGHT_PADDING,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  emptyState: {
    padding: iOS17Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    ...iOS17Theme.typography.body,
    color: iOS17Theme.colors.secondaryLabel,
    textAlign: 'center',
  },
});

export default CelestialEventCardsContainer;
