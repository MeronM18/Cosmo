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

interface PlanetInfo {
  name: string;
  symbol: string;
  element: string;
  quality: string;
  description: string;
  keywords: string[];
}

interface HouseInfo {
  number: number;
  name: string;
  symbol: string;
  description: string;
  keywords: string[];
}

interface AspectInfo {
  name: string;
  degrees: number;
  symbol: string;
  description: string;
  color: string;
}

interface EducationalAstrologyProps {
  onClose?: () => void;
}

const EducationalAstrology: React.FC<EducationalAstrologyProps> = ({ onClose }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  const [activeSection, setActiveSection] = useState<'planets' | 'houses' | 'aspects'>('planets');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const planets: PlanetInfo[] = [
    {
      name: 'Sun',
      symbol: '☉',
      element: 'Fire',
      quality: 'Cardinal',
      description: 'Your core identity, ego, and life purpose. The Sun represents your conscious self and how you shine your light in the world.',
      keywords: ['Identity', 'Ego', 'Purpose', 'Vitality', 'Leadership']
    },
    {
      name: 'Moon',
      symbol: '☽',
      element: 'Water',
      quality: 'Cardinal',
      description: 'Your emotional nature, instincts, and subconscious patterns. The Moon shows how you nurture and are nurtured.',
      keywords: ['Emotions', 'Instincts', 'Nurturing', 'Subconscious', 'Habits']
    },
    {
      name: 'Mercury',
      symbol: '☿',
      element: 'Air',
      quality: 'Mutable',
      description: 'Communication, thinking patterns, and how you process information. Mercury governs your mental agility and learning style.',
      keywords: ['Communication', 'Thinking', 'Learning', 'Writing', 'Travel']
    },
    {
      name: 'Venus',
      symbol: '♀',
      element: 'Earth',
      quality: 'Fixed',
      description: 'Love, beauty, values, and relationships. Venus shows what you find attractive and how you express affection.',
      keywords: ['Love', 'Beauty', 'Values', 'Relationships', 'Art']
    },
    {
      name: 'Mars',
      symbol: '♂',
      element: 'Fire',
      quality: 'Cardinal',
      description: 'Action, energy, and drive. Mars represents your assertiveness, courage, and how you pursue your desires.',
      keywords: ['Action', 'Energy', 'Courage', 'Passion', 'Competition']
    }
  ];

  const houses: HouseInfo[] = [
    {
      number: 1,
      name: 'Ascendant',
      symbol: '↑',
      description: 'Your outward personality, first impressions, and physical appearance. How others see you.',
      keywords: ['Personality', 'Appearance', 'First Impressions', 'Self-Image']
    },
    {
      number: 2,
      name: 'Values & Resources',
      symbol: '💰',
      description: 'Your values, possessions, talents, and relationship with money and material security.',
      keywords: ['Money', 'Values', 'Talents', 'Possessions', 'Security']
    },
    {
      number: 3,
      name: 'Communication',
      symbol: '💬',
      description: 'Communication, siblings, short trips, and your immediate environment.',
      keywords: ['Communication', 'Siblings', 'Learning', 'Short Trips', 'Neighborhood']
    },
    {
      number: 4,
      name: 'Home & Family',
      symbol: '🏠',
      description: 'Your roots, family, home life, and emotional foundation.',
      keywords: ['Home', 'Family', 'Roots', 'Emotional Security', 'Private Life']
    },
    {
      number: 5,
      name: 'Creativity & Romance',
      symbol: '🎭',
      description: 'Creativity, romance, children, and self-expression.',
      keywords: ['Creativity', 'Romance', 'Children', 'Self-Expression', 'Pleasure']
    },
    {
      number: 6,
      name: 'Health & Service',
      symbol: '⚕️',
      description: 'Health, daily routines, work environment, and service to others.',
      keywords: ['Health', 'Work', 'Routines', 'Service', 'Pets']
    }
  ];

  const aspects: AspectInfo[] = [
    {
      name: 'Conjunction',
      degrees: 0,
      symbol: '☌',
      description: 'Planets in the same sign or very close together. Creates intense, focused energy.',
      color: '#FFD700'
    },
    {
      name: 'Sextile',
      degrees: 60,
      symbol: '⚹',
      description: 'Harmonious aspect that brings opportunities and easy flow of energy.',
      color: '#4CAF50'
    },
    {
      name: 'Square',
      degrees: 90,
      symbol: '□',
      description: 'Challenging aspect that creates tension and requires effort to resolve.',
      color: '#FF9800'
    },
    {
      name: 'Trine',
      degrees: 120,
      symbol: '△',
      description: 'Very harmonious aspect that brings natural talents and easy success.',
      color: '#2196F3'
    },
    {
      name: 'Opposition',
      degrees: 180,
      symbol: '☍',
      description: 'Planets directly opposite each other, creating tension and need for balance.',
      color: '#F44336'
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [activeSection]);

  const handleSectionPress = (section: 'planets' | 'houses' | 'aspects') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSection(section);
    setSelectedItem(null);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleItemPress = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedItem(item);
  };

  const renderPlanets = () => (
    <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
        {planets.map((planet, index) => (
          <TouchableOpacity
            key={planet.name}
            style={styles.planetCard}
            onPress={() => handleItemPress(planet)}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(139, 95, 191, 0.08)']}
              style={styles.cardGradient}
            >
              <Text style={styles.planetSymbol}>{planet.symbol}</Text>
              <Text style={[styles.planetName, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
                {planet.name}
              </Text>
              <Text style={styles.planetElement}>{planet.element}</Text>
              <Text style={styles.planetQuality}>{planet.quality}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderHouses = () => (
    <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
      <View style={styles.housesGrid}>
        {houses.map((house) => (
          <TouchableOpacity
            key={house.number}
            style={styles.houseCard}
            onPress={() => handleItemPress(house)}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(139, 95, 191, 0.08)']}
              style={styles.cardGradient}
            >
              <Text style={styles.houseNumber}>{house.number}</Text>
              <Text style={styles.houseSymbol}>{house.symbol}</Text>
              <Text style={[styles.houseName, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
                {house.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderAspects = () => (
    <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
      <View style={styles.aspectsContainer}>
        {aspects.map((aspect) => (
          <TouchableOpacity
            key={aspect.name}
            style={styles.aspectCard}
            onPress={() => handleItemPress(aspect)}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(139, 95, 191, 0.08)']}
              style={styles.cardGradient}
            >
              <View style={styles.aspectHeader}>
                <Text style={styles.aspectSymbol}>{aspect.symbol}</Text>
                <View style={[styles.aspectLine, { backgroundColor: aspect.color }]} />
              </View>
              <Text style={[styles.aspectName, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
                {aspect.name}
              </Text>
              <Text style={styles.aspectDegrees}>{aspect.degrees}°</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderItemDetails = () => {
    if (!selectedItem) return null;

    return (
      <View style={styles.detailsContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.08)', 'rgba(139, 95, 191, 0.08)']}
          style={styles.detailsGradient}
        >
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsSymbol}>
              {selectedItem.symbol || selectedItem.number}
            </Text>
            <View style={styles.detailsInfo}>
              <Text style={[styles.detailsTitle, fontsLoaded && { fontFamily: 'Cinzel_400Regular' }]}>
                {selectedItem.name}
              </Text>
              {selectedItem.element && (
                <Text style={styles.detailsSubtitle}>
                  {selectedItem.element} • {selectedItem.quality}
                </Text>
              )}
              {selectedItem.degrees !== undefined && (
                <Text style={styles.detailsSubtitle}>
                  {selectedItem.degrees}° Aspect
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedItem(null)}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.detailsDescription}>
            {selectedItem.description}
          </Text>

          <View style={styles.keywordsContainer}>
            <Text style={styles.keywordsTitle}>Keywords:</Text>
            <View style={styles.keywordsList}>
              {selectedItem.keywords?.map((keyword: string, index: number) => (
                <View key={index} style={styles.keywordTag}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
          Learn Astrology
        </Text>
        {onClose && (
          <TouchableOpacity style={styles.closeHeaderButton} onPress={onClose}>
            <Text style={styles.closeHeaderIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Section Navigation */}
      <View style={styles.sectionNav}>
        <TouchableOpacity
          style={[styles.sectionButton, activeSection === 'planets' && styles.sectionButtonActive]}
          onPress={() => handleSectionPress('planets')}
        >
          <Text style={[styles.sectionButtonText, activeSection === 'planets' && styles.sectionButtonTextActive]}>
            Planets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionButton, activeSection === 'houses' && styles.sectionButtonActive]}
          onPress={() => handleSectionPress('houses')}
        >
          <Text style={[styles.sectionButtonText, activeSection === 'houses' && styles.sectionButtonTextActive]}>
            Houses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionButton, activeSection === 'aspects' && styles.sectionButtonActive]}
          onPress={() => handleSectionPress('aspects')}
        >
          <Text style={[styles.sectionButtonText, activeSection === 'aspects' && styles.sectionButtonTextActive]}>
            Aspects
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeSection === 'planets' && renderPlanets()}
      {activeSection === 'houses' && renderHouses()}
      {activeSection === 'aspects' && renderAspects()}

      {/* Item Details */}
      {renderItemDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  closeHeaderButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeHeaderIcon: {
    color: '#B8A9C9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  sectionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  sectionButtonActive: {
    backgroundColor: '#8A4FFF',
  },
  sectionButtonText: {
    fontSize: 14,
    color: '#B8A9C9',
    fontWeight: '600',
  },
  sectionButtonTextActive: {
    color: '#FFFFFF',
  },
  contentContainer: {
    marginBottom: 20,
  },
  scrollContainer: {
    marginBottom: 16,
  },
  planetCard: {
    width: 100,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  houseCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  aspectCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
  },
  planetSymbol: {
    fontSize: 24,
    marginBottom: 8,
  },
  planetName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  planetElement: {
    fontSize: 12,
    color: '#FFD700',
    marginBottom: 2,
  },
  planetQuality: {
    fontSize: 10,
    color: '#B8A9C9',
  },
  housesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  houseNumber: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  houseSymbol: {
    fontSize: 18,
    marginBottom: 8,
  },
  houseName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  aspectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  aspectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aspectSymbol: {
    fontSize: 18,
    marginRight: 8,
  },
  aspectLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  aspectName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  aspectDegrees: {
    fontSize: 12,
    color: '#B8A9C9',
  },
  detailsContainer: {
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
  detailsDescription: {
    fontSize: 14,
    color: '#B8A9C9',
    lineHeight: 20,
    marginBottom: 16,
  },
  keywordsContainer: {
    marginTop: 8,
  },
  keywordsTitle: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 8,
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  keywordText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
});

export default EducationalAstrology;
