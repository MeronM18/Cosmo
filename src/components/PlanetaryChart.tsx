import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Planet {
  name: string;
  symbol: string;
  sign: string;
  house: number;
  isRetrograde: boolean;
  influence: string;
  color: string;
}

interface PlanetaryChartProps {
  planets: Planet[];
  onPlanetPress?: (planet: Planet) => void;
}

const PlanetaryChart: React.FC<PlanetaryChartProps> = ({ planets, onPlanetPress }) => {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);

  // Zodiac sign to image mapping
  const zodiacSignImages = {
    'ARI': require('../../assets/aries.png'),
    'TAU': require('../../assets/taurus.png'),
    'GEM': require('../../assets/gemini.png'),
    'CAN': require('../../assets/cancer.png'),
    'LEO': require('../../assets/leo.png'),
    'VIR': require('../../assets/virgo.png'),
    'LIB': require('../../assets/libra.png'),
    'SCO': require('../../assets/scorpio.png'),
    'SAG': require('../../assets/sagittarius.png'),
    'CAP': require('../../assets/capricorn.png'),
    'AQU': require('../../assets/aquarius.png'),
    'PIS': require('../../assets/pisces.png'),
  };

  const defaultPlanets: Planet[] = [
    {
      name: 'Sun',
      symbol: 'SUN',
      sign: 'Scorpio',
      house: 1,
      isRetrograde: false,
      influence: 'Your core identity and life purpose shine brightly today',
      color: '#FFD700'
    },
    {
      name: 'Moon',
      symbol: 'MOON',
      sign: 'Cancer',
      house: 4,
      isRetrograde: false,
      influence: 'Emotional intuition guides your decisions',
      color: '#E8E8E8'
    },
    {
      name: 'Mercury',
      symbol: 'MERC',
      sign: 'Sagittarius',
      house: 2,
      isRetrograde: true,
      influence: 'Communication may require extra patience',
      color: '#FFA500'
    },
    {
      name: 'Venus',
      symbol: 'VEN',
      sign: 'Libra',
      house: 1,
      isRetrograde: false,
      influence: 'Love and beauty surround you',
      color: '#FF69B4'
    },
    {
      name: 'Mars',
      symbol: 'MARS',
      sign: 'Capricorn',
      house: 9,
      isRetrograde: false,
      influence: 'Take action on your ambitious goals',
      color: '#FF4500'
    },
  ];

  const planetsToShow = planets.length > 0 ? planets : defaultPlanets;

  const handlePlanetPress = (planet: Planet) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPlanet(planet);
    onPlanetPress?.(planet);
  };

  const getHouseDescription = (house: number): string => {
    const houseDescriptions: { [key: number]: string } = {
      1: 'Self & Identity',
      2: 'Values & Money',
      3: 'Communication',
      4: 'Home & Family',
      5: 'Creativity & Romance',
      6: 'Health & Work',
      7: 'Relationships',
      8: 'Transformation',
      9: 'Philosophy & Travel',
      10: 'Career & Status',
      11: 'Friends & Dreams',
      12: 'Spirituality'
    };
    return houseDescriptions[house] || 'Unknown';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Planetary Positions</Text>
      
      {/* Simplified Birth Chart Circle */}
      <View style={styles.chartContainer}>
        <View style={styles.chartCircle}>
          {/* Zodiac Sign Markers */}
          {['ARI', 'TAU', 'GEM', 'CAN', 'LEO', 'VIR', 'LIB', 'SCO', 'SAG', 'CAP', 'AQU', 'PIS'].map((sign, index) => {
            const angle = (index * 30) - 90; // Start from top
            const radian = (angle * Math.PI) / 180;
            const radius = 85;
            const x = radius * Math.cos(radian);
            const y = radius * Math.sin(radian);
            
            return (
              <View
                key={sign}
                style={[
                  styles.zodiacMarker,
                  {
                    transform: [
                      { translateX: x },
                      { translateY: y }
                    ]
                  }
                ]}
              >
                <Image 
                  source={zodiacSignImages[sign as keyof typeof zodiacSignImages]} 
                  style={styles.zodiacImage}
                  resizeMode="contain"
                />
              </View>
            );
          })}
          
          
          {/* Center */}
          <View style={styles.centerDot} />
        </View>
      </View>

      {/* Planet Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.planetsScroll}
        contentContainerStyle={styles.planetsScrollContent}
      >
        {planetsToShow.map((planet, index) => (
          <TouchableOpacity
            key={planet.name}
            style={styles.planetCard}
            onPress={() => handlePlanetPress(planet)}
          >
            <LinearGradient
              colors={[planet.color + '20', planet.color + '40']}
              style={styles.planetCardGradient}
            >
              <View style={styles.planetCardHeader}>
                <View style={[styles.planetIcon, { backgroundColor: planet.color }]}>
                  <Text style={styles.planetCardSymbol}>{planet.symbol}</Text>
                </View>
                {planet.isRetrograde && (
                  <View style={styles.retrogradeTag}>
                    <Text style={styles.retrogradeTagText}>Rx</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.planetName}>{planet.name}</Text>
              <Text style={styles.planetSign}>in {planet.sign}</Text>
              <Text style={styles.planetHouse}>House {planet.house}</Text>
              
              <View style={styles.influenceContainer}>
                <Text style={styles.influenceText} numberOfLines={2}>
                  {planet.influence}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected Planet Details */}
      {selectedPlanet && (
        <View style={styles.detailsContainer}>
          <LinearGradient
            colors={[selectedPlanet.color + '15', selectedPlanet.color + '25']}
            style={styles.detailsGradient}
          >
            <View style={styles.detailsHeader}>
              <View style={[styles.detailsIcon, { backgroundColor: selectedPlanet.color }]}>
                <Text style={styles.detailsSymbol}>{selectedPlanet.symbol}</Text>
              </View>
              <View style={styles.detailsInfo}>
                <Text style={styles.detailsTitle}>{selectedPlanet.name}</Text>
                <Text style={styles.detailsSubtitle}>
                  {selectedPlanet.sign} • {getHouseDescription(selectedPlanet.house)}
                </Text>
                {selectedPlanet.isRetrograde && (
                  <Text style={styles.detailsRetrograde}>Currently Retrograde</Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.closeDetails}
                onPress={() => setSelectedPlanet(null)}
              >
                <Text style={styles.closeDetailsText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.detailsInfluence}>{selectedPlanet.influence}</Text>
            
            <View style={styles.detailsStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Sign</Text>
                <Text style={styles.statValue}>{selectedPlanet.sign}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>House</Text>
                <Text style={styles.statValue}>{selectedPlanet.house}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Motion</Text>
                <Text style={styles.statValue}>
                  {selectedPlanet.isRetrograde ? 'Retrograde' : 'Direct'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Quick Info */}
      <View style={styles.quickInfo}>
        <Text style={styles.quickInfoTitle}>Quick Planetary Summary</Text>
        <View style={styles.quickInfoStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatNumber}>
              {planetsToShow.filter(p => p.isRetrograde).length}
            </Text>
            <Text style={styles.quickStatLabel}>Retrograde</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatNumber}>{planetsToShow.length}</Text>
            <Text style={styles.quickStatLabel}>Planets</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatNumber}>
              {new Set(planetsToShow.map(p => p.sign)).size}
            </Text>
            <Text style={styles.quickStatLabel}>Signs</Text>
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
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  chartCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  zodiacMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacImage: {
    width: 20,
    height: 20,
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  planetsScroll: {
    marginBottom: 20,
  },
  planetsScrollContent: {
    paddingHorizontal: 16,
  },
  planetCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  planetCardGradient: {
    padding: 16,
    minHeight: 160,
  },
  planetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planetIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetCardSymbol: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  retrogradeTag: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  retrogradeTagText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  planetName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  planetSign: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 2,
  },
  planetHouse: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  influenceContainer: {
    flex: 1,
  },
  influenceText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  detailsContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  detailsGradient: {
    padding: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsSymbol: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  detailsInfo: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  detailsSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailsRetrograde: {
    fontSize: 12,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  closeDetails: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeDetailsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsInfluence: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 16,
    opacity: 0.9,
  },
  detailsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quickInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
  },
  quickInfoTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  quickInfoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: '700',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default PlanetaryChart;
