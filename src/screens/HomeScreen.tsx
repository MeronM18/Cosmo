import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Animated,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  onClose?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onClose }) => {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  const [selectedTab, setSelectedTab] = useState('horoscopes');
  const scrollY = useRef(new Animated.Value(0)).current;
  const parallaxAnim = useRef(new Animated.Value(0)).current;
  const navIndicatorAnim = useRef(new Animated.Value(0)).current;

  // Sample data - in real app this would come from API
  const userData = {
    name: "Sarah",
    zodiacSign: "Scorpio",
    zodiacSymbol: "♏",
    isPremium: false,
    readingStreak: 7,
    cosmicRating: 4,
    luckyNumbers: [7, 14, 23, 31],
    compatibleSigns: ["Cancer", "Pisces", "Capricorn"]
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? "Good morning" : currentTime < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      parallaxAnim.setValue(value * 0.5);
    });

    // Initialize navigation indicator position
    navIndicatorAnim.setValue(0);

    return () => {
      scrollY.removeListener(listener);
    };
  }, []);

  const handleTabPress = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
    
    // Animate the navigation indicator
    const tabIndex = ['horoscopes', 'moon', 'compatibility', 'chat'].indexOf(tab);
    Animated.spring(navIndicatorAnim, {
      toValue: tabIndex,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Animated Starfield Background */}
      <Animated.View 
        style={[
          styles.starfield,
          {
            transform: [{ translateY: parallaxAnim }]
          }
        ]}
      >
        {[...Array(50)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: Math.random() * 0.8 + 0.2,
              }
            ]}
          />
        ))}
      </Animated.View>

      {/* X Button */}
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.pageTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
            ⭐ Your Horoscopes
          </Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⋯</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileAvatar}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{userData.name[0]}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Reading Streak Badge */}
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {userData.readingStreak} day reading streak!</Text>
        </View>

        {/* Today's Horoscope Card - Large Prominent */}
        <TouchableOpacity style={styles.mainHoroscopeCard} onPress={handleCardPress}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(139, 95, 191, 0.1)']}
            style={styles.mainCardGradient}
          >
            <View style={styles.mainCardHeader}>
              <View style={styles.zodiacHeader}>
                <Text style={styles.zodiacSymbol}>{userData.zodiacSymbol}</Text>
                <Text style={[styles.zodiacSign, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
                  {userData.zodiacSign}
                </Text>
              </View>
              <View style={styles.cosmicRating}>
                <Text style={styles.ratingText}>Today's cosmic energy:</Text>
                <Text style={styles.stars}>
                  {Array.from({ length: userData.cosmicRating }, (_, i) => '⭐').join('')}
                  {Array.from({ length: 5 - userData.cosmicRating }, (_, i) => '☆').join('')}
                </Text>
              </View>
            </View>
            <Text style={styles.fullHoroscopeText}>
              Today brings powerful transformations and deep insights. The cosmic energies align to reveal hidden truths about your path forward. Trust your intuition as it guides you toward meaningful connections and unexpected opportunities.
              {'\n\n'}
              Your emotional depth serves you well today, allowing you to see beyond surface appearances. This is an excellent time for introspection and understanding your true desires. The universe is supporting your growth and evolution.
              {'\n\n'}
              In relationships, your natural magnetism draws others to you. Be authentic in your interactions, and you'll find that genuine connections form effortlessly. Your ability to read between the lines will prove invaluable in both personal and professional settings.
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Horoscope Time Periods */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.timePeriodsContainer}
        >
          <TouchableOpacity style={[styles.timePeriodCard, styles.timePeriodInactive]} onPress={handleCardPress}>
            <Text style={styles.timePeriodTitle}>Yesterday</Text>
            <Text style={styles.timePeriodSubtitle}>For reflection</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.timePeriodCard, styles.timePeriodActive]} onPress={handleCardPress}>
            <Text style={styles.timePeriodTitle}>Today</Text>
            <Text style={styles.timePeriodSubtitle}>Current energy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.timePeriodCard, styles.timePeriodInactive]} onPress={handleCardPress}>
            <Text style={styles.timePeriodTitle}>Tomorrow</Text>
            <Text style={styles.timePeriodSubtitle}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.timePeriodCard, styles.timePeriodInactive]} onPress={handleCardPress}>
            <Text style={styles.timePeriodTitle}>This Week</Text>
            <Text style={styles.timePeriodSubtitle}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.timePeriodCard, styles.timePeriodInactive]} onPress={handleCardPress}>
            <Text style={styles.timePeriodTitle}>This Month</Text>
            <Text style={styles.timePeriodSubtitle}>Major themes</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Detailed Horoscope Categories */}
        <View style={styles.categoriesCard}>
          <Text style={[styles.categoriesTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
            Today's Detailed Guidance
          </Text>
          <TouchableOpacity style={styles.categoryItem} onPress={handleCardPress}>
            <Text style={styles.categoryIcon}>💕</Text>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Love & Relationships</Text>
              <Text style={styles.categoryText}>Your natural magnetism draws others to you today. Be authentic in your interactions.</Text>
            </View>
            <Text style={styles.categoryArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem} onPress={handleCardPress}>
            <Text style={styles.categoryIcon}>💼</Text>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Career & Money</Text>
              <Text style={styles.categoryText}>Your ability to read between the lines proves invaluable in professional settings.</Text>
            </View>
            <Text style={styles.categoryArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem} onPress={handleCardPress}>
            <Text style={styles.categoryIcon}>🏥</Text>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Health & Wellness</Text>
              <Text style={styles.categoryText}>Focus on emotional wellbeing through introspection and understanding your desires.</Text>
            </View>
            <Text style={styles.categoryArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem} onPress={handleCardPress}>
            <Text style={styles.categoryIcon}>📈</Text>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>Personal Growth</Text>
              <Text style={styles.categoryText}>The universe is supporting your growth and evolution. Trust your intuition.</Text>
            </View>
            <Text style={styles.categoryArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Zodiac Insights Section */}
        <View style={styles.zodiacInsightsCard}>
          <Text style={[styles.zodiacInsightsTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
            Your Zodiac Profile
          </Text>
          <View style={styles.zodiacProfile}>
            <View style={styles.zodiacProfileHeader}>
              <Text style={styles.zodiacProfileSymbol}>{userData.zodiacSymbol}</Text>
              <View style={styles.zodiacProfileInfo}>
                <Text style={[styles.zodiacProfileSign, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
                  {userData.zodiacSign}
                </Text>
                <Text style={styles.zodiacProfileElement}>Water Sign • Fixed Quality</Text>
              </View>
            </View>
            <Text style={styles.zodiacProfileDescription}>
              Intense, passionate, and deeply intuitive. You possess remarkable emotional depth and the ability to transform yourself and others through your powerful presence.
            </Text>
          </View>
          
          <View style={styles.zodiacFeatures}>
            <View style={styles.zodiacFeature}>
              <Text style={styles.zodiacFeatureTitle}>Strengths</Text>
              <Text style={styles.zodiacFeatureText}>Loyal, Resourceful, Brave, Passionate</Text>
            </View>
            <View style={styles.zodiacFeature}>
              <Text style={styles.zodiacFeatureTitle}>Challenges</Text>
              <Text style={styles.zodiacFeatureText}>Distrusting, Jealous, Secretive, Violent</Text>
            </View>
          </View>

          <View style={styles.zodiacExtras}>
            <View style={styles.zodiacExtra}>
              <Text style={styles.zodiacExtraTitle}>Lucky Numbers</Text>
              <Text style={styles.zodiacExtraText}>{userData.luckyNumbers.join(', ')}</Text>
            </View>
            <View style={styles.zodiacExtra}>
              <Text style={styles.zodiacExtraTitle}>Compatible Signs</Text>
              <Text style={styles.zodiacExtraText}>{userData.compatibleSigns.join(', ')}</Text>
            </View>
          </View>
        </View>

        {/* Reading History Section */}
        <TouchableOpacity style={styles.historyCard} onPress={handleCardPress}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
              Reading History
            </Text>
            <Text style={styles.historyViewAll}>View all →</Text>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyIcon}>📖</Text>
            <View style={styles.historyContent}>
              <Text style={styles.historyItemTitle}>Today's Reading</Text>
              <Text style={styles.historyTimestamp}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyIcon}>📖</Text>
            <View style={styles.historyContent}>
              <Text style={styles.historyItemTitle}>Yesterday's Guidance</Text>
              <Text style={styles.historyTimestamp}>1 day ago</Text>
            </View>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyIcon}>📖</Text>
            <View style={styles.historyContent}>
              <Text style={styles.historyItemTitle}>Weekly Forecast</Text>
              <Text style={styles.historyTimestamp}>3 days ago</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Premium Features Teaser (only for free users) */}
        {!userData.isPremium && (
          <TouchableOpacity style={styles.premiumCard} onPress={handleCardPress}>
            <LinearGradient
              colors={['rgba(255, 215, 0, 0.1)', 'rgba(255, 165, 0, 0.1)']}
              style={styles.premiumGradient}
            >
              <Text style={[styles.premiumTitle, fontsLoaded && { fontFamily: 'Cinzel_700Bold' }]}>
                Unlock Your Full Cosmic Potential
              </Text>
              <Text style={styles.premiumFeatures}>
                Unlimited horoscopes • AI chat • Compatibility reports
              </Text>
              <TouchableOpacity style={styles.premiumCTA}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.premiumCTAGradient}
                >
                  <Text style={styles.premiumCTAText}>Start Free Trial</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Bottom spacing for navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation - Pill Shape */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.pillNavBar}>
          {/* Animated Background Indicator */}
          <Animated.View 
            style={[
              styles.navIndicator,
              {
                transform: [{
                  translateX: navIndicatorAnim.interpolate({
                    inputRange: [0, 1, 2, 3],
                    outputRange: [0, (width * 0.95 - 8) / 4, (width * 0.95 - 8) / 2, (width * 0.95 - 8) * 3 / 4], // 95% width calculation
                  })
                }]
              }
            ]}
          />
          
          {/* Navigation Items */}
          <TouchableOpacity 
            style={styles.pillNavItem}
            onPress={() => handleTabPress('horoscopes')}
          >
            <View style={[
              styles.navIconContainer,
              selectedTab === 'horoscopes' && styles.navIconContainerActive
            ]}>
              <Image 
                source={require('../../assets/tarot.png')} 
                style={[
                  styles.navIconImage,
                  selectedTab === 'horoscopes' && styles.navIconImageActive
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={[
              styles.navTitle,
              selectedTab === 'horoscopes' && styles.navTitleActive
            ]}>
              Horoscopes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pillNavItem}
            onPress={() => handleTabPress('moon')}
          >
            <View style={[
              styles.navIconContainer,
              selectedTab === 'moon' && styles.navIconContainerActive
            ]}>
              <Image 
                source={require('../../assets/moon (1).png')} 
                style={[
                  styles.navIconImage,
                  selectedTab === 'moon' && styles.navIconImageActive
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={[
              styles.navTitle,
              selectedTab === 'moon' && styles.navTitleActive
            ]}>
              Moon Phases
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pillNavItem}
            onPress={() => handleTabPress('compatibility')}
          >
            <View style={[
              styles.navIconContainer,
              selectedTab === 'compatibility' && styles.navIconContainerActive
            ]}>
              <Image 
                source={require('../../assets/love.png')} 
                style={[
                  styles.navIconImage,
                  selectedTab === 'compatibility' && styles.navIconImageActive
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={[
              styles.navTitle,
              selectedTab === 'compatibility' && styles.navTitleActive
            ]}>
              Compatibility
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pillNavItem}
            onPress={() => handleTabPress('chat')}
          >
            <View style={[
              styles.navIconContainer,
              selectedTab === 'chat' && styles.navIconContainerActive
            ]}>
              <Image 
                source={require('../../assets/girl.png')} 
                style={[
                  styles.navIconImage,
                  selectedTab === 'chat' && styles.navIconImageActive
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={[
              styles.navTitle,
              selectedTab === 'chat' && styles.navTitleActive
            ]}>
              Luna
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  streakText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  mainHoroscopeCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 200,
  },
  mainCardGradient: {
    padding: 20,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  zodiacHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zodiacSign: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
  cosmicRating: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  stars: {
    fontSize: 14,
  },
  fullHoroscopeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    flex: 1,
  },
  zodiacBadge: {
    backgroundColor: 'rgba(166, 108, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  zodiacSymbol: {
    fontSize: 16,
    marginRight: 4,
  },
  zodiacText: {
    color: '#A66CFF',
    fontSize: 12,
    fontWeight: '600',
  },
  horoscopePreview: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: 'rgba(166, 108, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#A66CFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timePeriodsContainer: {
    marginBottom: 20,
  },
  timePeriodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timePeriodActive: {
    backgroundColor: 'rgba(166, 108, 255, 0.2)',
    borderColor: 'rgba(166, 108, 255, 0.4)',
  },
  timePeriodInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  timePeriodTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timePeriodSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    textAlign: 'center',
  },
  categoriesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoriesTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
  },
  categoryArrow: {
    color: '#A66CFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  highlightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  highlightsTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  highlightText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  historyViewAll: {
    color: '#A66CFF',
    fontSize: 12,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  historyTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  zodiacInsightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  zodiacInsightsTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 16,
  },
  zodiacProfile: {
    marginBottom: 16,
  },
  zodiacProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  zodiacProfileSymbol: {
    fontSize: 32,
    marginRight: 12,
  },
  zodiacProfileInfo: {
    flex: 1,
  },
  zodiacProfileSign: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 2,
  },
  zodiacProfileElement: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  zodiacProfileDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  zodiacFeatures: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  zodiacFeature: {
    flex: 1,
    marginRight: 12,
  },
  zodiacFeatureTitle: {
    fontSize: 12,
    color: '#A66CFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  zodiacFeatureText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
  },
  zodiacExtras: {
    flexDirection: 'row',
  },
  zodiacExtra: {
    flex: 1,
    marginRight: 12,
  },
  zodiacExtraTitle: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 4,
  },
  zodiacExtraText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  moonCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  moonVisual: {
    marginRight: 16,
  },
  moonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonEmoji: {
    fontSize: 40,
  },
  moonContent: {
    flex: 1,
  },
  moonTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  moonSign: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  moonDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 12,
  },
  moonCTA: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  moonCTAText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  eventsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventsTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  eventsCTA: {
    backgroundColor: 'rgba(166, 108, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  eventsCTAText: {
    color: '#A66CFF',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumGradient: {
    padding: 20,
  },
  premiumTitle: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '700',
    marginBottom: 8,
  },
  premiumFeatures: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  premiumCTA: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  premiumCTAGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  premiumCTAText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 130,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },
  pillNavBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 25,
    padding: 4,
    width: '95%',
    alignSelf: 'center',
    alignItems: "center",
    height: 70,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: (width * 0.95 - 8) / 4, // 95% width minus pill padding, divided by 4 tabs
    height: 62,
    backgroundColor: '#A66CFF',
    borderRadius: 21,
    shadowColor: '#A66CFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pillNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 62,
    zIndex: 2,
    paddingHorizontal: 4,
  },
  navIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  navIconContainerActive: {
    // Active state handled by the animated indicator
  },
  navIconImage: {
    width: 22,
    height: 22,
  },
  navIconImageActive: {
    width: 22,
    height: 22,
  },
  navTitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 12,
  },
  navTitleActive: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default HomeScreen;
