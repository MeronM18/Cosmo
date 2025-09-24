import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Transit {
  id: string;
  planet: string;
  symbol: string;
  fromSign: string;
  toSign: string;
  progress: number; // 0-100
  startDate: string;
  endDate: string;
  influence: string;
  intensity: 'low' | 'medium' | 'high';
}

interface TransitsDisplayProps {
  transits: Transit[];
  onTransitPress?: (transit: Transit) => void;
}

const TransitsDisplay: React.FC<TransitsDisplayProps> = ({ transits, onTransitPress }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  const [selectedTransit, setSelectedTransit] = useState<Transit | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return '#FF6B9D';
      case 'medium': return '#FFA726';
      case 'low': return '#4CAF50';
      default: return '#B8A9C9';
    }
  };

  const getIntensityIcon = (intensity: string) => {
    switch (intensity) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '✨';
      default: return '⭐';
    }
  };

  const handleTransitPress = (transit: Transit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTransit(transit);
    onTransitPress?.(transit);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
        Current Transits
      </Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timelineContainer}
        contentContainerStyle={styles.timelineContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Timeline background */}
        <View style={styles.timelineBackground}>
          <View style={styles.timelineLine} />
          
          {/* Transit markers */}
          {transits.map((transit, index) => {
            const position = (index / (transits.length - 1)) * (width - 100);
            return (
              <View
                key={transit.id}
                style={[
                  styles.transitMarker,
                  {
                    left: position,
                    backgroundColor: getIntensityColor(transit.intensity),
                  }
                ]}
              >
                <Text style={styles.transitSymbol}>{transit.symbol}</Text>
              </View>
            );
          })}
        </View>

        {/* Transit cards */}
        {transits.map((transit, index) => (
          <TouchableOpacity
            key={transit.id}
            style={styles.transitCard}
            onPress={() => handleTransitPress(transit)}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(139, 95, 191, 0.08)']}
              style={styles.transitGradient}
            >
              <View style={styles.transitHeader}>
                <View style={styles.transitPlanet}>
                  <Text style={styles.transitSymbolLarge}>{transit.symbol}</Text>
                  <Text style={[styles.transitPlanetName, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
                    {transit.planet}
                  </Text>
                </View>
                <View style={styles.transitIntensity}>
                  <Text style={styles.intensityIcon}>
                    {getIntensityIcon(transit.intensity)}
                  </Text>
                  <Text style={[styles.intensityText, { color: getIntensityColor(transit.intensity) }]}>
                    {transit.intensity.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.transitMovement}>
                <Text style={styles.movementText}>
                  {transit.fromSign} → {transit.toSign}
                </Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${transit.progress}%`,
                          backgroundColor: getIntensityColor(transit.intensity)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{transit.progress}%</Text>
                </View>
              </View>

              <Text style={styles.transitInfluence}>
                {transit.influence}
              </Text>

              <View style={styles.transitDates}>
                <Text style={styles.dateText}>
                  {transit.startDate} - {transit.endDate}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected transit details */}
      {selectedTransit && (
        <View style={styles.transitDetails}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(139, 95, 191, 0.08)']}
            style={styles.detailsGradient}
          >
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsSymbol}>{selectedTransit.symbol}</Text>
              <View style={styles.detailsInfo}>
                <Text style={[styles.detailsTitle, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
                  {selectedTransit.planet} Transit
                </Text>
                <Text style={styles.detailsSubtitle}>
                  {selectedTransit.fromSign} → {selectedTransit.toSign}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedTransit(null)}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContent}>
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Current Progress</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${selectedTransit.progress}%`,
                          backgroundColor: getIntensityColor(selectedTransit.intensity)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{selectedTransit.progress}% Complete</Text>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Influence</Text>
                <Text style={styles.influenceText}>
                  {selectedTransit.influence}
                </Text>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Duration</Text>
                <Text style={styles.durationText}>
                  {selectedTransit.startDate} - {selectedTransit.endDate}
                </Text>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Intensity</Text>
                <View style={styles.intensityDisplay}>
                  <Text style={styles.intensityIconLarge}>
                    {getIntensityIcon(selectedTransit.intensity)}
                  </Text>
                  <Text style={[styles.intensityTextLarge, { color: getIntensityColor(selectedTransit.intensity) }]}>
                    {selectedTransit.intensity.toUpperCase()} IMPACT
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Transit summary */}
      <View style={styles.summaryContainer}>
        <Text style={[styles.summaryTitle, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
          Transit Summary
        </Text>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{transits.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {transits.filter(t => t.intensity === 'high').length}
            </Text>
            <Text style={styles.statLabel}>High Impact</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.round(transits.reduce((acc, t) => acc + t.progress, 0) / transits.length)}%
            </Text>
            <Text style={styles.statLabel}>Avg Progress</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  timelineContainer: {
    marginBottom: 20,
  },
  timelineContent: {
    paddingHorizontal: 20,
  },
  timelineBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
  },
  timelineLine: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
  },
  transitMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    top: 20,
  },
  transitSymbol: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  transitCard: {
    width: 160,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  transitGradient: {
    padding: 16,
    minHeight: 140,
  },
  transitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transitPlanet: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transitSymbolLarge: {
    fontSize: 18,
    marginRight: 6,
  },
  transitPlanetName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  transitIntensity: {
    alignItems: 'center',
  },
  intensityIcon: {
    fontSize: 12,
    marginBottom: 2,
  },
  intensityText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  transitMovement: {
    marginBottom: 12,
  },
  movementText: {
    fontSize: 12,
    color: '#B8A9C9',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#B8A9C9',
    fontWeight: '600',
  },
  transitInfluence: {
    fontSize: 11,
    color: '#B8A9C9',
    lineHeight: 16,
    marginBottom: 8,
  },
  transitDates: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 10,
    color: '#8B7A9B',
  },
  transitDetails: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  detailsGradient: {
    padding: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsSymbol: {
    fontSize: 24,
    marginRight: 12,
  },
  detailsInfo: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailsSubtitle: {
    fontSize: 14,
    color: '#B8A9C9',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: '#B8A9C9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContent: {
    gap: 16,
  },
  detailsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 8,
  },
  influenceText: {
    fontSize: 14,
    color: '#B8A9C9',
    lineHeight: 20,
  },
  durationText: {
    fontSize: 14,
    color: '#B8A9C9',
  },
  intensityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intensityIconLarge: {
    fontSize: 20,
    marginRight: 8,
  },
  intensityTextLarge: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#B8A9C9',
  },
});

export default TransitsDisplay;
