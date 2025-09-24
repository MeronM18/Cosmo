import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { iOS17Theme } from '../../theme/ios17Theme';
import { CelestialEvent } from '../../services/celestialEventsService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.3; // Portrait aspect ratio

interface CelestialEventCardProps {
  event: CelestialEvent;
  onPress: (event: CelestialEvent) => void;
  style?: 'light' | 'dark';
}

const CelestialEventCard: React.FC<CelestialEventCardProps> = ({
  event,
  onPress,
  style = 'light',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getDaysUntilEvent = (eventDate: Date) => {
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCountdownText = (eventDate: Date) => {
    const daysUntil = getDaysUntilEvent(eventDate);
    if (daysUntil <= 0) return 'Today!';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil < 7) return `in ${daysUntil} days`;
    if (daysUntil < 30) return `in ${Math.ceil(daysUntil / 7)} weeks`;
    if (daysUntil < 365) return `in ${Math.ceil(daysUntil / 30)} months`;
    return `in ${Math.ceil(daysUntil / 365)} years`;
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(event);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'eclipse': return '🌙';
      case 'meteor_shower': return '☄️';
      case 'moon_phase': return '🌕';
      case 'supermoon': return '🌕';
      case 'seasonal': return '🌸';
      case 'retrograde': return '🔄';
      case 'station': return '⏸️';
      default: return '⭐';
    }
  };

  const getEventImage = (type: string) => {
    switch (type) {
      case 'meteor_shower': return require('../../../assets/meteorshower.png');
      case 'seasonal': return require('../../../assets/wintersolstice.png');
      case 'eclipse': return require('../../../assets/moon (1).png');
      case 'moon_phase': return require('../../../assets/moon (1).png');
      case 'supermoon': return require('../../../assets/moon (1).png');
      default: return require('../../../assets/starry-clouds.png');
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'eclipse': return 'Eclipse';
      case 'meteor_shower': return 'Meteor Shower';
      case 'moon_phase': return 'Moon Phase';
      case 'supermoon': return 'Supermoon';
      case 'seasonal': return 'Seasonal Event';
      case 'retrograde': return 'Retrograde';
      case 'station': return 'Station';
      default: return 'Celestial Event';
    }
  };

  const getVisibilityInfo = (event: CelestialEvent) => {
    if (event.type === 'meteor_shower') {
      return 'Global';
    } else if (event.type === 'eclipse') {
      return 'Regional';
    } else if (event.type === 'seasonal') {
      return 'Global';
    } else {
      return 'Global';
    }
  };

  const getImpactLevelColor = (level: string) => {
    switch (level) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFA500';
      case 'low': return '#90EE90';
      default: return iOS17Theme.colors.label;
    }
  };

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isLightStyle = style === 'light';

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={getEventImage(event.type)}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
            locations={[0, 0.5, 1]}
            style={styles.gradientOverlay}
          />
          
          {/* Header Area - Date and Impact Level */}
          <View style={styles.headerArea}>
            <View style={styles.topRightContainer}>
              <View style={[
                styles.dateContainer,
                isLightStyle && styles.lightContainer
              ]}>
                <Text style={[
                  styles.dateText,
                  isLightStyle && styles.lightText
                ]}>
                  {formatEventDate(event.startDate)}
                </Text>
              </View>
              <View style={[
                styles.impactContainer,
                isLightStyle && styles.lightContainer
              ]}>
                <View style={[
                  styles.impactDot,
                  { backgroundColor: getImpactLevelColor(event.impactLevel) }
                ]} />
                <Text style={[
                  styles.impactText,
                  isLightStyle && styles.lightText
                ]}>
                  {event.impactLevel.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Main Content Area */}
          <View style={styles.contentArea}>
            {/* Event Name */}
            <Text style={styles.eventName} numberOfLines={2}>
              {event.name}
            </Text>

            {/* Event Type */}
            <Text style={styles.eventType}>
              {getEventTypeLabel(event.type)}
            </Text>

            {/* Countdown and Visibility Row */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.countdownText}>
                  {getCountdownText(event.startDate)}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>🌍</Text>
                <Text style={styles.detailText}>
                  {getVisibilityInfo(event)}
                </Text>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                isLightStyle ? styles.lightButton : styles.darkButton,
              ]}
              onPress={handlePress}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  isLightStyle ? styles.lightButtonText : styles.darkButtonText,
                ]}
              >
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT * 0.95, // Slightly reduced height for better proportion
    marginHorizontal: iOS17Theme.spacing.md,
    marginVertical: iOS17Theme.spacing.sm,
  },
  card: {
    flex: 1,
    borderRadius: iOS17Theme.cornerRadius.extraExtraLarge, // Increased border radius
    overflow: 'hidden',
    ...iOS17Theme.shadows.large,
    // Add inner shadow effect
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  backgroundImageStyle: {
    borderRadius: iOS17Theme.cornerRadius.extraExtraLarge,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%', // Increased for better text readability
  },
  headerArea: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: iOS17Theme.spacing.lg,
    paddingRight: iOS17Theme.spacing.lg,
  },
  topRightContainer: {
    alignItems: 'flex-end',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: iOS17Theme.spacing.sm,
    paddingVertical: iOS17Theme.spacing.xs,
    borderRadius: iOS17Theme.cornerRadius.small,
    marginBottom: iOS17Theme.spacing.xs,
  },
  dateText: {
    ...iOS17Theme.typography.caption1,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: iOS17Theme.spacing.sm,
    paddingVertical: iOS17Theme.spacing.xs,
    borderRadius: iOS17Theme.cornerRadius.small,
  },
  impactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: iOS17Theme.spacing.xs,
  },
  impactText: {
    ...iOS17Theme.typography.caption2,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  contentArea: {
    padding: iOS17Theme.spacing.lg,
    paddingBottom: iOS17Theme.spacing.xl,
  },
  eventName: {
    ...iOS17Theme.typography.title1,
    color: '#FFFFFF',
    fontWeight: '500', // Reduced from 700 to 500
    fontSize: 26, // Slightly reduced from 28
    lineHeight: 32,
    letterSpacing: 0.5, // Added letter spacing for premium feel
    marginBottom: iOS17Theme.spacing.sm, // Increased spacing
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  eventType: {
    ...iOS17Theme.typography.callout,
    color: 'rgba(255, 255, 255, 0.7)', // Increased opacity from 0.7
    fontSize: 16,
    fontWeight: '500',
    marginBottom: iOS17Theme.spacing.lg, // Increased spacing
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: iOS17Theme.spacing.xs,
  },
  detailText: {
    ...iOS17Theme.typography.callout,
    color: '#FFFFFF',
    fontSize: 16, // Reduced from 18
    fontWeight: '500',
  },
  countdownText: {
    ...iOS17Theme.typography.callout,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    width: '100%',
    height: 52, // Increased height
    borderRadius: iOS17Theme.cornerRadius.large, // Increased corner radius
    alignItems: 'center',
    justifyContent: 'center',
    ...iOS17Theme.shadows.medium,
    // Add subtle drop shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  lightButton: {
    backgroundColor: '#FFFFFF',
  },
  darkButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Slightly more opaque
  },
  actionButtonText: {
    ...iOS17Theme.typography.callout,
    fontSize: 16,
    fontWeight: '600',
  },
  lightButtonText: {
    color: '#000000',
  },
  darkButtonText: {
    color: '#FFFFFF',
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  lightText: {
    color: '#000000',
  },
});

export default CelestialEventCard;
