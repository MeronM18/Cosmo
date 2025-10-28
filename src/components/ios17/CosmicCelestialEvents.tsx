import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Alert,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CosmicTheme } from '../../theme/cosmicTheme';
import { CelestialEvent, SectionProps } from '../../types/horoscopeExtensions';
import { CelestialEventsService } from '../../services/celestialEventsService';
import CosmicEventCard from './CosmicEventCard';
import CosmicHeroSection from './CosmicHeroSection';
import CosmicFilterPills from './CosmicFilterPills';
import CosmicLoadingSkeleton from './CosmicLoadingSkeleton';

const { width, height } = Dimensions.get('window');

interface CosmicCelestialEventsProps extends SectionProps {
  location?: {
    latitude: number;
    longitude: number;
  };
}

type FilterType = 'all' | 'high_impact' | 'affecting_me' | 'upcoming';

const CosmicCelestialEvents: React.FC<CosmicCelestialEventsProps> = ({
  userData,
}) => {
  // State Management
  const [events, setEvents] = useState<CelestialEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CelestialEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CelestialEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [notificationSettings, setNotificationSettings] = useState<Record<string, boolean>>({});

  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const heroScaleAnim = useRef(new Animated.Value(0.8)).current;
  const parallaxAnim = useRef(new Animated.Value(0)).current;
  const filterSlideAnim = useRef(new Animated.Value(-100)).current;

  // Service Instance
  const celestialService = new CelestialEventsService();

  // Load Events
  const loadEvents = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const upcomingEvents = await CelestialEventsService.getUpcomingEvents();
      setEvents(upcomingEvents);
      applyFilter(upcomingEvents, activeFilter);
    } catch (error) {
      console.error('Error loading celestial events:', error);
      Alert.alert('Error', 'Failed to load celestial events. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filter Events
  const applyFilter = (eventsList: CelestialEvent[], filter: FilterType) => {
    let filtered = [...eventsList];

    switch (filter) {
      case 'high_impact':
        filtered = eventsList.filter(event => event.impactLevel === 'high');
        break;
      case 'affecting_me':
        filtered = eventsList.filter(event => 
          event.affectedSigns.includes(userData.zodiacSign)
        );
        break;
      case 'upcoming':
        filtered = eventsList.filter(event => {
          const daysUntil = getDaysUntilEvent(event.startDate);
          return daysUntil <= 7;
        });
        break;
      default:
        filtered = eventsList;
    }

    setFilteredEvents(filtered);
  };

  // Filter Change Handler
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    applyFilter(events, filter);
    
    // Animate filter change
    Animated.sequence([
      Animated.timing(filterSlideAnim, {
        toValue: -100,
        duration: CosmicTheme.animations.fast,
        useNativeDriver: true,
      }),
      Animated.timing(filterSlideAnim, {
        toValue: 0,
        duration: CosmicTheme.animations.normal,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Event Handlers
  const openEventDetails = (event: CelestialEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const closeEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleNotification = async (eventId: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const addToCalendar = (event: CelestialEvent) => {
    // TODO: Implement calendar integration
    Alert.alert('Calendar', `Added "${event.name}" to your calendar`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Utility Functions
  const getDaysUntilEvent = (eventDate: Date) => {
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getEventTypeColor = (type: string) => {
    const color = CosmicTheme.colors[type as keyof typeof CosmicTheme.colors] || CosmicTheme.colors.cosmicPurple;
    return {
      primary: color,
      secondary: color,
    };
  };

  const getImpactLevelColor = (level: string) => {
    switch (level) {
      case 'high': return CosmicTheme.colors.highImpact;
      case 'medium': return CosmicTheme.colors.mediumImpact;
      case 'low': return CosmicTheme.colors.lowImpact;
      default: return CosmicTheme.colors.mediumImpact;
    }
  };

  // Animation Effects
  useEffect(() => {
    // Initial load animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: CosmicTheme.animations.slow,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: CosmicTheme.animations.slow,
        useNativeDriver: true,
      }),
      Animated.spring(heroScaleAnim, {
        toValue: 1,
        ...CosmicTheme.springs.gentle,
        useNativeDriver: true,
      }),
      Animated.timing(filterSlideAnim, {
        toValue: 0,
        duration: CosmicTheme.animations.normal,
        useNativeDriver: true,
      }),
    ]).start();

    loadEvents();
  }, []);

  // Parallax Effect
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    parallaxAnim.setValue(scrollY);
  };

  // Render Loading State
  if (isLoading) {
    return <CosmicLoadingSkeleton />;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Hero Section with Parallax */}
      <Animated.View
        style={[
          styles.heroContainer,
          {
            transform: [
              {
                translateY: parallaxAnim.interpolate({
                  inputRange: [0, 200],
                  outputRange: [0, -50],
                  extrapolate: 'clamp',
                }),
              },
              { scale: heroScaleAnim },
            ],
          },
        ]}
      >
        <CosmicHeroSection
          events={events}
          userData={userData}
          onEventPress={openEventDetails}
        />
      </Animated.View>

      {/* Sticky Filter Pills */}
      <Animated.View
        style={[
          styles.filterContainer,
          {
            transform: [{ translateY: filterSlideAnim }],
          },
        ]}
      >
        <CosmicFilterPills
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          eventCounts={{
            all: events.length,
            high_impact: events.filter(e => e.impactLevel === 'high').length,
            affecting_me: events.filter(e => e.affectedSigns.includes(userData.zodiacSign)).length,
            upcoming: events.filter(e => getDaysUntilEvent(e.startDate) <= 7).length,
          }}
        />
      </Animated.View>

      {/* Events Grid */}
      <ScrollView
        style={styles.eventsContainer}
        contentContainerStyle={styles.eventsContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadEvents(true)}
            tintColor={CosmicTheme.colors.stellarGold}
            colors={[CosmicTheme.colors.stellarGold]}
          />
        }
      >
        {/* Staggered Grid Layout */}
        <View style={styles.eventsGrid}>
          {filteredEvents.map((event, index) => (
            <Animated.View
              key={event.id}
              style={[
                styles.eventCardWrapper,
                {
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            >
              <CosmicEventCard
                event={event}
                index={index}
                userData={userData}
                onPress={openEventDetails}
                onBookmark={() => toggleNotification(event.id)}
                isBookmarked={notificationSettings[event.id] || false}
                getDaysUntilEvent={getDaysUntilEvent}
                getEventTypeColor={getEventTypeColor}
                getImpactLevelColor={getImpactLevelColor}
              />
            </Animated.View>
          ))}
        </View>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🌙</Text>
            <Text style={styles.emptyStateTitle}>No Events Found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your filters or check back later for new cosmic events.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // TODO: Add quick calendar integration
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={CosmicTheme.gradients.stellar as any}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.fabIcon}>📅</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Event Details Modal */}
      <Modal
        visible={showEventDetails}
        animationType="slide"
        onRequestClose={closeEventDetails}
        presentationStyle="overFullScreen"
      >
        {selectedEvent && (
          <View style={styles.modalContainer}>
            <BlurView intensity={20} tint="dark" style={styles.modalBlurView}>
              {/* Modal Header with Parallax */}
              <Animated.View
                style={[
                  styles.modalHeader,
                  {
                    transform: [
                      {
                        translateY: parallaxAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: [0, -20],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    getEventTypeColor(selectedEvent.type).primary,
                    getEventTypeColor(selectedEvent.type).secondary,
                  ] as any}
                  style={styles.modalHeaderGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.modalHeaderContent}>
                    <Text style={styles.modalTitle}>{selectedEvent.name}</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={closeEventDetails}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Modal Content */}
              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Event Information */}
                <View style={styles.eventInfoContainer}>
                  <View style={styles.eventInfoRow}>
                    <Text style={styles.eventInfoLabel}>Type</Text>
                    <View style={[
                      styles.eventTypeBadge,
                      { backgroundColor: getEventTypeColor(selectedEvent.type).primary as any }
                    ]}>
                      <Text style={styles.eventTypeText}>
                        {selectedEvent.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.eventInfoRow}>
                    <Text style={styles.eventInfoLabel}>Date</Text>
                    <Text style={styles.eventInfoValue}>
                      {selectedEvent.startDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  <View style={styles.eventInfoRow}>
                    <Text style={styles.eventInfoLabel}>Impact</Text>
                    <View style={[
                      styles.impactBadge,
                      { backgroundColor: getImpactLevelColor(selectedEvent.impactLevel).primary }
                    ]}>
                      <Text style={styles.impactText}>
                        {selectedEvent.impactLevel.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionTitle}>Description</Text>
                  <Text style={styles.descriptionText}>
                    {selectedEvent.description}
                  </Text>
                </View>

                {/* Preparation Tips */}
                <View style={styles.preparationContainer}>
                  <Text style={styles.preparationTitle}>Preparation Tips</Text>
                  {selectedEvent.preparationTips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Text style={styles.tipBullet}>✨</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>

                {/* Affected Signs */}
                <View style={styles.affectedSignsContainer}>
                  <Text style={styles.affectedSignsTitle}>Most Affected Signs</Text>
                  <View style={styles.signsList}>
                    {selectedEvent.affectedSigns.map((sign, index) => (
                      <View
                        key={index}
                        style={[
                          styles.signBadge,
                          sign === userData.zodiacSign && styles.userSignBadge
                        ]}
                      >
                        <Text style={[
                          styles.signText,
                          sign === userData.zodiacSign && styles.userSignText
                        ]}>
                          {sign}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.calendarButton}
                    onPress={() => addToCalendar(selectedEvent)}
                  >
                    <LinearGradient
                      colors={CosmicTheme.gradients.stellar as any}
                      style={styles.calendarButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.calendarButtonText}>📅 Add to Calendar</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.notificationToggleButton,
                      notificationSettings[selectedEvent.id] && styles.notificationToggleButtonActive
                    ]}
                    onPress={() => toggleNotification(selectedEvent.id)}
                  >
                    <Text style={[
                      styles.notificationToggleText,
                      notificationSettings[selectedEvent.id] && styles.notificationToggleTextActive
                    ]}>
                      {notificationSettings[selectedEvent.id] ? '🔔 Notifications On' : '🔕 Notifications Off'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        )}
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CosmicTheme.colors.primaryBackground,
  },
  heroContainer: {
    height: height * 0.4,
    marginBottom: CosmicTheme.spacing.lg,
  },
  filterContainer: {
    position: 'absolute',
    top: height * 0.35,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: CosmicTheme.spacing.md,
  },
  eventsContainer: {
    flex: 1,
    marginTop: CosmicTheme.spacing.xl,
  },
  eventsContent: {
    paddingHorizontal: CosmicTheme.spacing.md,
    paddingBottom: CosmicTheme.spacing.xxxl,
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventCardWrapper: {
    width: (width - CosmicTheme.spacing.md * 3) / 2,
    marginBottom: CosmicTheme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: CosmicTheme.spacing.xxxl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: CosmicTheme.spacing.lg,
  },
  emptyStateTitle: {
    ...CosmicTheme.typography.constellationHeader,
    color: CosmicTheme.colors.primaryText,
    marginBottom: CosmicTheme.spacing.sm,
  },
  emptyStateSubtitle: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: CosmicTheme.spacing.lg,
  },
  fab: {
    position: 'absolute',
    bottom: CosmicTheme.spacing.xl,
    right: CosmicTheme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    ...CosmicTheme.shadows.floating,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: CosmicTheme.colors.modalBackground,
  },
  modalBlurView: {
    flex: 1,
  },
  modalHeader: {
    height: 120,
    borderBottomLeftRadius: CosmicTheme.cornerRadius.xlarge,
    borderBottomRightRadius: CosmicTheme.cornerRadius.xlarge,
    overflow: 'hidden',
  },
  modalHeaderGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: CosmicTheme.spacing.lg,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CosmicTheme.spacing.lg,
  },
  modalTitle: {
    ...CosmicTheme.typography.constellationHeader,
    color: CosmicTheme.colors.primaryText,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.primaryText,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: CosmicTheme.spacing.lg,
  },
  eventInfoContainer: {
    ...CosmicTheme.glassmorphism.glassCard,
    padding: CosmicTheme.spacing.lg,
    marginVertical: CosmicTheme.spacing.lg,
  },
  eventInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: CosmicTheme.spacing.md,
  },
  eventInfoLabel: {
    ...CosmicTheme.typography.cosmicLabel,
    color: CosmicTheme.colors.secondaryText,
  },
  eventInfoValue: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.primaryText,
  },
  eventTypeBadge: {
    paddingHorizontal: CosmicTheme.spacing.sm,
    paddingVertical: CosmicTheme.spacing.xs,
    borderRadius: CosmicTheme.cornerRadius.small,
  },
  eventTypeText: {
    ...CosmicTheme.typography.impactText,
    color: CosmicTheme.colors.primaryText,
  },
  impactBadge: {
    paddingHorizontal: CosmicTheme.spacing.sm,
    paddingVertical: CosmicTheme.spacing.xs,
    borderRadius: CosmicTheme.cornerRadius.small,
  },
  impactText: {
    ...CosmicTheme.typography.impactText,
    color: CosmicTheme.colors.primaryText,
  },
  descriptionContainer: {
    marginBottom: CosmicTheme.spacing.lg,
  },
  descriptionTitle: {
    ...CosmicTheme.typography.stellarSubtitle,
    color: CosmicTheme.colors.primaryText,
    marginBottom: CosmicTheme.spacing.sm,
  },
  descriptionText: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.secondaryText,
    lineHeight: 24,
  },
  preparationContainer: {
    marginBottom: CosmicTheme.spacing.lg,
  },
  preparationTitle: {
    ...CosmicTheme.typography.stellarSubtitle,
    color: CosmicTheme.colors.primaryText,
    marginBottom: CosmicTheme.spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: CosmicTheme.spacing.sm,
  },
  tipBullet: {
    ...CosmicTheme.typography.cosmicBody,
    marginRight: CosmicTheme.spacing.sm,
    color: CosmicTheme.colors.stellarGold,
  },
  tipText: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.secondaryText,
    flex: 1,
  },
  affectedSignsContainer: {
    marginBottom: CosmicTheme.spacing.lg,
  },
  affectedSignsTitle: {
    ...CosmicTheme.typography.stellarSubtitle,
    color: CosmicTheme.colors.primaryText,
    marginBottom: CosmicTheme.spacing.sm,
  },
  signsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  signBadge: {
    backgroundColor: CosmicTheme.colors.glassBackground,
    borderWidth: 1,
    borderColor: CosmicTheme.colors.glassBorder,
    paddingHorizontal: CosmicTheme.spacing.sm,
    paddingVertical: CosmicTheme.spacing.xs,
    borderRadius: CosmicTheme.cornerRadius.small,
    marginRight: CosmicTheme.spacing.xs,
    marginBottom: CosmicTheme.spacing.xs,
  },
  userSignBadge: {
    backgroundColor: CosmicTheme.colors.cosmicPurple,
    borderColor: CosmicTheme.colors.stellarGold,
  },
  signText: {
    ...CosmicTheme.typography.cosmicLabel,
    color: CosmicTheme.colors.primaryText,
    fontWeight: '600',
  },
  userSignText: {
    color: CosmicTheme.colors.primaryText,
  },
  modalActions: {
    paddingBottom: CosmicTheme.spacing.xxxl,
  },
  calendarButton: {
    borderRadius: CosmicTheme.cornerRadius.medium,
    marginBottom: CosmicTheme.spacing.md,
    overflow: 'hidden',
  },
  calendarButtonGradient: {
    paddingVertical: CosmicTheme.spacing.md,
    alignItems: 'center',
  },
  calendarButtonText: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.primaryText,
    fontWeight: '600',
  },
  notificationToggleButton: {
    ...CosmicTheme.glassmorphism.glassButton,
    paddingVertical: CosmicTheme.spacing.md,
    alignItems: 'center',
  },
  notificationToggleButtonActive: {
    backgroundColor: CosmicTheme.colors.cosmicPurple,
  },
  notificationToggleText: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.primaryText,
    fontWeight: '600',
  },
  notificationToggleTextActive: {
    color: CosmicTheme.colors.primaryText,
  },
});

export default CosmicCelestialEvents;
