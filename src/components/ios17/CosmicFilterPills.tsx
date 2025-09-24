import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { CosmicTheme } from '../../theme/cosmicTheme';

type FilterType = 'all' | 'high_impact' | 'affecting_me' | 'upcoming';

interface CosmicFilterPillsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  eventCounts: {
    all: number;
    high_impact: number;
    affecting_me: number;
    upcoming: number;
  };
}

const CosmicFilterPills: React.FC<CosmicFilterPillsProps> = ({
  activeFilter,
  onFilterChange,
  eventCounts,
}) => {
  // Animation Values
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pillAnims = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0))
  ).current;

  // Filter Configuration
  const filters = [
    {
      key: 'all' as FilterType,
      label: 'All Events',
      icon: '🌟',
      count: eventCounts.all,
    },
    {
      key: 'high_impact' as FilterType,
      label: 'High Impact',
      icon: '⚡',
      count: eventCounts.high_impact,
    },
    {
      key: 'affecting_me' as FilterType,
      label: 'Affecting Me',
      icon: '🎯',
      count: eventCounts.affecting_me,
    },
    {
      key: 'upcoming' as FilterType,
      label: 'This Week',
      icon: '📅',
      count: eventCounts.upcoming,
    },
  ];

  // Entry Animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: CosmicTheme.animations.normal,
      useNativeDriver: true,
    }).start();

    // Staggered pill animations
    Animated.stagger(100, [
      ...pillAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          ...CosmicTheme.springs.gentle,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  // Handle Filter Press
  const handleFilterPress = (filter: FilterType) => {
    onFilterChange(filter);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Render Filter Pill
  const renderFilterPill = (filter: any, index: number) => {
    const isActive = activeFilter === filter.key;
    const animValue = pillAnims[index];

    return (
      <Animated.View
        key={filter.key}
        style={[
          styles.pillContainer,
          {
            transform: [
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
              {
                scale: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.pillButton}
          onPress={() => handleFilterPress(filter.key)}
          activeOpacity={0.8}
        >
          {isActive ? (
            <LinearGradient
              colors={CosmicTheme.gradients.stellar}
              style={styles.activePill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.pillContent}>
                <Text style={styles.pillIcon}>{filter.icon}</Text>
                <Text style={styles.activePillText}>{filter.label}</Text>
                {filter.count > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{filter.count}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          ) : (
            <BlurView intensity={20} tint="dark" style={styles.inactivePill}>
              <View style={styles.pillContent}>
                <Text style={styles.pillIcon}>{filter.icon}</Text>
                <Text style={styles.inactivePillText}>{filter.label}</Text>
                {filter.count > 0 && (
                  <View style={styles.inactiveCountBadge}>
                    <Text style={styles.inactiveCountText}>{filter.count}</Text>
                  </View>
                )}
              </View>
            </BlurView>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
        >
          {filters.map((filter, index) => renderFilterPill(filter, index))}
        </ScrollView>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: CosmicTheme.spacing.md,
    borderRadius: CosmicTheme.cornerRadius.large,
    overflow: 'hidden',
    ...CosmicTheme.shadows.glass,
  },
  blurContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollContent: {
    paddingHorizontal: CosmicTheme.spacing.sm,
    paddingVertical: CosmicTheme.spacing.sm,
  },
  pillContainer: {
    marginRight: CosmicTheme.spacing.sm,
  },
  pillButton: {
    borderRadius: CosmicTheme.cornerRadius.medium,
    overflow: 'hidden',
  },
  activePill: {
    paddingHorizontal: CosmicTheme.spacing.md,
    paddingVertical: CosmicTheme.spacing.sm,
    ...CosmicTheme.shadows.glow,
  },
  inactivePill: {
    paddingHorizontal: CosmicTheme.spacing.md,
    paddingVertical: CosmicTheme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillIcon: {
    fontSize: 16,
    marginRight: CosmicTheme.spacing.xs,
  },
  activePillText: {
    ...CosmicTheme.typography.cosmicLabel,
    color: CosmicTheme.colors.primaryText,
    fontWeight: '600',
    marginRight: CosmicTheme.spacing.xs,
  },
  inactivePillText: {
    ...CosmicTheme.typography.cosmicLabel,
    color: CosmicTheme.colors.secondaryText,
    marginRight: CosmicTheme.spacing.xs,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: CosmicTheme.spacing.xs,
    paddingVertical: 2,
    borderRadius: CosmicTheme.cornerRadius.small,
    minWidth: 20,
    alignItems: 'center',
  },
  inactiveCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: CosmicTheme.spacing.xs,
    paddingVertical: 2,
    borderRadius: CosmicTheme.cornerRadius.small,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    ...CosmicTheme.typography.impactText,
    color: CosmicTheme.colors.primaryText,
    fontSize: 10,
    fontWeight: '700',
  },
  inactiveCountText: {
    ...CosmicTheme.typography.impactText,
    color: CosmicTheme.colors.secondaryText,
    fontSize: 10,
    fontWeight: '600',
  },
});

export default CosmicFilterPills;
