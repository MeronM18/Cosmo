import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CosmicTheme } from '../../theme/cosmicTheme';

const { width } = Dimensions.get('window');

const CosmicLoadingSkeleton: React.FC = () => {
  // Animation Values
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Shimmer Animation
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: CosmicTheme.animations.normal,
      useNativeDriver: true,
    }).start();

    // Continuous shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Shimmer Effect Component
  const ShimmerEffect: React.FC<{ style: any }> = ({ style }) => {
    const shimmerTranslateX = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 100],
    });

    return (
      <View style={[style, { overflow: 'hidden' }]}>
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX: shimmerTranslateX }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0)',
              'rgba(255, 255, 255, 0.1)',
              'rgba(255, 255, 255, 0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </View>
    );
  };

  // Skeleton Card Component
  const SkeletonCard: React.FC<{ index: number }> = ({ index }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: CosmicTheme.animations.normal,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, [index]);

    return (
      <Animated.View
        style={[
          styles.skeletonCard,
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <ShimmerEffect style={styles.headerShimmer} />
        </View>
        
        <View style={styles.cardContent}>
          <ShimmerEffect style={styles.titleShimmer} />
          <ShimmerEffect style={styles.subtitleShimmer} />
          <ShimmerEffect style={styles.descriptionShimmer} />
          
          <View style={styles.cardFooter}>
            <ShimmerEffect style={styles.footerShimmer} />
            <ShimmerEffect style={styles.badgeShimmer} />
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Hero Section Skeleton */}
      <View style={styles.heroSkeleton}>
        <LinearGradient
          colors={CosmicTheme.gradients.primary}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <ShimmerEffect style={styles.heroTitleShimmer} />
            <ShimmerEffect style={styles.heroSubtitleShimmer} />
            
            {/* Timeline Skeleton */}
            <View style={styles.timelineSkeleton}>
              <ShimmerEffect style={styles.timelineTitleShimmer} />
              <View style={styles.timelineCards}>
                {Array.from({ length: 3 }, (_, i) => (
                  <View key={i} style={styles.timelineCard}>
                    <ShimmerEffect style={styles.timelineCardShimmer} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Filter Pills Skeleton */}
      <View style={styles.filterSkeleton}>
        <View style={styles.filterPills}>
          {Array.from({ length: 4 }, (_, i) => (
            <ShimmerEffect key={i} style={styles.filterPillShimmer} />
          ))}
        </View>
      </View>

      {/* Events Grid Skeleton */}
      <View style={styles.eventsSkeleton}>
        <View style={styles.eventsGrid}>
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CosmicTheme.colors.primaryBackground,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    flex: 1,
    width: '100%',
  },
  
  // Hero Section
  heroSkeleton: {
    height: 300,
    marginBottom: CosmicTheme.spacing.lg,
  },
  heroGradient: {
    flex: 1,
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: CosmicTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: CosmicTheme.spacing.lg,
  },
  heroTitleShimmer: {
    height: 40,
    width: '60%',
    alignSelf: 'center',
    marginBottom: CosmicTheme.spacing.md,
    borderRadius: CosmicTheme.cornerRadius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroSubtitleShimmer: {
    height: 20,
    width: '80%',
    alignSelf: 'center',
    marginBottom: CosmicTheme.spacing.xl,
    borderRadius: CosmicTheme.cornerRadius.small,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timelineSkeleton: {
    flex: 1,
  },
  timelineTitleShimmer: {
    height: 18,
    width: '40%',
    alignSelf: 'center',
    marginBottom: CosmicTheme.spacing.md,
    borderRadius: CosmicTheme.cornerRadius.small,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timelineCards: {
    flexDirection: 'row',
    paddingHorizontal: CosmicTheme.spacing.md,
  },
  timelineCard: {
    width: width * 0.75,
    height: 100,
    marginRight: CosmicTheme.spacing.md,
    borderRadius: CosmicTheme.cornerRadius.large,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timelineCardShimmer: {
    flex: 1,
    borderRadius: CosmicTheme.cornerRadius.large,
  },
  
  // Filter Pills
  filterSkeleton: {
    marginHorizontal: CosmicTheme.spacing.md,
    marginBottom: CosmicTheme.spacing.lg,
  },
  filterPills: {
    flexDirection: 'row',
    paddingHorizontal: CosmicTheme.spacing.sm,
  },
  filterPillShimmer: {
    height: 36,
    width: 80,
    marginRight: CosmicTheme.spacing.sm,
    borderRadius: CosmicTheme.cornerRadius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Events Grid
  eventsSkeleton: {
    flex: 1,
    paddingHorizontal: CosmicTheme.spacing.md,
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonCard: {
    width: (width - CosmicTheme.spacing.md * 3) / 2,
    height: 200,
    marginBottom: CosmicTheme.spacing.md,
    borderRadius: CosmicTheme.cornerRadius.large,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerShimmer: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
    padding: CosmicTheme.spacing.md,
  },
  titleShimmer: {
    height: 18,
    width: '80%',
    marginBottom: CosmicTheme.spacing.sm,
    borderRadius: CosmicTheme.cornerRadius.small,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  subtitleShimmer: {
    height: 14,
    width: '60%',
    marginBottom: CosmicTheme.spacing.sm,
    borderRadius: CosmicTheme.cornerRadius.small,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  descriptionShimmer: {
    height: 12,
    width: '100%',
    marginBottom: CosmicTheme.spacing.sm,
    borderRadius: CosmicTheme.cornerRadius.small,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerShimmer: {
    height: 12,
    width: 60,
    borderRadius: CosmicTheme.cornerRadius.small,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeShimmer: {
    height: 20,
    width: 40,
    borderRadius: CosmicTheme.cornerRadius.small,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default CosmicLoadingSkeleton;
