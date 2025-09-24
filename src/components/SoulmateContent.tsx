import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Animated,
  TextInput,
  Alert,
  Image,
  PanResponder,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';
import { AppColors } from '../theme/appTheme';
import PartnerOnboardingFlow from './PartnerOnboardingFlow';

const { width, height } = Dimensions.get('window');

interface SoulmateContentProps {
  userData: {
    name: string;
    zodiacSign: string;
    isPremium: boolean;
    readingStreak: number;
    cosmicRating: number;
    luckyNumbers: number[];
    compatibleSigns: string[];
  };
  onScroll?: (event: any) => void;
}

const SoulmateContent: React.FC<SoulmateContentProps> = ({ userData, onScroll }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  // State management
  const [partnerData, setPartnerData] = useState({
    name: '',
    zodiacSign: '',
    birthDate: '',
    birthTime: '',
    birthLocation: ''
  });
  const [relationshipType, setRelationshipType] = useState('dating');
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedConnections, setSavedConnections] = useState<any[]>([]);
  const [compatibilityHistory, setCompatibilityHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSynastryChart, setShowSynastryChart] = useState(false);
  const [currentView, setCurrentView] = useState('checker'); // checker, results, history, chart
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [backgroundParticles, setBackgroundParticles] = useState<any[]>([]);
  const [shootingStars, setShootingStars] = useState<any[]>([]);
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [showOnboardingFlow, setShowOnboardingFlow] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const heartPulseAnim = useRef(new Animated.Value(1)).current;
  const compatibilityAnim = useRef(new Animated.Value(0)).current;
  const parallaxAnim1 = useRef(new Animated.Value(0)).current;
  const parallaxAnim2 = useRef(new Animated.Value(0)).current;
  const parallaxAnim3 = useRef(new Animated.Value(0)).current;
  const breathingAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const quantumAnim = useRef(new Animated.Value(0)).current;
  const hologramAnim = useRef(new Animated.Value(0)).current;
  const sphereRotateX = useRef(new Animated.Value(0)).current;
  const sphereRotateY = useRef(new Animated.Value(0)).current;
  const constellationAnim = useRef(new Animated.Value(0)).current;

  const relationshipTypes = [
    { id: 'dating', label: 'Dating', icon: '💕', gradient: ['#FF6B9D', '#FF8E9B'] },
    { id: 'marriage', label: 'Marriage', icon: '💍', gradient: ['#8A4FFF', '#A855F7'] },
    { id: 'friendship', label: 'Friendship', icon: '🤝', gradient: ['#06B6D4', '#3B82F6'] },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', gradient: ['#F59E0B', '#F97316'] },
    { id: 'colleagues', label: 'Colleagues', icon: '💼', gradient: ['#6B7280', '#9CA3AF'] }
  ];

  const compatibilityCategories = [
    { id: 'communication', label: 'Communication', icon: '💬', color: '#3B82F6' },
    { id: 'emotional', label: 'Emotional Bond', icon: '💖', color: '#EC4899' },
    { id: 'values', label: 'Shared Values', icon: '🧭', color: '#F59E0B' },
    { id: 'growth', label: 'Growth Potential', icon: '📈', color: '#10B981' },
    { id: 'fun', label: 'Fun & Play', icon: '⭐', color: '#F97316' },
    { id: 'conflict', label: 'Conflict Resolution', icon: '⚖️', color: '#8B5CF6' }
  ];

  // Initialize particle system
  useEffect(() => {
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.5 + 0.1,
      direction: Math.random() * Math.PI * 2,
    }));
    setBackgroundParticles(particles);

    // Initialize shooting stars
    const stars = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: -100,
      y: Math.random() * height,
      length: Math.random() * 100 + 50,
      speed: Math.random() * 2 + 1,
      opacity: 0,
    }));
    setShootingStars(stars);
  }, []);

  // Entrance animations with cinematic sequence
  useEffect(() => {
    // Staggered entrance sequence
    Animated.sequence([
      // Phase 1: Background emergence
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
      // Phase 2: UI elements ascend
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(quantumAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Advanced animation systems
  useEffect(() => {
    // Heart pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(heartPulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(heartPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Breathing universe animation
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1.05,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    );

    // Constellation animation
    const constellationAnimation = Animated.loop(
      Animated.timing(constellationAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    // Hologram shimmer effect
    const hologramAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(hologramAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(hologramAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    breathingAnimation.start();
    constellationAnimation.start();
    hologramAnimation.start();

    return () => {
      pulseAnimation.stop();
      breathingAnimation.stop();
      constellationAnimation.stop();
      hologramAnimation.stop();
    };
  }, []);

  // Shooting star animation disabled for static background

  // Touch ripple effect
  const createRipple = useCallback((x: number, y: number) => {
    setTouchPosition({ x, y });
    Animated.sequence([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = (newPartnerData: any) => {
    // Update partner data with the new information
    setPartnerData({
      name: newPartnerData.name,
      zodiacSign: '', // Will be calculated from birth date
      birthDate: newPartnerData.birthDate,
      birthTime: newPartnerData.birthTime,
      birthLocation: newPartnerData.birthLocation
    });
    
    // Set relationship type
    setRelationshipType(newPartnerData.connectionType);
    
    // Automatically start compatibility analysis
    setTimeout(() => {
      analyzeCompatibility();
    }, 500);
  };

  // Ultra-premium compatibility analysis
  const analyzeCompatibility = async () => {
    if (!partnerData.name || !partnerData.zodiacSign) {
      Alert.alert('Missing Information', 'Please fill in your partner\'s name and zodiac sign.');
      return;
    }

    setIsAnalyzing(true);
    setCurrentView('results');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Quantum loading sequence
    Animated.sequence([
      Animated.timing(quantumAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(quantumAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate advanced analysis delay with constellation formation
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Enhanced mock compatibility data with advanced insights
    const mockResult = {
      overallScore: Math.floor(Math.random() * 30) + 70, // 70-100%
      categories: compatibilityCategories.map(cat => ({
        ...cat,
        score: Math.floor(Math.random() * 30) + 70,
        trend: Math.random() > 0.5 ? 'increasing' : 'stable',
        peak: Math.floor(Math.random() * 20) + 80
      })),
      insights: [
        "Your communication styles create a beautiful harmonic resonance.",
        "There's a profound emotional telepathy between your signs.",
        "You both share a cosmic vision for personal evolution.",
        "Your differences form a perfect yin-yang dynamic."
      ],
      challenges: [
        "Different conflict resolution styles require conscious navigation.",
        "Emotional expression patterns may need gentle adjustment."
      ],
      recommendations: [
        "Establish cosmic check-ins during new moon phases.",
        "Explore shared spiritual practices to deepen connection.",
        "Practice quantum listening - hearing beyond words."
      ],
      synastry: {
        sunAspect: "Trine",
        moonAspect: "Sextile", 
        venusAspect: "Conjunction",
        marsAspect: "Square"
      },
      composite: {
        sunSign: "Leo",
        moonSign: "Pisces",
        risingSign: "Sagittarius"
      },
      timing: {
        bestTimes: ["New Moon", "Venus Transit", "Jupiter Return"],
        challengingTimes: ["Mercury Retrograde", "Mars Square"]
      }
    };

    setCompatibilityResult(mockResult);
    setIsAnalyzing(false);

    // Add to history
    const historyEntry = {
      id: Date.now(),
      date: new Date(),
      partnerName: partnerData.name,
      partnerSign: partnerData.zodiacSign,
      relationshipType,
      score: mockResult.overallScore,
      result: mockResult
    };
    setCompatibilityHistory(prev => [historyEntry, ...prev]);

    // Spectacular result reveal animation
    Animated.parallel([
      Animated.timing(compatibilityAnim, {
        toValue: mockResult.overallScore,
        duration: 3000,
        useNativeDriver: false,
      }),
      Animated.timing(hologramAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(sphereRotateX, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Cosmic explosion haptic feedback
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={[styles.starIcon, i < count && styles.starActive]}>
        ⭐
      </Text>
    ));
  };

  // Static starfield rendering
  const renderParallaxStarfield = () => {
    return (
      <View style={styles.starfieldContainer}>
        {/* Background layer */}
        <View style={styles.starfieldLayer}>
          {Array.from({ length: 20 }, (_, i) => (
            <View key={i} style={[styles.star, {
              left: Math.random() * width,
              top: Math.random() * height,
              opacity: 0.3,
              width: 1,
              height: 1,
            }]} />
          ))}
        </View>
        
        {/* Midground layer */}
        <View style={styles.starfieldLayer}>
          {Array.from({ length: 15 }, (_, i) => (
            <View key={i} style={[styles.star, {
              left: Math.random() * width,
              top: Math.random() * height,
              opacity: 0.6,
              width: 2,
              height: 2,
            }]} />
          ))}
        </View>
        
        {/* Foreground layer */}
        <View style={styles.starfieldLayer}>
          {Array.from({ length: 10 }, (_, i) => (
            <View key={i} style={[styles.star, {
              left: Math.random() * width,
              top: Math.random() * height,
              opacity: 0.8,
              width: 3,
              height: 3,
            }]} />
          ))}
        </View>
      </View>
    );
  };

  const renderShootingStars = () => {
    // Static shooting stars - no animation
    return shootingStars.map(star => (
      <View
        key={star.id}
        style={[
          styles.shootingStar,
          {
            left: star.x,
            top: star.y,
            opacity: 0.3, // Static opacity
          }
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shootingStarGradient}
        />
      </View>
    ));
  };

  const renderTouchRipple = () => (
    <Animated.View
      style={[
        styles.ripple,
        {
          left: touchPosition.x - 25,
          top: touchPosition.y - 25,
          opacity: rippleAnim,
          transform: [{ scale: rippleAnim }]
        }
      ]}
    />
  );

  const render3DCompatibilitySphere = () => (
    <View style={styles.sphereContainer}>
      <Animated.View
        style={[
          styles.compatibilitySphere,
          {
            transform: [
              { rotateX: sphereRotateX.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              }) },
              { rotateY: sphereRotateY.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              }) }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#8A4FFF', '#FF6B9D', '#06B6D4', '#8A4FFF']}
          style={styles.sphereGradient}
        />
        <View style={styles.sphereCenter}>
          <Text style={styles.sphereScore}>
            {compatibilityResult?.overallScore}%
          </Text>
        </View>
      </Animated.View>
    </View>
  );

  const renderHolographicResults = () => (
    <Animated.View
      style={[
        styles.holographicContainer,
        {
          opacity: hologramAnim,
          transform: [{ 
            scale: hologramAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1.05]
            })
          }]
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(138, 79, 255, 0.1)', 'rgba(255, 107, 157, 0.1)', 'rgba(6, 182, 212, 0.1)']}
        style={styles.holographicGradient}
      >
        {/* Holographic border effect */}
        <View style={styles.holographicBorder} />
      </LinearGradient>
    </Animated.View>
  );

  // Removed floating hearts emoji bar as requested

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: breathingAnim }
          ]
        }
      ]}
    >
      {/* Starfield Background */}
      {renderParallaxStarfield()}
      {renderShootingStars()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          if (onScroll) onScroll(event);
          // Parallax movement disabled - keeping static starfield
        }}
        scrollEventThrottle={16}
        onTouchStart={(event) => {
          const { pageX, pageY } = event.nativeEvent;
          createRipple(pageX, pageY);
        }}
      >

        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.headerContent}>
            <Text style={[styles.pageTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
              Cosmic Connections
            </Text>
            <Text style={styles.pageSubtitle}>
              Understanding relationships through the stars
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.addConnectionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowOnboardingFlow(true);
            }}
          >
            <Animated.View style={[styles.addButtonInner, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.addButtonText}>+</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.navigationTabs}>
          <TouchableOpacity 
            style={[styles.navTab, currentView === 'checker' && styles.navTabActive]}
            onPress={() => {
              setCurrentView('checker');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[styles.navTabText, currentView === 'checker' && styles.navTabTextActive]}>
              Compatibility
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navTab, currentView === 'history' && styles.navTabActive]}
            onPress={() => {
              setCurrentView('history');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[styles.navTabText, currentView === 'history' && styles.navTabTextActive]}>
              History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navTab, currentView === 'chart' && styles.navTabActive]}
            onPress={() => {
              setCurrentView('chart');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[styles.navTabText, currentView === 'chart' && styles.navTabTextActive]}>
              Synastry
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conditional Content Based on Current View */}
        {currentView === 'checker' && (
          <>
            {/* Hero Section - Compatibility Checker */}
            <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(138, 79, 255, 0.1)', 'rgba(236, 72, 153, 0.1)', 'rgba(59, 130, 246, 0.1)']}
            style={styles.heroCard}
          >
            <Text style={[styles.heroTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
              Quick Compatibility Check
            </Text>
            
            {/* Partner Input Fields */}
            <View style={styles.inputSection}>
              <View style={styles.partnerInput}>
                <Text style={styles.inputLabel}>You</Text>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userData.name}</Text>
                  <Text style={styles.userSign}>{userData.zodiacSign}</Text>
                </View>
              </View>
              
              <View style={styles.connectionLine}>
                <Text style={styles.connectionIcon}>💫</Text>
              </View>
              
              <View style={styles.partnerInput}>
                <Text style={styles.inputLabel}>Partner</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter name"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={partnerData.name}
                  onChangeText={(text) => setPartnerData({...partnerData, name: text})}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Zodiac sign"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={partnerData.zodiacSign}
                  onChangeText={(text) => setPartnerData({...partnerData, zodiacSign: text})}
                />
              </View>
            </View>

            {/* Relationship Type Selector */}
            <View style={styles.relationshipSelector}>
              <Text style={styles.selectorTitle}>Relationship Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                {relationshipTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeChip,
                      relationshipType === type.id && styles.typeChipActive
                    ]}
                    onPress={() => {
                      setRelationshipType(type.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <LinearGradient
                      colors={relationshipType === type.id ? type.gradient as [string, string] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                      style={styles.chipGradient}
                    >
                      <Text style={styles.chipIcon}>{type.icon}</Text>
                      <Text style={styles.chipLabel}>{type.label}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Analysis Button */}
            <TouchableOpacity 
              style={styles.analyzeButton}
              onPress={analyzeCompatibility}
              disabled={isAnalyzing}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.analyzeButtonGradient}
              >
                {isAnalyzing ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Analyzing Cosmic Connection...</Text>
                    <Text style={styles.loadingIcon}>✨</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.analyzeButtonText}>Explore Our Cosmic Connection</Text>
                    <Text style={styles.sparkleIcon}>✨</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Ultra-Premium Compatibility Results */}
        {compatibilityResult && (
          <View style={styles.resultsSection}>
            {renderHolographicResults()}
            
            <Text style={[styles.resultsTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
              Quantum Compatibility Analysis
            </Text>
            
            {/* 3D Compatibility Sphere */}
            {render3DCompatibilitySphere()}
            
            {/* Overall Compatibility Score with Holographic Effect */}
            <View style={styles.overallScoreCard}>
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.1)', 'rgba(255, 165, 0, 0.1)']}
                style={styles.scoreCardGradient}
              >
                <View style={styles.compatibilityMeter}>
                  <View style={styles.meterContainer}>
                    <Animated.View style={[styles.meterProgress, { 
                      transform: [{ rotate: compatibilityAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0deg', '360deg']
                      }) }] 
                    }]} />
                    <View style={styles.meterCenter}>
                      <Text style={styles.scoreNumber}>{compatibilityResult.overallScore}%</Text>
                      <Text style={styles.scoreLabel}>Quantum Compatibility</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.scoreDescription}>
                  {compatibilityResult.overallScore >= 90 ? 'Soul Connection' :
                   compatibilityResult.overallScore >= 80 ? 'Strong Bond' :
                   compatibilityResult.overallScore >= 70 ? 'Growing Connection' : 'Potential for Growth'}
                </Text>
              </LinearGradient>
            </View>

            {/* Category Breakdown */}
            <View style={styles.categoryGrid}>
              {compatibilityResult.categories.map((category: any) => (
                <View key={category.id} style={styles.categoryCard}>
                  <LinearGradient
                    colors={[`${category.color}20`, `${category.color}10`]}
                    style={styles.categoryGradient}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                    <View style={styles.categoryScore}>
                      <Text style={styles.categoryScoreText}>{category.score}%</Text>
                    </View>
                    <View style={styles.categoryBar}>
                      <View style={[styles.categoryBarFill, { 
                        width: `${category.score}%`,
                        backgroundColor: category.color
                      }]} />
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </View>

            {/* Insights Section */}
            <View style={styles.insightsSection}>
              <Text style={[styles.insightsTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
                Cosmic Insights
              </Text>
              
              <View style={styles.insightsCard}>
                <Text style={styles.insightsSubtitle}>Strengths</Text>
                {compatibilityResult.insights.map((insight: string, index: number) => (
                  <View key={index} style={styles.insightItem}>
                    <Text style={styles.insightIcon}>✨</Text>
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.insightsCard}>
                <Text style={styles.insightsSubtitle}>Growth Areas</Text>
                {compatibilityResult.challenges.map((challenge: string, index: number) => (
                  <View key={index} style={styles.insightItem}>
                    <Text style={styles.insightIcon}>🌱</Text>
                    <Text style={styles.insightText}>{challenge}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.insightsCard}>
                <Text style={styles.insightsSubtitle}>Recommendations</Text>
                {compatibilityResult.recommendations.map((rec: string, index: number) => (
                  <View key={index} style={styles.insightItem}>
                    <Text style={styles.insightIcon}>💡</Text>
                    <Text style={styles.insightText}>{rec}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

            {/* Saved Connections */}
            <View style={styles.savedSection}>
              <Text style={[styles.savedTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
                Your Cosmic Connections
              </Text>
              
              {savedConnections.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>💫</Text>
                  <Text style={styles.emptyTitle}>Your cosmic connections await discovery</Text>
                  <Text style={styles.emptySubtitle}>
                    Start by analyzing your compatibility with someone special
                  </Text>
                </View>
              ) : (
                <View style={styles.connectionsGrid}>
                  {savedConnections.map((connection, index) => (
                    <View key={index} style={styles.connectionCard}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.08)', 'rgba(138, 79, 255, 0.08)']}
                        style={styles.connectionGradient}
                      >
                        <Text style={styles.connectionNames}>{connection.names}</Text>
                        <Text style={styles.connectionScore}>{connection.score}% Compatible</Text>
                        <Text style={styles.connectionType}>{connection.type}</Text>
                      </LinearGradient>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Compatibility History View */}
        {currentView === 'history' && (
          <View style={styles.historySection}>
            <Text style={[styles.historyTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
              Compatibility History
            </Text>
            
            {compatibilityHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>No compatibility checks yet</Text>
                <Text style={styles.emptySubtitle}>
                  Your compatibility journey begins with your first analysis
                </Text>
              </View>
            ) : (
              <View>
                {compatibilityHistory.map((item) => (
                  <View key={item.id} style={styles.historyCard}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.08)', 'rgba(138, 79, 255, 0.08)']}
                      style={styles.historyGradient}
                    >
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyNames}>
                          {userData.name} & {item.partnerName}
                        </Text>
                        <Text style={styles.historyDate}>
                          {item.date.toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.historyDetails}>
                        <Text style={styles.historySigns}>
                          {userData.zodiacSign} ♥ {item.partnerSign}
                        </Text>
                        <Text style={styles.historyScore}>
                          {item.score}% Compatible
                        </Text>
                        <Text style={styles.historyType}>
                          {item.relationshipType}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Synastry Chart View */}
        {currentView === 'chart' && (
          <View style={styles.chartSection}>
            <Text style={[styles.chartTitle, fontsLoaded ? { fontFamily: 'Cinzel_700Bold' } : { fontFamily: 'System' }]}>
              Synastry Chart
            </Text>
            
            {!compatibilityResult ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔮</Text>
                <Text style={styles.emptyTitle}>No chart data available</Text>
                <Text style={styles.emptySubtitle}>
                  Complete a compatibility analysis to view your synastry chart
                </Text>
              </View>
            ) : (
              <View style={styles.chartContainer}>
                <Text style={styles.chartPlaceholder}>
                  Advanced 3D Synastry Chart Coming Soon
                </Text>
                <Text style={styles.chartDescription}>
                  Interactive birth chart visualization with planetary aspects
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Partner Onboarding Flow */}
      <PartnerOnboardingFlow
        isVisible={showOnboardingFlow}
        onClose={() => setShowOnboardingFlow(false)}
        onComplete={handleOnboardingComplete}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollView: {
    flex: 1,
  },
  floatingHeart: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  heartEmoji: {
    fontSize: 16,
    opacity: 0.6,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    color: AppColors.cosmicGold,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  addConnectionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.cosmicGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroTitle: {
    fontSize: 24,
    color: AppColors.onBackground,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  partnerInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    color: AppColors.onBackground,
    marginBottom: 8,
    fontWeight: '600',
  },
  userInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    color: AppColors.onBackground,
    fontWeight: '600',
    marginBottom: 4,
  },
  userSign: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  connectionLine: {
    marginHorizontal: 16,
    alignItems: 'center',
  },
  connectionIcon: {
    fontSize: 24,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: AppColors.onBackground,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  relationshipSelector: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 16,
    color: AppColors.onBackground,
    marginBottom: 12,
    fontWeight: '600',
  },
  typeScroll: {
    flexDirection: 'row',
  },
  typeChip: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  typeChipActive: {
    shadowColor: AppColors.cosmicGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  chipGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  chipIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  chipLabel: {
    fontSize: 12,
    color: AppColors.onBackground,
    fontWeight: '600',
  },
  analyzeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  analyzeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzeButtonText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '700',
    marginRight: 8,
  },
  sparkleIcon: {
    fontSize: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    marginRight: 8,
  },
  loadingIcon: {
    fontSize: 18,
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  resultsTitle: {
    fontSize: 24,
    color: AppColors.onBackground,
    textAlign: 'center',
    marginBottom: 24,
  },
  overallScoreCard: {
    marginBottom: 24,
  },
  scoreCardGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  compatibilityMeter: {
    marginBottom: 16,
  },
  meterContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  meterProgress: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    borderColor: AppColors.cosmicGold,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  meterCenter: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 36,
    color: AppColors.cosmicGold,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  scoreDescription: {
    fontSize: 18,
    color: AppColors.onBackground,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: 16,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: AppColors.onBackground,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryScore: {
    marginBottom: 8,
  },
  categoryScoreText: {
    fontSize: 20,
    color: AppColors.onBackground,
    fontWeight: 'bold',
  },
  categoryBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  insightsSection: {
    marginBottom: 30,
  },
  insightsTitle: {
    fontSize: 20,
    color: AppColors.onBackground,
    marginBottom: 16,
  },
  insightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  insightsSubtitle: {
    fontSize: 16,
    color: AppColors.cosmicGold,
    fontWeight: '600',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  savedSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  savedTitle: {
    fontSize: 20,
    color: AppColors.onBackground,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: AppColors.onBackground,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  connectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  connectionCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  connectionGradient: {
    padding: 16,
  },
  connectionNames: {
    fontSize: 16,
    color: AppColors.onBackground,
    fontWeight: '600',
    marginBottom: 4,
  },
  connectionScore: {
    fontSize: 14,
    color: AppColors.cosmicGold,
    fontWeight: '600',
    marginBottom: 4,
  },
  connectionType: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  starIcon: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.3)',
    marginRight: 2,
  },
  starActive: {
    color: AppColors.cosmicGold,
  },
  bottomSpacing: {
    height: 100,
  },
  // Advanced Background System Styles
  starfieldContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  starfieldLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  shootingStar: {
    position: 'absolute',
    width: 100,
    height: 2,
    zIndex: 1,
  },
  shootingStarGradient: {
    flex: 1,
    borderRadius: 1,
  },
  ripple: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  // Navigation Tabs
  navigationTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingVertical: 4,
  },
  navTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  navTabActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  navTabText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  navTabTextActive: {
    color: AppColors.cosmicGold,
    fontWeight: '700',
  },
  // 3D Compatibility Sphere
  sphereContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  compatibilitySphere: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.cosmicGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  sphereGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sphereCenter: {
    alignItems: 'center',
  },
  sphereScore: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  // Holographic Effects
  holographicContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  holographicGradient: {
    flex: 1,
    borderRadius: 20,
  },
  holographicBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(138, 79, 255, 0.3)',
  },
  // History Section
  historySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  historyTitle: {
    fontSize: 24,
    color: AppColors.onBackground,
    textAlign: 'center',
    marginBottom: 24,
  },
  historyCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyGradient: {
    padding: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyNames: {
    fontSize: 18,
    color: AppColors.onBackground,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historySigns: {
    fontSize: 14,
    color: AppColors.cosmicGold,
    fontWeight: '600',
  },
  historyScore: {
    fontSize: 16,
    color: AppColors.onBackground,
    fontWeight: 'bold',
  },
  historyType: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textTransform: 'capitalize',
  },
  // Chart Section
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 24,
    color: AppColors.onBackground,
    textAlign: 'center',
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartPlaceholder: {
    fontSize: 18,
    color: AppColors.onBackground,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  chartDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SoulmateContent;
