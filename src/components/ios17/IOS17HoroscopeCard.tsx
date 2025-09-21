import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { iOS17Theme } from '../../theme/ios17Theme';

const { width } = Dimensions.get('window');

interface IOS17HoroscopeCardProps {
  zodiacSign: string;
  zodiacSymbol: string;
  cosmicEnergy: number;
  mainReading: string;
  luckyElements: {
    color: string;
    number: number;
    time: string;
    direction: string;
  };
  wordOfDay: string;
  onReadFullAnalysis: () => void;
  onShare: () => void;
  onSave: () => void;
  onShowHistory: () => void;
  isExpanded: boolean;
}

const IOS17HoroscopeCard: React.FC<IOS17HoroscopeCardProps> = ({
  zodiacSign,
  zodiacSymbol,
  cosmicEnergy,
  mainReading,
  luckyElements,
  wordOfDay,
  onReadFullAnalysis,
  onShare,
  onSave,
  onShowHistory,
  isExpanded,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: iOS17Theme.animationDurations.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      ...iOS17Theme.springConfigs.gentle,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...iOS17Theme.springConfigs.gentle,
    }).start();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text
        key={i}
        style={[
          styles.starIcon,
          i < rating && styles.starActive,
        ]}
      >
        {iOS17Theme.symbols.starFill}
      </Text>
    ));
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onReadFullAnalysis}
        activeOpacity={1}
      >
        <BlurView
          intensity={20}
          tint="systemMaterial"
          style={styles.blurView}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.zodiacSection}>
              <Text style={styles.zodiacSymbol}>{zodiacSymbol}</Text>
              <Text style={styles.zodiacSign}>{zodiacSign}</Text>
            </View>
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Cosmic Energy</Text>
              <View style={styles.starsContainer}>
                {renderStars(cosmicEnergy)}
              </View>
            </View>
          </View>

          {/* Word of the Day */}
          <View style={styles.wordOfDaySection}>
            <Text style={styles.wordOfDayLabel}>Word of the Day</Text>
            <Text style={styles.wordOfDay}>{wordOfDay}</Text>
          </View>

          {/* Main Reading */}
          <Text style={styles.mainReading} numberOfLines={isExpanded ? undefined : 3}>
            {mainReading}
          </Text>

          {/* Lucky Elements */}
          <View style={styles.luckyElementsSection}>
            <View style={styles.luckyElement}>
              <View style={[styles.colorSwatch, { backgroundColor: luckyElements.color }]} />
              <Text style={styles.luckyElementLabel}>Color</Text>
            </View>
            <View style={styles.luckyElement}>
              <Text style={styles.luckyNumber}>{luckyElements.number}</Text>
              <Text style={styles.luckyElementLabel}>Number</Text>
            </View>
            <View style={styles.luckyElement}>
              <Text style={styles.luckyTime}>{iOS17Theme.symbols.clock}</Text>
              <Text style={styles.luckyElementLabel}>Time</Text>
            </View>
            <View style={styles.luckyElement}>
              <Text style={styles.luckyDirection}>{iOS17Theme.symbols.compass}</Text>
              <Text style={styles.luckyElementLabel}>Direction</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onReadFullAnalysis}
            >
              <Text style={styles.primaryButtonText}>
                {isExpanded ? 'Read Less' : 'Read Full Analysis'}
              </Text>
              <Text style={styles.primaryButtonIcon}>
                {isExpanded ? iOS17Theme.symbols.chevronUp : iOS17Theme.symbols.chevronRight}
              </Text>
            </TouchableOpacity>

            <View style={styles.secondaryButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onShare}
              >
                <Text style={styles.secondaryButtonIcon}>{iOS17Theme.symbols.share}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onSave}
              >
                <Text style={styles.secondaryButtonIcon}>{iOS17Theme.symbols.bookmark}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onShowHistory}
              >
                <Text style={styles.secondaryButtonIcon}>📚</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: iOS17Theme.spacing.md,
    marginBottom: iOS17Theme.spacing.lg,
  },
  card: {
    borderRadius: iOS17Theme.cornerRadius.large,
    overflow: 'hidden',
    ...iOS17Theme.shadows.large,
  },
  blurView: {
    padding: iOS17Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.md,
  },
  zodiacSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zodiacSymbol: {
    fontSize: 28,
    marginRight: iOS17Theme.spacing.sm,
  },
  zodiacSign: {
    ...iOS17Theme.typography.title2,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  ratingSection: {
    alignItems: 'flex-end',
  },
  ratingLabel: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.secondaryLabel,
    marginBottom: iOS17Theme.spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    fontSize: 16,
    marginRight: 2,
    color: iOS17Theme.colors.tertiaryLabel,
  },
  starActive: {
    color: iOS17Theme.colors.cosmicGold,
  },
  wordOfDaySection: {
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.md,
    paddingVertical: iOS17Theme.spacing.sm,
    backgroundColor: iOS17Theme.colors.systemFill,
    borderRadius: iOS17Theme.cornerRadius.medium,
  },
  wordOfDayLabel: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.secondaryLabel,
    marginBottom: iOS17Theme.spacing.xs,
  },
  wordOfDay: {
    ...iOS17Theme.typography.title3,
    color: iOS17Theme.colors.cosmicPurple,
    fontWeight: '600',
  },
  mainReading: {
    ...iOS17Theme.typography.body,
    color: iOS17Theme.colors.label,
    lineHeight: 24,
    marginBottom: iOS17Theme.spacing.lg,
  },
  luckyElementsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.sm,
    backgroundColor: iOS17Theme.colors.quaternarySystemFill,
    borderRadius: iOS17Theme.cornerRadius.medium,
  },
  luckyElement: {
    alignItems: 'center',
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: iOS17Theme.spacing.xs,
  },
  luckyNumber: {
    ...iOS17Theme.typography.headline,
    color: iOS17Theme.colors.cosmicPurple,
    fontWeight: '700',
    marginBottom: iOS17Theme.spacing.xs,
  },
  luckyTime: {
    fontSize: 18,
    marginBottom: iOS17Theme.spacing.xs,
  },
  luckyDirection: {
    fontSize: 18,
    marginBottom: iOS17Theme.spacing.xs,
  },
  luckyElementLabel: {
    ...iOS17Theme.typography.caption2,
    color: iOS17Theme.colors.tertiaryLabel,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: iOS17Theme.colors.cosmicPurple,
    paddingHorizontal: iOS17Theme.spacing.md,
    paddingVertical: iOS17Theme.spacing.sm,
    borderRadius: iOS17Theme.cornerRadius.medium,
    flex: 1,
    marginRight: iOS17Theme.spacing.sm,
  },
  primaryButtonText: {
    ...iOS17Theme.typography.callout,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  primaryButtonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: iOS17Theme.spacing.xs,
  },
  secondaryButtons: {
    flexDirection: 'row',
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: iOS17Theme.colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: iOS17Theme.spacing.xs,
  },
  secondaryButtonIcon: {
    fontSize: 18,
    color: iOS17Theme.colors.label,
  },
});

export default IOS17HoroscopeCard;
