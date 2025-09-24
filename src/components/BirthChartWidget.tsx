import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Animated,
  PanResponder,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Planet {
  name: string;
  symbol: string;
  angle: number; // in degrees
  house: number;
  sign: string;
  isRetrograde: boolean;
}

interface BirthChartWidgetProps {
  planets: Planet[];
  onPlanetPress?: (planet: Planet) => void;
}

const BirthChartWidget: React.FC<BirthChartWidgetProps> = ({ planets, onPlanetPress }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [rotation, setRotation] = useState(0);
  const rotationAnim = useRef(new Animated.Value(0)).current;

  // Zodiac sign to image mapping
  const zodiacSignImages = {
    'Aries': require('../../assets/aries.png'),
    'Taurus': require('../../assets/taurus.png'),
    'Gemini': require('../../assets/gemini.png'),
    'Cancer': require('../../assets/cancer.png'),
    'Leo': require('../../assets/leo.png'),
    'Virgo': require('../../assets/virgo.png'),
    'Libra': require('../../assets/libra.png'),
    'Scorpio': require('../../assets/scorpio.png'),
    'Sagittarius': require('../../assets/sagittarius.png'),
    'Capricorn': require('../../assets/capricorn.png'),
    'Aquarius': require('../../assets/aquarius.png'),
    'Pisces': require('../../assets/pisces.png'),
  };

  const chartSize = 200;
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const radius = 80;

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const houseNumbers = [
    '1', '2', '3', '4', '5', '6',
    '7', '8', '9', '10', '11', '12'
  ];

  useEffect(() => {
    Animated.timing(rotationAnim, {
      toValue: rotation,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [rotation]);

  const getPlanetPosition = (angle: number) => {
    const radian = (angle * Math.PI) / 180;
    const x = centerX + radius * Math.cos(radian);
    const y = centerY + radius * Math.sin(radian);
    return { x, y };
  };

  const getHousePosition = (houseIndex: number) => {
    const angle = (houseIndex * 30) - 15; // Offset to center houses
    const radian = (angle * Math.PI) / 180;
    const x = centerX + (radius + 20) * Math.cos(radian);
    const y = centerY + (radius + 20) * Math.sin(radian);
    return { x, y };
  };

  const getZodiacPosition = (signIndex: number) => {
    const angle = (signIndex * 30) - 15; // Offset to center signs
    const radian = (angle * Math.PI) / 180;
    const x = centerX + (radius - 20) * Math.cos(radian);
    const y = centerY + (radius - 20) * Math.sin(radian);
    return { x, y };
  };

  const handlePlanetPress = (planet: Planet) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPlanet(planet);
    onPlanetPress?.(planet);
  };

  const rotateChart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRotation(prev => prev + 30);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
        Your Birth Chart
      </Text>
      
      <View style={styles.chartContainer}>
        <View style={[styles.chart, { width: chartSize, height: chartSize }]}>
          {/* Outer circle for zodiac signs */}
          <View style={[styles.outerCircle, { width: chartSize, height: chartSize }]}>
            {zodiacSigns.map((sign, index) => {
              const position = getZodiacPosition(index);
              return (
                <Image
                  key={index}
                  source={zodiacSignImages[sign as keyof typeof zodiacSignImages]}
                  style={[
                    styles.zodiacSign,
                    {
                      position: 'absolute',
                      left: position.x - 10,
                      top: position.y - 10,
                    }
                  ]}
                  resizeMode="contain"
                />
              );
            })}
          </View>

          {/* Middle circle for houses */}
          <View style={[styles.middleCircle, { width: chartSize, height: chartSize }]}>
            {houseNumbers.map((house, index) => {
              const position = getHousePosition(index);
              return (
                <Text
                  key={index}
                  style={[
                    styles.houseNumber,
                    {
                      position: 'absolute',
                      left: position.x - 8,
                      top: position.y - 8,
                    }
                  ]}
                >
                  {house}
                </Text>
              );
            })}
          </View>

          {/* House division lines */}
          {Array.from({ length: 12 }, (_, index) => {
            const angle = index * 30;
            const radian = (angle * Math.PI) / 180;
            const x1 = centerX + (radius - 30) * Math.cos(radian);
            const y1 = centerY + (radius - 30) * Math.sin(radian);
            const x2 = centerX + (radius + 30) * Math.cos(radian);
            const y2 = centerY + (radius + 30) * Math.sin(radian);
            
            return (
              <View
                key={index}
                style={[
                  styles.houseLine,
                  {
                    position: 'absolute',
                    left: x1,
                    top: y1,
                    width: Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
                    transform: [{ rotate: `${angle}deg` }],
                  }
                ]}
              />
            );
          })}

          {/* Planets */}
          {planets.map((planet, index) => {
            const position = getPlanetPosition(planet.angle);
            return (
              <TouchableOpacity
                key={planet.name}
                style={[
                  styles.planetButton,
                  {
                    position: 'absolute',
                    left: position.x - 15,
                    top: position.y - 15,
                  },
                  selectedPlanet?.name === planet.name && styles.planetButtonSelected
                ]}
                onPress={() => handlePlanetPress(planet)}
              >
                <Text style={styles.planetSymbol}>{planet.symbol}</Text>
                {planet.isRetrograde && (
                  <Text style={styles.retrogradeIndicator}>R</Text>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Center point */}
          <View style={[styles.centerPoint, { left: centerX - 3, top: centerY - 3 }]} />
        </View>

        {/* Rotation button */}
        <TouchableOpacity style={styles.rotateButton} onPress={rotateChart}>
          <Text style={styles.rotateIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Planet details */}
      {selectedPlanet && (
        <View style={styles.planetDetails}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(139, 95, 191, 0.08)']}
            style={styles.planetDetailsGradient}
          >
            <View style={styles.planetDetailsHeader}>
              <Text style={styles.planetDetailsSymbol}>{selectedPlanet.symbol}</Text>
              <View style={styles.planetDetailsInfo}>
                <Text style={[styles.planetDetailsName, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
                  {selectedPlanet.name}
                </Text>
                <Text style={styles.planetDetailsSign}>
                  in {selectedPlanet.sign} • House {selectedPlanet.house}
                </Text>
                {selectedPlanet.isRetrograde && (
                  <Text style={styles.planetDetailsRetrograde}>Retrograde</Text>
                )}
              </View>
            </View>
            <Text style={styles.planetDetailsDescription}>
              This planet's position influences your {selectedPlanet.name.toLowerCase()} energy and how you express this aspect of your personality.
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Aspect lines (simplified representation) */}
      <View style={styles.aspectsContainer}>
        <Text style={[styles.aspectsTitle, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
          Key Aspects
        </Text>
        <View style={styles.aspectsList}>
          <View style={styles.aspectItem}>
            <View style={[styles.aspectLine, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.aspectText}>Trine - Harmonious</Text>
          </View>
          <View style={styles.aspectItem}>
            <View style={[styles.aspectLine, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.aspectText}>Square - Challenging</Text>
          </View>
          <View style={styles.aspectItem}>
            <View style={[styles.aspectLine, { backgroundColor: '#F44336' }]} />
            <Text style={styles.aspectText}>Opposition - Tension</Text>
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
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  middleCircle: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  zodiacSign: {
    width: 20,
    height: 20,
  },
  houseNumber: {
    fontSize: 12,
    color: '#B8A9C9',
    fontWeight: '600',
  },
  houseLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  planetButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  planetButtonSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderColor: '#FFD700',
  },
  planetSymbol: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  retrogradeIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    fontSize: 8,
    color: '#FF6B9D',
    fontWeight: 'bold',
  },
  centerPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
  },
  rotateButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotateIcon: {
    fontSize: 18,
  },
  planetDetails: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  planetDetailsGradient: {
    padding: 16,
  },
  planetDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planetDetailsSymbol: {
    fontSize: 24,
    marginRight: 12,
  },
  planetDetailsInfo: {
    flex: 1,
  },
  planetDetailsName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  planetDetailsSign: {
    fontSize: 12,
    color: '#B8A9C9',
    marginBottom: 2,
  },
  planetDetailsRetrograde: {
    fontSize: 10,
    color: '#FF6B9D',
    fontWeight: 'bold',
  },
  planetDetailsDescription: {
    fontSize: 14,
    color: '#B8A9C9',
    lineHeight: 20,
  },
  aspectsContainer: {
    marginBottom: 20,
  },
  aspectsTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  aspectsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  aspectItem: {
    alignItems: 'center',
  },
  aspectLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginBottom: 4,
  },
  aspectText: {
    fontSize: 10,
    color: '#B8A9C9',
    textAlign: 'center',
  },
});

export default BirthChartWidget;
