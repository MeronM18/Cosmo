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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
// import * as Notifications from 'expo-notifications'; // TODO: Install expo-notifications for notification functionality
import { iOS17Theme } from '../../theme/ios17Theme';
import { CosmicTheme } from '../../theme/cosmicTheme';
import { CelestialEvent, SectionProps } from '../../types/horoscopeExtensions';
import { CelestialEventsService } from '../../services/celestialEventsService';
import CelestialEventCardsContainer from './CelestialEventCardsContainer';

interface IOS17CelestialEventsProps extends SectionProps {
  selectedTimePeriod: string;
}

const { width } = Dimensions.get('window');

const IOS17CelestialEvents: React.FC<IOS17CelestialEventsProps> = ({
  userData,
  selectedTimePeriod,
  onPremiumUpgrade,
}) => {
  const [upcomingEvents, setUpcomingEvents] = useState<CelestialEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CelestialEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Load celestial events data (hardcoded 2025-2026 events)
  const loadCelestialEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get upcoming events for the next year (hardcoded data)
      const events = await CelestialEventsService.getUpcomingEvents(365);
      setUpcomingEvents(events);
      
      // Initialize notification settings for new events
      const settings: Record<string, boolean> = {};
      events.forEach(event => {
        settings[event.id] = false;
      });
      setNotificationSettings(settings);
      
    } catch (error: any) {
      console.error('Error loading celestial events:', error);
      setError('Failed to load celestial events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCelestialEvents();
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Refresh events when time period changes
  useEffect(() => {
    if (selectedTimePeriod) {
      loadCelestialEvents();
    }
  }, [selectedTimePeriod]);

  const normalizeEventType = (type: string) => {
    switch (type) {
      case 'moon_phase': return 'moonPhase';
      case 'meteor_shower': return 'meteorShower';
      // already camel or same naming
      case 'eclipse':
      case 'retrograde':
      case 'seasonal':
      case 'supermoon':
        return type;
      default:
        return 'default';
    }
  };

  const getEventTypeColor = (type: string) => {
    const key = normalizeEventType(type) as keyof typeof CosmicTheme.colors.celestial.types;
    const palette = CosmicTheme.colors.celestial.types[key] || CosmicTheme.colors.celestial.types.default;
    return palette.primary;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'eclipse': return '🌙';
      case 'retrograde': return '🔄';
      case 'station': return '⏸️';
      case 'seasonal': return '';
      case 'moon_phase': return '🌕';
      case 'meteor_shower': return '';
      case 'supermoon': return '🌕';
      default: return '⭐';
    }
  };

  const getImpactLevelColor = (level: string) => {
    const l = level as keyof typeof CosmicTheme.colors.celestial.impact;
    const impact = CosmicTheme.colors.celestial.impact[l] || CosmicTheme.colors.celestial.impact.low;
    return impact.bg;
  };

  const getDaysUntilEvent = (eventDate: Date) => {
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const openEventDetails = (event: CelestialEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleNotification = async (eventId: string) => {
    // TODO: Implement when expo-notifications is installed
    const newSettings = { ...notificationSettings };
    newSettings[eventId] = !newSettings[eventId];
    setNotificationSettings(newSettings);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Coming Soon', 'Notifications will be available once expo-notifications is installed.');
  };

  const addToCalendar = async (event: CelestialEvent) => {
    try {
      // In a real app, this would integrate with the device calendar
      Alert.alert(
        'Add to Calendar',
        `Would you like to add "${event.name}" to your calendar?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add', onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Success', 'Event added to calendar!');
          }}
        ]
      );
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Error', 'Failed to add event to calendar.');
    }
  };

  const isEventAffectingUser = (event: CelestialEvent) => {
    return event.affectedSigns.includes(userData.zodiacSign);
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
      {/* Title and Subtitle outside the card */}
      <Text style={styles.sectionTitle}>Upcoming Celestial Events</Text>
      <Text style={styles.sectionSubtitle}>Discover events near you</Text>

      <View style={styles.card}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>🌙 Connecting to the cosmos...</Text>
          </View>
        ) : (
          <View style={styles.eventsContainer}>
            {/* Travel Card-Inspired Celestial Event Cards */}
            <CelestialEventCardsContainer
              events={upcomingEvents.slice(0, 6)} // Show first 6 events in cards
              onEventPress={openEventDetails}
            />
            
            {/* Traditional List View for Additional Events */}
            {upcomingEvents.length > 6 && (
              <View style={styles.additionalEventsContainer}>
                <Text style={styles.additionalEventsTitle}>More Events</Text>
                <ScrollView 
                  style={styles.eventsList}
                  showsVerticalScrollIndicator={false}
                >
                  {upcomingEvents.slice(6).map((event) => {
                    const daysUntil = getDaysUntilEvent(event.startDate);
                    const isAffecting = isEventAffectingUser(event);
                    
                    return (
                      <TouchableOpacity
                        key={event.id}
                        style={[
                          styles.eventCard,
                          isAffecting && styles.affectingEventCard
                        ]}
                        onPress={() => openEventDetails(event)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.eventHeader}>
                          <View style={styles.eventTypeContainer}>
                            <Text style={styles.eventTypeIcon}>
                              {getEventTypeIcon(event.type)}
                            </Text>
                            <View style={[
                              styles.eventTypeBadge,
                              { backgroundColor: getEventTypeColor(event.type) }
                            ]}>
                              <Text style={styles.eventTypeText}>
                                {event.type.toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          
                          <View style={styles.eventActions}>
                            <TouchableOpacity
                              style={styles.notificationButton}
                              onPress={() => toggleNotification(event.id)}
                            >
                              <Text style={styles.notificationIcon}>
                                {notificationSettings[event.id] ? '🔔' : '🔕'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <Text style={styles.eventName}>{event.name}</Text>
                        
                        <View style={styles.eventDetails}>
                          <Text style={styles.eventDate}>
                            {formatEventDate(event.startDate)}
                          </Text>
                          <View style={[
                            styles.impactBadge,
                            { backgroundColor: getImpactLevelColor(event.impactLevel) }
                          ]}>
                            <Text style={styles.impactText}>
                              {event.impactLevel.toUpperCase()} IMPACT
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.eventDescription} numberOfLines={2}>
                          {event.description}
                        </Text>

                        <View style={styles.eventFooter}>
                          <Text style={styles.countdownText}>
                            {daysUntil > 0 ? `${daysUntil} days away` : 'Today!'}
                          </Text>
                          {isAffecting && (
                            <View style={styles.affectingBadge}>
                              <Text style={styles.affectingText}>AFFECTS YOU</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Cosmic Event Details Modal */}
      <Modal
        visible={showEventDetails}
        animationType="slide"
        onRequestClose={() => setShowEventDetails(false)}
        presentationStyle="overFullScreen"
      >
        {selectedEvent && (
          <View style={styles.cosmicModalContainer}>
            {/* Background Gradient */}
            <LinearGradient
              colors={
                selectedEvent.type === 'meteor_shower'
                  ? ['#0B1426', '#0B1426', '#0B1426']
                  : selectedEvent.type === 'seasonal'
                    ? ['#1A1D2E', '#2C3E50', '#34495E']
                    : ['#1A0B3D', '#6B46C1', '#EC4899']
              }
              style={styles.modalBackgroundGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <BlurView intensity={20} tint="dark" style={styles.cosmicModalBlurView}>
              {/* Cosmic Header with Parallax Effect */}
              <LinearGradient
                colors={
                  selectedEvent.type === 'meteor_shower'
                    ? ['#0B1426', '#0B1426', '#0B1426']
                    : selectedEvent.type === 'seasonal'
                      ? ['#1A1D2E', '#2C3E50', '#34495E']
                      : [
                          getEventTypeColor(selectedEvent.type),
                          getEventTypeColor(selectedEvent.type) + '80'
                        ]
                }
                style={styles.cosmicModalHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cosmicHeaderContent}>
                  <View style={styles.headerLeft}>
                    <Text style={styles.eventTypeIcon}>
                      {getEventTypeIcon(selectedEvent.type)}
                    </Text>
                    <View style={styles.headerTextContainer}>
                      <Text style={[
                        styles.cosmicModalTitle,
                        selectedEvent.type === 'meteor_shower' && styles.meteorShowerText,
                            selectedEvent.type === 'seasonal' && styles.winterSolsticeText,
                        selectedEvent.type === 'seasonal' && styles.winterSolsticeText
                      ]}>
                        {selectedEvent.name}
                      </Text>
                      <Text style={[
                        styles.cosmicModalSubtitle,
                        selectedEvent.type === 'meteor_shower' && styles.meteorShowerSecondaryText,
                          selectedEvent.type === 'seasonal' && styles.winterSolsticeSecondaryText,
                        selectedEvent.type === 'seasonal' && styles.winterSolsticeSecondaryText
                      ]}>
                        {formatEventDate(selectedEvent.startDate)} • {selectedEvent.type === 'meteor_shower' ? 'Meteor Shower' : selectedEvent.type === 'seasonal' ? 'Winter Solstice' : selectedEvent.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.cosmicCloseButton}
                    onPress={() => setShowEventDetails(false)}
                  >
                    <BlurView intensity={20} tint="light" style={styles.closeButtonBlur}>
                      <Text style={styles.cosmicCloseButtonText}>✕</Text>
                    </BlurView>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              
              <ScrollView 
                style={styles.cosmicModalContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.cosmicModalScrollContent}
              >
                {/* Event Impact Badge */}
                <View style={styles.impactSection}>
                  <LinearGradient
                    colors={
                      selectedEvent.type === 'meteor_shower'
                        ? ['#FFFFFF', '#FFFFFF', '#FFFFFF']
                        : selectedEvent.type === 'seasonal'
                          ? ['#BEE3F8', '#BEE3F8', '#BEE3F8']
                          : selectedEvent.impactLevel === 'high'
                            ? ['#BEE3F8', '#BEE3F8', '#BEE3F8']
                            : [
                                getImpactLevelColor(selectedEvent.impactLevel),
                                getImpactLevelColor(selectedEvent.impactLevel) + '60'
                              ]
                    }
                    style={styles.impactBadgeContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={[
                      styles.impactBadgeText,
                      selectedEvent.type === 'meteor_shower' && {
                        color: '#000000',
                        fontWeight: '700',
                      },
                      selectedEvent.type === 'seasonal' && {
                        color: '#000000',
                        fontWeight: '700',
                      }
                    ]}>
                      {selectedEvent.impactLevel.toUpperCase()} IMPACT
                    </Text>
                  </LinearGradient>
                </View>

                {/* Event Information Cards */}
                <View style={styles.cosmicEventInfoContainer}>
                  <BlurView 
                    intensity={15} 
                    tint="dark" 
                    style={[
                      styles.infoCard,
                      selectedEvent.type === 'meteor_shower' && styles.meteorShowerCard,
                      selectedEvent.type === 'seasonal' && styles.winterSolsticeCard
                    ]}
                  >
                    <View style={[
                      styles.infoCardHeader,
                      selectedEvent.type === 'meteor_shower' && styles.meteorShowerHeader,
                      selectedEvent.type === 'seasonal' && styles.winterSolsticeHeader
                    ]}>
                      <Text style={[
                        styles.infoCardTitle,
                        selectedEvent.type === 'meteor_shower' && styles.meteorShowerText,
                            selectedEvent.type === 'seasonal' && styles.winterSolsticeText,
                        selectedEvent.type === 'seasonal' && styles.winterSolsticeText
                      ]}>
                        Event Details
                      </Text>
                    </View>
                    
                    <View style={styles.infoCardContent}>
                      <View style={styles.infoRow}>
                        <Text style={[
                          styles.infoLabel,
                          selectedEvent.type === 'meteor_shower' && styles.meteorShowerSecondaryText,
                          selectedEvent.type === 'seasonal' && styles.winterSolsticeSecondaryText
                        ]}>
                          Type
                        </Text>
                        <View style={styles.infoValueContainer}>
                          <Text style={[
                            styles.infoValue,
                            selectedEvent.type === 'meteor_shower' && styles.meteorShowerText,
                            selectedEvent.type === 'seasonal' && styles.winterSolsticeText
                          ]}>
                            {selectedEvent.type === 'meteor_shower' ? 'Meteor Shower' : selectedEvent.type === 'seasonal' ? 'Winter Solstice' : selectedEvent.type.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Text style={[
                          styles.infoLabel,
                          selectedEvent.type === 'meteor_shower' && styles.meteorShowerSecondaryText,
                          selectedEvent.type === 'seasonal' && styles.winterSolsticeSecondaryText
                        ]}>
                          Date
                        </Text>
                        <Text style={[
                          styles.infoValue,
                          selectedEvent.type === 'meteor_shower' && styles.meteorShowerText,
                            selectedEvent.type === 'seasonal' && styles.winterSolsticeText
                        ]}>
                          {selectedEvent.startDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                      
                      {selectedEvent.endDate && (
                        <View style={styles.infoRow}>
                          <Text style={[
                            styles.infoLabel,
                            selectedEvent.type === 'meteor_shower' && styles.meteorShowerSecondaryText,
                          selectedEvent.type === 'seasonal' && styles.winterSolsticeSecondaryText
                          ]}>
                            Duration
                          </Text>
                          <Text style={[
                            styles.infoValue,
                            selectedEvent.type === 'meteor_shower' && styles.meteorShowerText,
                            selectedEvent.type === 'seasonal' && styles.winterSolsticeText
                          ]}>
                            {Math.ceil((selectedEvent.endDate.getTime() - selectedEvent.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                          </Text>
                        </View>
                      )}
                    </View>
                  </BlurView>
                </View>

                {/* Description Section */}
                <View style={styles.cosmicDescriptionContainer}>
                  <BlurView 
                    intensity={15} 
                    tint="dark" 
                    style={[
                      styles.descriptionCard,
                      selectedEvent.type === 'meteor_shower' && styles.meteorShowerCard,
                      selectedEvent.type === 'seasonal' && styles.winterSolsticeCard
                    ]}
                  >
                    <View style={[
                      styles.descriptionCardHeader,
                      selectedEvent.type === 'meteor_shower' && styles.meteorShowerHeader,
                      selectedEvent.type === 'seasonal' && styles.winterSolsticeHeader
                    ]}>
                      <Text style={[
                        styles.descriptionCardTitle,
                        selectedEvent.type === 'meteor_shower' && styles.meteorShowerText,
                            selectedEvent.type === 'seasonal' && styles.winterSolsticeText
                      ]}>
                        Description
                      </Text>
                    </View>
                    <Text style={[
                      styles.cosmicDescriptionText,
                      selectedEvent.type === 'meteor_shower' && styles.meteorShowerSecondaryText,
                          selectedEvent.type === 'seasonal' && styles.winterSolsticeSecondaryText
                    ]}>
                      {selectedEvent.description}
                    </Text>
                  </BlurView>
                </View>

                {/* Preparation Tips Section */}
                <View style={styles.cosmicPreparationContainer}>
                  <BlurView 
                    intensity={15} 
                    tint="dark" 
                    style={[
                      styles.preparationCard,
                      selectedEvent.type === 'meteor_shower' && styles.meteorShowerCard,
                      selectedEvent.type === 'seasonal' && styles.winterSolsticeCard
                    ]}
                  >
                    <View style={[
                      styles.preparationCardHeader,
                      selectedEvent.type === 'meteor_shower' && styles.meteorShowerHeader,
                      selectedEvent.type === 'seasonal' && styles.winterSolsticeHeader
                    ]}>
                      <Text style={[
                        styles.preparationCardTitle,
                        selectedEvent.type === 'meteor_shower' && styles.meteorShowerText,
                            selectedEvent.type === 'seasonal' && styles.winterSolsticeText
                      ]}>
                        Preparation Tips
                      </Text>
                    </View>
                    <View style={styles.preparationCardContent}>
                      {selectedEvent.preparationTips.map((tip, index) => (
                        <View key={index} style={styles.cosmicTipItem}>
                          <Text style={[
                            styles.dashedBullet,
                            selectedEvent.type === 'meteor_shower' && styles.meteorShowerSecondaryText,
                          selectedEvent.type === 'seasonal' && styles.winterSolsticeSecondaryText
                          ]}>
                            —
                          </Text>
                          <Text style={[
                            styles.cosmicTipText,
                            selectedEvent.type === 'meteor_shower' && styles.meteorShowerSecondaryText,
                          selectedEvent.type === 'seasonal' && styles.winterSolsticeSecondaryText
                          ]}>
                            {tip}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </BlurView>
                </View>

                {/* Affected Signs Section */}
                <View style={styles.cosmicAffectedSignsContainer}>
                  <BlurView 
                    intensity={15} 
                    tint="dark" 
                    style={[
                      styles.signsCard,
                      selectedEvent.type === 'meteor_shower' && styles.meteorShowerCard,
                      selectedEvent.type === 'seasonal' && styles.winterSolsticeCard
                    ]}
                  >
                    <View style={[
                      styles.signsCardHeader,
                      selectedEvent.type === 'meteor_shower' && styles.meteorShowerHeader,
                      selectedEvent.type === 'seasonal' && styles.winterSolsticeHeader
                    ]}>
                      <Text style={[
                        styles.signsCardTitle,
                        selectedEvent.type === 'meteor_shower' && styles.meteorShowerText,
                            selectedEvent.type === 'seasonal' && styles.winterSolsticeText
                      ]}>
                        Most Affected Signs
                      </Text>
                    </View>
                    <View style={styles.cosmicSignsList}>
                      {selectedEvent.affectedSigns.map((sign, index) => (
                        <View
                          key={index}
                          style={[
                            styles.cosmicSignBadge,
                            sign === userData.zodiacSign && styles.cosmicUserSignBadge
                          ]}
                        >
                          <LinearGradient
                            colors={
                              sign === userData.zodiacSign
                                ? selectedEvent.type === 'meteor_shower'
                                  ? ['#C084FC', '#8B5CF6', '#EC4899']
                                  : selectedEvent.type === 'seasonal'
                                    ? ['#BEE3F8', '#90CDF4', '#76E4F7']
                                    : ['#F59E0B', '#F97316', '#EF4444']
                                : selectedEvent.type === 'meteor_shower'
                                  ? ['rgba(139, 92, 246, 0.2)', 'rgba(192, 132, 252, 0.1)']
                                  : selectedEvent.type === 'seasonal'
                                    ? ['rgba(190, 227, 248, 0.2)', 'rgba(144, 205, 244, 0.1)']
                                    : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                            }
                            style={styles.signBadgeGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <Text style={[
                              styles.cosmicSignText,
                              sign === userData.zodiacSign && styles.cosmicUserSignText
                            ]}>
                              {sign}
                            </Text>
                            {sign === userData.zodiacSign && (
                              <Text style={styles.userIndicator}>YOU</Text>
                            )}
                          </LinearGradient>
                        </View>
                      ))}
                    </View>
                  </BlurView>
                </View>

                {/* Action Buttons */}
                <View style={styles.cosmicModalActions}>
                  <TouchableOpacity
                    style={styles.cosmicCalendarButton}
                    onPress={() => addToCalendar(selectedEvent)}
                  >
                    <LinearGradient
                      colors={
                        selectedEvent.type === 'meteor_shower'
                          ? ['#0B1426', '#1E3A8A', '#1E40AF']
                          : selectedEvent.type === 'seasonal'
                            ? ['#BEE3F8', '#90CDF4', '#76E4F7']
                            : ['#F59E0B', '#F97316', '#EF4444']
                      }
                      style={styles.calendarButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.calendarButtonIcon}>📅</Text>
                      <Text style={[
                        styles.cosmicCalendarButtonText,
                        selectedEvent.type === 'meteor_shower' && styles.meteorShowerText,
                            selectedEvent.type === 'seasonal' && styles.winterSolsticeText
                      ]}>
                        Add to Calendar
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.cosmicNotificationButton,
                      notificationSettings[selectedEvent.id] && styles.cosmicNotificationButtonActive
                    ]}
                    onPress={() => toggleNotification(selectedEvent.id)}
                  >
                    <BlurView 
                      intensity={notificationSettings[selectedEvent.id] ? 30 : 15} 
                      tint={notificationSettings[selectedEvent.id] ? "light" : "dark"} 
                      style={styles.notificationButtonBlur}
                    >
                      <Text style={styles.notificationButtonIcon}>
                        {notificationSettings[selectedEvent.id] ? '🔔' : '🔕'}
                      </Text>
                      <Text style={[
                        styles.cosmicNotificationButtonText,
                        notificationSettings[selectedEvent.id] && styles.cosmicNotificationButtonTextActive,
                        selectedEvent.type === 'meteor_shower' && styles.meteorShowerText,
                            selectedEvent.type === 'seasonal' && styles.winterSolsticeText
                      ]}>
                        {notificationSettings[selectedEvent.id] ? 'Notifications On' : 'Notifications Off'}
                      </Text>
                    </BlurView>
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
    marginVertical: iOS17Theme.spacing.md,
  },
  sectionTitle: {
    ...iOS17Theme.text.sectionTitle,
    marginBottom: iOS17Theme.spacing.xs,
    paddingHorizontal: iOS17Theme.spacing.lg,
  },
  sectionSubtitle: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.secondaryLabel,
    marginBottom: iOS17Theme.spacing.md,
    paddingHorizontal: iOS17Theme.spacing.lg,
  },
  card: {
    marginHorizontal: iOS17Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  refreshButton: {
    padding: iOS17Theme.spacing.sm,
    marginLeft: iOS17Theme.spacing.sm,
  },
  refreshIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  title: {
    ...iOS17Theme.text.sectionTitle,
    marginBottom: 0,
  },
  subtitle: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.secondaryLabel,
  },
  eventsContainer: {
    // Container for both card view and list view
  },
  additionalEventsContainer: {
    marginTop: iOS17Theme.spacing.lg,
  },
  additionalEventsTitle: {
    ...iOS17Theme.text.sectionTitle,
    marginBottom: iOS17Theme.spacing.md,
    paddingHorizontal: iOS17Theme.spacing.lg,
  },
  eventsList: {
    // maxHeight: 400, // Removed for native animation compatibility
  },
  eventCard: {
    backgroundColor: iOS17Theme.colors.systemBackground,
    borderRadius: iOS17Theme.cornerRadius.medium,
    padding: iOS17Theme.spacing.md,
    marginBottom: iOS17Theme.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: iOS17Theme.colors.separator,
  },
  affectingEventCard: {
    borderColor: iOS17Theme.colors.systemOrange,
    borderWidth: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.sm,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTypeIcon: {
    fontSize: 20,
    marginRight: iOS17Theme.spacing.xs,
  },
  eventTypeBadge: {
    paddingHorizontal: iOS17Theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: iOS17Theme.cornerRadius.small,
  },
  eventTypeText: {
    ...iOS17Theme.typography.caption2,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  eventActions: {
    flexDirection: 'row',
  },
  notificationButton: {
    padding: 4,
  },
  notificationIcon: {
    fontSize: 16,
  },
  eventName: {
    ...iOS17Theme.typography.headline,
    marginBottom: iOS17Theme.spacing.xs,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.sm,
  },
  eventDate: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.secondaryLabel,
  },
  impactBadge: {
    paddingHorizontal: iOS17Theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: iOS17Theme.cornerRadius.small,
  },
  impactText: {
    ...iOS17Theme.typography.caption2,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  eventDescription: {
    ...iOS17Theme.typography.body,
    color: iOS17Theme.colors.secondaryLabel,
    marginBottom: iOS17Theme.spacing.sm,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countdownText: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.systemBlue,
    fontWeight: '600',
  },
  affectingBadge: {
    backgroundColor: iOS17Theme.colors.systemOrange,
    paddingHorizontal: iOS17Theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: iOS17Theme.cornerRadius.small,
  },
  affectingText: {
    ...iOS17Theme.typography.caption2,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: iOS17Theme.colors.systemGroupedBackground,
  },
  modalBlurView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: iOS17Theme.spacing.lg,
    paddingVertical: iOS17Theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: iOS17Theme.colors.separator,
  },
  modalTitle: {
    ...iOS17Theme.text.sectionTitle,
    marginBottom: 0,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: iOS17Theme.colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    ...iOS17Theme.typography.headline,
    color: iOS17Theme.colors.label,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: iOS17Theme.spacing.lg,
  },
  eventInfoContainer: {
    backgroundColor: iOS17Theme.colors.systemBackground,
    borderRadius: iOS17Theme.cornerRadius.medium,
    padding: iOS17Theme.spacing.md,
    marginVertical: iOS17Theme.spacing.md,
  },
  eventInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.sm,
  },
  eventInfoLabel: {
    ...iOS17Theme.typography.caption1,
    color: iOS17Theme.colors.secondaryLabel,
  },
  eventInfoValue: {
    ...iOS17Theme.typography.caption1,
  },
  descriptionContainer: {
    marginBottom: iOS17Theme.spacing.lg,
  },
  descriptionTitle: {
    ...iOS17Theme.typography.caption1,
    marginBottom: iOS17Theme.spacing.sm,
  },
  descriptionText: {
    ...iOS17Theme.typography.body,
    lineHeight: 22,
  },
  preparationContainer: {
    marginBottom: iOS17Theme.spacing.lg,
  },
  preparationTitle: {
    ...iOS17Theme.typography.caption1,
    marginBottom: iOS17Theme.spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: iOS17Theme.spacing.xs,
  },
  tipBullet: {
    ...iOS17Theme.typography.body,
    marginRight: iOS17Theme.spacing.sm,
    color: iOS17Theme.colors.systemBlue,
  },
  tipText: {
    ...iOS17Theme.typography.body,
    flex: 1,
  },
  affectedSignsContainer: {
    marginBottom: iOS17Theme.spacing.lg,
  },
  affectedSignsTitle: {
    ...iOS17Theme.typography.caption1,
    marginBottom: iOS17Theme.spacing.sm,
  },
  signsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  signBadge: {
    backgroundColor: iOS17Theme.colors.systemFill,
    paddingHorizontal: iOS17Theme.spacing.sm,
    paddingVertical: iOS17Theme.spacing.xs,
    borderRadius: iOS17Theme.cornerRadius.small,
    marginRight: iOS17Theme.spacing.xs,
    marginBottom: iOS17Theme.spacing.xs,
  },
  userSignBadge: {
    backgroundColor: iOS17Theme.colors.systemBlue,
  },
  signText: {
    ...iOS17Theme.typography.caption1,
    fontWeight: '600',
  },
  userSignText: {
    color: '#FFFFFF',
  },
  modalActions: {
    paddingBottom: iOS17Theme.spacing.xl,
  },
  calendarButton: {
    backgroundColor: iOS17Theme.colors.systemGreen,
    paddingVertical: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.medium,
    alignItems: 'center',
    marginBottom: iOS17Theme.spacing.sm,
  },
  calendarButtonText: {
    ...iOS17Theme.typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notificationToggleButton: {
    backgroundColor: iOS17Theme.colors.systemFill,
    paddingVertical: iOS17Theme.spacing.md,
    borderRadius: iOS17Theme.cornerRadius.medium,
    alignItems: 'center',
  },
  notificationToggleButtonActive: {
    backgroundColor: iOS17Theme.colors.systemBlue,
  },
  notificationToggleText: {
    ...iOS17Theme.typography.headline,
    fontWeight: '600',
  },
  notificationToggleTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: iOS17Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...iOS17Theme.typography.body,
    color: iOS17Theme.colors.secondaryLabel,
    textAlign: 'center',
  },
  
  // Cosmic Modal Styles
  cosmicModalContainer: {
    flex: 1,
    backgroundColor: CosmicTheme.colors.primaryBackground,
  },
  modalBackgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cosmicModalBlurView: {
    flex: 1,
  },
  cosmicModalHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cosmicHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  cosmicModalTitle: {
    ...CosmicTheme.typography.constellationHeader,
    color: CosmicTheme.colors.primaryText,
    marginBottom: 4,
    lineHeight: 28,
  },
  cosmicModalSubtitle: {
    ...CosmicTheme.typography.stellarCaption,
    color: CosmicTheme.colors.secondaryText,
    opacity: 0.9,
  },
  cosmicCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cosmicCloseButtonText: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.primaryText,
    fontWeight: '600',
    fontSize: 18,
  },
  cosmicModalContent: {
    flex: 1,
  },
  cosmicModalScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  impactSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  impactBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    ...CosmicTheme.shadows.glow,
  },
  impactBadgeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  impactBadgeText: {
    ...CosmicTheme.typography.impactText,
    color: CosmicTheme.colors.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  cosmicEventInfoContainer: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoCardHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoCardTitle: {
    ...CosmicTheme.typography.stellarSubtitle,
    color: CosmicTheme.colors.primaryText,
    fontSize: 16,
  },
  infoCardContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    ...CosmicTheme.typography.cosmicLabel,
    color: CosmicTheme.colors.secondaryText,
    flex: 1,
  },
  infoValueContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  infoValue: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.primaryText,
    textAlign: 'right',
  },
  cosmicDescriptionContainer: {
    marginBottom: 20,
  },
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  descriptionCardHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  descriptionCardTitle: {
    ...CosmicTheme.typography.stellarSubtitle,
    color: CosmicTheme.colors.primaryText,
    fontSize: 16,
  },
  cosmicDescriptionText: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.secondaryText,
    lineHeight: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  cosmicPreparationContainer: {
    marginBottom: 20,
  },
  preparationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  preparationCardHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  preparationCardTitle: {
    ...CosmicTheme.typography.stellarSubtitle,
    color: CosmicTheme.colors.primaryText,
    fontSize: 16,
  },
  preparationCardContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  cosmicTipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tipIcon: {
    fontSize: 12,
  },
  dashedBullet: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.primaryText,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  cosmicTipText: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.secondaryText,
    flex: 1,
    lineHeight: 22,
  },
  cosmicAffectedSignsContainer: {
    marginBottom: 20,
  },
  signsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  signsCardHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  signsCardTitle: {
    ...CosmicTheme.typography.stellarSubtitle,
    color: CosmicTheme.colors.primaryText,
    fontSize: 16,
  },
  cosmicSignsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  cosmicSignBadge: {
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cosmicUserSignBadge: {
    ...CosmicTheme.shadows.glow,
  },
  signBadgeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cosmicSignText: {
    ...CosmicTheme.typography.cosmicLabel,
    color: CosmicTheme.colors.primaryText,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cosmicUserSignText: {
    color: CosmicTheme.colors.primaryText,
    fontWeight: '700',
  },
  userIndicator: {
    ...CosmicTheme.typography.impactText,
    color: CosmicTheme.colors.primaryText,
    fontSize: 8,
    marginTop: 2,
  },
  cosmicModalActions: {
    marginTop: 8,
  },
  cosmicCalendarButton: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...CosmicTheme.shadows.card,
  },
  calendarButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  calendarButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cosmicCalendarButtonText: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.primaryText,
    fontWeight: '600',
  },
  cosmicNotificationButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cosmicNotificationButtonActive: {
    ...CosmicTheme.shadows.glow,
  },
  notificationButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cosmicNotificationButtonText: {
    ...CosmicTheme.typography.cosmicBody,
    color: CosmicTheme.colors.primaryText,
    fontWeight: '600',
  },
  cosmicNotificationButtonTextActive: {
    color: CosmicTheme.colors.primaryText,
  },
  
  // Meteor Shower Specific Styles
  meteorShowerImpactBadge: {
    ...CosmicTheme.shadows.glow,
    borderWidth: 1,
    borderColor: CosmicTheme.colors.meteorShower.meteorGlow,
  },
  meteorShowerText: {
    color: CosmicTheme.colors.meteorShower.brightMeteorWhite,
  },
  meteorShowerSecondaryText: {
    color: CosmicTheme.colors.meteorShower.milkyWayLavender,
  },
  meteorShowerTertiaryText: {
    color: CosmicTheme.colors.meteorShower.spaceDust,
  },
  meteorShowerCard: {
    backgroundColor: 'rgba(11, 20, 38, 0.8)',
    borderWidth: 1,
    borderColor: CosmicTheme.colors.meteorShower.cosmicBorder,
  },
  meteorShowerHeader: {
    backgroundColor: 'rgba(45, 27, 105, 0.3)',
  },
  
  // Winter Solstice Specific Styles
  winterSolsticeText: {
    color: CosmicTheme.colors.winterSolstice.freshSnow,
  },
  winterSolsticeSecondaryText: {
    color: CosmicTheme.colors.winterSolstice.powderSnow,
  },
  winterSolsticeTertiaryText: {
    color: CosmicTheme.colors.winterSolstice.frozenMist,
  },
  winterSolsticeCard: {
    backgroundColor: 'rgba(26, 29, 46, 0.8)',
    borderWidth: 1,
    borderColor: CosmicTheme.colors.winterSolstice.iceGlaze,
  },
  winterSolsticeHeader: {
    backgroundColor: 'rgba(44, 62, 80, 0.3)',
  },
});

export default IOS17CelestialEvents;
