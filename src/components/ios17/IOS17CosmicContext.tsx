import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { iOS17Theme } from '../../theme/ios17Theme';

const { width } = Dimensions.get('window');

interface Planet {
  name: string;
  symbol: string;
  sign: string;
  house: number;
  isRetrograde: boolean;
  influence: string;
  color: string;
  progress: number;
}

interface Transit {
  id: string;
  planet: string;
  symbol: string;
  fromSign: string;
  toSign: string;
  progress: number;
  startDate: string;
  endDate: string;
  influence: string;
  intensity: 'low' | 'medium' | 'high';
}

interface IOS17CosmicContextProps {
  planets: Planet[];
  transits: Transit[];
  onPlanetPress?: (planet: Planet) => void;
  onTransitPress?: (transit: Transit) => void;
}

const IOS17CosmicContext: React.FC<IOS17CosmicContextProps> = ({
  planets,
  transits,
  onPlanetPress,
  onTransitPress,
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: iOS17Theme.animationDurations.normal,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...iOS17Theme.springConfigs.gentle,
      }),
    ]).start();
  }, []);

  const handleCardPress = (cardId: string, type: 'planet' | 'transit', data: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCard(selectedCard === cardId ? null : cardId);
    
    if (type === 'planet') {
      onPlanetPress?.(data);
    } else {
      onTransitPress?.(data);
    }
  };

  const renderCircularProgress = (progress: number, color: string, size: number = 40) => {
    const radius = (size - 4) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View style={[styles.progressContainer, { width: size, height: size }]}>
        <View style={[styles.progressBackground, { width: size, height: size, borderRadius: size / 2 }]} />
        <View
          style={[
            styles.progressFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
              borderWidth: 2,
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
        <View style={styles.progressText}>
          <Text style={[styles.progressPercentage, { color }]}>{Math.round(progress)}%</Text>
        </View>
      </View>
    );
  };

  const renderLinearProgress = (progress: number, color: string) => {
    return (
      <View style={styles.linearProgressContainer}>
        <View style={styles.linearProgressBackground} />
        <View
          style={[
            styles.linearProgressFill,
            {
              width: `${progress}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    );
  };

  const getIntensityColor = (intensity: 'low' | 'medium' | 'high') => {
    switch (intensity) {
      case 'low': return iOS17Theme.colors.systemGreen;
      case 'medium': return iOS17Theme.colors.systemOrange;
      case 'high': return iOS17Theme.colors.systemRed;
      default: return iOS17Theme.colors.systemBlue;
    }
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
      <Text style={styles.sectionTitle}>Cosmic Context</Text>
      
      <View style={styles.gridContainer}>
        {/* Planetary Positions Card */}
        <TouchableOpacity
          style={styles.widgetCard}
          onPress={() => handleCardPress('planets', 'planet', planets[0])}
          activeOpacity={0.7}
        >
          <BlurView
            intensity={15}
            tint="systemMaterial"
            style={styles.cardBlurView}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🪐</Text>
              <Text style={styles.cardTitle}>Planetary Positions</Text>
            </View>
            
            <View style={styles.planetsGrid}>
              {planets.slice(0, 4).map((planet, index) => (
                <View key={planet.name} style={styles.planetItem}>
                  {renderCircularProgress(planet.progress, planet.color, 32)}
                  <Text style={styles.planetName}>{planet.symbol}</Text>
                  {planet.isRetrograde && (
                    <View style={styles.retrogradeIndicator}>
                      <Text style={styles.retrogradeText}>Rx</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            
            <Text style={styles.cardFooter}>
              {planets.filter(p => p.isRetrograde).length} retrograde
            </Text>
          </BlurView>
        </TouchableOpacity>

        {/* Current Transits Card */}
        <TouchableOpacity
          style={styles.widgetCard}
          onPress={() => handleCardPress('transits', 'transit', transits[0])}
          activeOpacity={0.7}
        >
          <BlurView
            intensity={15}
            tint="systemMaterial"
            style={styles.cardBlurView}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🌊</Text>
              <Text style={styles.cardTitle}>Current Transits</Text>
            </View>
            
            <View style={styles.transitsList}>
              {transits.slice(0, 3).map((transit) => (
                <View key={transit.id} style={styles.transitItem}>
                  <View style={styles.transitInfo}>
                    <Text style={styles.transitPlanet}>{transit.symbol}</Text>
                    <Text style={styles.transitDescription}>
                      {transit.planet} → {transit.toSign}
                    </Text>
                  </View>
                  {renderLinearProgress(transit.progress, getIntensityColor(transit.intensity))}
                </View>
              ))}
            </View>
            
            <Text style={styles.cardFooter}>
              {transits.length} active transits
            </Text>
          </BlurView>
        </TouchableOpacity>

        {/* Moon Phase Card */}
        <TouchableOpacity
          style={styles.widgetCard}
          onPress={() => handleCardPress('moon', 'planet', planets.find(p => p.name === 'Moon'))}
          activeOpacity={0.7}
        >
          <BlurView
            intensity={15}
            tint="systemMaterial"
            style={styles.cardBlurView}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🌙</Text>
              <Text style={styles.cardTitle}>Moon Influence</Text>
            </View>
            
            <View style={styles.moonPhaseContainer}>
              <View style={styles.moonVisual}>
                <Text style={styles.moonSymbol}>🌕</Text>
              </View>
              <View style={styles.moonInfo}>
                <Text style={styles.moonPhase}>Full Moon</Text>
                <Text style={styles.moonInfluence}>Emotional intensity peaks</Text>
              </View>
            </View>
            
            <Text style={styles.cardFooter}>
              Peak energy in 2 days
            </Text>
          </BlurView>
        </TouchableOpacity>

        {/* Retrograde Alert Card */}
        <TouchableOpacity
          style={[styles.widgetCard, styles.alertCard]}
          onPress={() => handleCardPress('retrograde', 'planet', planets.filter(p => p.isRetrograde))}
          activeOpacity={0.7}
        >
          <BlurView
            intensity={15}
            tint="systemMaterial"
            style={styles.cardBlurView}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>⚠️</Text>
              <Text style={styles.cardTitle}>Retrograde Alert</Text>
            </View>
            
            <View style={styles.retrogradeList}>
              {planets.filter(p => p.isRetrograde).slice(0, 2).map((planet) => (
                <View key={planet.name} style={styles.retrogradeItem}>
                  <Text style={styles.retrogradePlanet}>{planet.symbol}</Text>
                  <Text style={styles.retrogradeName}>{planet.name}</Text>
                </View>
              ))}
            </View>
            
            <Text style={styles.cardFooter}>
              {planets.filter(p => p.isRetrograde).length} planets retrograde
            </Text>
          </BlurView>
        </TouchableOpacity>
      </View>
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  widgetCard: {
    width: (width - iOS17Theme.spacing.md * 3) / 2,
    marginBottom: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.large,
    overflow: 'hidden',
    ...iOS17Theme.shadows.medium,
  },
  alertCard: {
    borderWidth: 1,
    borderColor: iOS17Theme.colors.systemOrange + '40',
  },
  cardBlurView: {
    padding: iOS17Theme.spacing.md,
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.sm,
  },
  cardIcon: {
    fontSize: 16,
    marginRight: iOS17Theme.spacing.xs,
  },
  cardTitle: {
    ...iOS17Theme.typography.callout,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
    flex: 1,
  },
  cardFooter: {
    ...iOS17Theme.typography.caption2,
    color: iOS17Theme.colors.tertiaryLabel,
    marginTop: iOS17Theme.spacing.sm,
  },
  planetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  planetItem: {
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.sm,
    position: 'relative',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackground: {
    position: 'absolute',
    backgroundColor: iOS17Theme.colors.systemFill,
  },
  progressFill: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    ...iOS17Theme.typography.caption2,
    fontWeight: '600',
  },
  planetName: {
    ...iOS17Theme.typography.caption2,
    color: iOS17Theme.colors.label,
    marginTop: 2,
  },
  retrogradeIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: iOS17Theme.colors.systemRed,
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retrogradeText: {
    ...iOS17Theme.typography.caption2,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 8,
  },
  transitsList: {
    flex: 1,
  },
  transitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.xs,
  },
  transitInfo: {
    flex: 1,
    marginRight: iOS17Theme.spacing.xs,
  },
  transitPlanet: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  transitDescription: {
    ...iOS17Theme.typography.caption2,
    color: iOS17Theme.colors.secondaryLabel,
  },
  linearProgressContainer: {
    height: 4,
    width: 40,
    backgroundColor: iOS17Theme.colors.systemFill,
    borderRadius: 2,
    overflow: 'hidden',
  },
  linearProgressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: iOS17Theme.colors.systemFill,
  },
  linearProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  moonPhaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moonVisual: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: iOS17Theme.colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: iOS17Theme.spacing.sm,
  },
  moonSymbol: {
    fontSize: 20,
  },
  moonInfo: {
    flex: 1,
  },
  moonPhase: {
    ...iOS17Theme.typography.callout,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  moonInfluence: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.secondaryLabel,
  },
  retrogradeList: {
    flex: 1,
  },
  retrogradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.xs,
  },
  retrogradePlanet: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.systemOrange,
    fontWeight: '600',
    marginRight: iOS17Theme.spacing.xs,
  },
  retrogradeName: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.label,
  },
});

export default IOS17CosmicContext;
