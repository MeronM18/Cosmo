import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Linking, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cinzel_700Bold, Cinzel_400Regular } from '@expo-google-fonts/cinzel';
import * as Haptics from 'expo-haptics';
import { AppColors } from '../theme/appTheme';
import { RevenueCatService } from '../services/revenueCat';
import Purchases from 'react-native-purchases';
import { logger } from '../utils/logger';

const { width } = Dimensions.get('window');

type PlanKey = 'trial' | 'weekly' | 'yearly';

interface PaywallScreenProps {
  onStartTrial?: (plan: PlanKey) => void;
}

const StarField: React.FC = () => {
  const stars = useMemo(
    () => Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * 260 + 20,
      size: Math.random() * 2 + 1,
      opacity: new Animated.Value(Math.random() * 0.6 + 0.2),
    })),
    []
  );

  useEffect(() => {
    stars.forEach((s) => {
      const loop = () => {
        Animated.sequence([
          Animated.timing(s.opacity, { toValue: Math.random() * 0.9 + 0.1, duration: 1500, useNativeDriver: true }),
          Animated.timing(s.opacity, { toValue: Math.random() * 0.6 + 0.2, duration: 1800, useNativeDriver: true }),
        ]).start(loop);
      };
      loop();
    });
  }, [stars]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s) => (
        <Animated.View key={s.id} style={[styles.star, { left: s.x, top: s.y, width: s.size, height: s.size, opacity: s.opacity }]} />
      ))}
    </View>
  );
};

const PaywallScreen: React.FC<PaywallScreenProps> = ({ onStartTrial }) => {
  const [selected, setSelected] = useState<PlanKey>('trial');
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [itemAnimations] = useState(() => 
    Array.from({ length: 6 }, () => new Animated.Value(0))
  );
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Cinzel_400Regular,
  });

  // Purchase flow state
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [offerings, setOfferings] = useState<any>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Initialize RevenueCat and load offerings
  useEffect(() => {
    const initializePaywall = async () => {
      try {
        await RevenueCatService.initialize();
        const offeringsData = await RevenueCatService.getOfferings();
        setOfferings(offeringsData);
      } catch (error) {
        // Silently handle RevenueCat errors - use mock data instead
        logger.error('Failed to initialize RevenueCat:', error);
        setOfferings({
          current: {
            availablePackages: [
              {
                identifier: 'cosmo_weekly',
                product: {
                  title: 'Weekly Premium',
                  priceString: '$4.99',
                  identifier: 'cosmo_weekly'
                }
              },
              {
                identifier: 'cosmo_yearly',
                product: {
                  title: 'Yearly Premium',
                  priceString: '$49.99',
                  identifier: 'cosmo_yearly'
                }
              }
            ]
          }
        });
      }
    };

    initializePaywall();
  }, []);

  // Initialize item animations on mount
  useEffect(() => {
    const staggerDelay = 30;
    itemAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 150,
        delay: index * staggerDelay,
        useNativeDriver: true
      }).start();
    });
  }, [selected]);

  const handlePlanChange = (plan: PlanKey) => {
    // Haptic feedback for plan selection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Reset item animations
    itemAnimations.forEach(anim => anim.setValue(0));
    
    // Smooth transition sequence
    Animated.parallel([
      // Fade out current content
      Animated.timing(fadeAnim, { 
        toValue: 0, 
        duration: 150, 
        useNativeDriver: true 
      }),
      // Slight scale down for smooth effect
      Animated.timing(scaleAnim, { 
        toValue: 0.95, 
        duration: 150, 
        useNativeDriver: true 
      }),
      // Slide up slightly
      Animated.timing(slideAnim, { 
        toValue: -10, 
        duration: 150, 
        useNativeDriver: true 
      })
    ]).start(() => {
      // Update selected plan
      setSelected(plan);
      
      // Animate back in with enhanced effects
      Animated.parallel([
        Animated.timing(fadeAnim, { 
          toValue: 1, 
          duration: 250, 
          useNativeDriver: true 
        }),
        Animated.spring(scaleAnim, { 
          toValue: 1, 
          tension: 120,
          friction: 6,
          useNativeDriver: true 
        }),
        Animated.timing(slideAnim, { 
          toValue: 0, 
          duration: 250, 
          useNativeDriver: true 
        })
      ]).start(() => {
        // Staggered animation for items
        const staggerDelay = 30;
        const itemDuration = 150;
        itemAnimations.forEach((anim, index) => {
          Animated.timing(anim, {
            toValue: 1,
            duration: itemDuration,
            delay: index * staggerDelay,
            useNativeDriver: true
          }).start();
        });
      });
    });
  };

  const handlePurchase = async () => {
    if (isPurchasing) return;

    setIsPurchasing(true);
    setPurchaseError(null);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Handle trial option differently
      if (selected === 'trial') {
        // For trial, we'll start the trial and then let user choose a plan
        console.log('Starting free trial...');
        
        // Success haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Call the success callback for trial
        onStartTrial?.(selected);
        return;
      }

      // Get the package for the selected plan
      const packageToPurchase = offerings?.current?.availablePackages.find(
        (pkg: any) => pkg.identifier === `cosmo_${selected}`
      );

      if (!packageToPurchase) {
        throw new Error(`Subscription plan not found: cosmo_${selected}`);
      }

      console.log('Starting purchase for package:', packageToPurchase.identifier);

      // Make the purchase
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

      // Check if purchase was successful
      if (customerInfo.entitlements.active['premium']) {
        console.log('Purchase successful! User now has premium access.');
        
        // Success haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Call the success callback
        onStartTrial?.(selected);
      } else {
        throw new Error('Purchase completed but premium access not granted');
      }

    } catch (error: any) {
      logger.error('Purchase failed:', error);
      
      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Handle specific error types
      if (error.code === 'PURCHASES_ERROR_PURCHASE_CANCELLED') {
        setPurchaseError('Purchase was cancelled');
      } else if (error.code === 'PURCHASES_ERROR_PAYMENT_PENDING') {
        setPurchaseError('Payment is pending. Please check your payment method.');
      } else if (error.code === 'PURCHASES_ERROR_PRODUCT_NOT_AVAILABLE_FOR_PURCHASE') {
        setPurchaseError('This subscription is not available for purchase.');
      } else {
        setPurchaseError(error.message || 'Purchase failed. Please try again.');
      }

      // Show error alert
      Alert.alert(
        'Purchase Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsPurchasing(true);
      const customerInfo = await Purchases.restorePurchases();
      
      if (customerInfo.entitlements.active['premium']) {
        Alert.alert(
          'Purchases Restored',
          'Your premium subscription has been restored!',
          [{ text: 'OK', onPress: () => onStartTrial?.(selected) }]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'No active subscriptions were found to restore.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      logger.error('Restore failed:', error);
      Alert.alert(
        'Restore Failed',
        'Failed to restore purchases. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image 
        source={require('../../assets/paywallbackground.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
        fadeDuration={0}
      />
      
      
      {/* Dark Gradient Overlay for Bottom Half */}
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
        locations={[0, 0.4, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      <StarField />


      {/* Title */}
      <View style={[styles.titleWrap, { paddingTop: 100 }]}>
        <Text style={[
          styles.title,
          fontsLoaded && { fontFamily: 'Cinzel_700Bold' }
        ]}>
          Unlock Cosmo
        </Text>
        <Text style={[
          styles.subtitle,
          fontsLoaded && { fontFamily: 'Cinzel_400Regular' }
        ]}>
          Premium cosmic insights
        </Text>
      </View>

      {/* Animated Content Area - Fixed height container */}
      <Animated.View style={[
        styles.contentArea, 
        { 
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}>
        <View style={styles.contentContainer}>
          {/* Features List - Show when trial is selected */}
          {selected === 'trial' && (
            <View style={styles.featuresList}>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[0],
                  transform: [
                    { translateY: itemAnimations[0].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Try all premium features for free</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[1],
                  transform: [
                    { translateY: itemAnimations[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>No commitment required</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[2],
                  transform: [
                    { translateY: itemAnimations[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Cancel anytime during trial</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[3],
                  transform: [
                    { translateY: itemAnimations[3].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Full access to cosmic insights</Text>
              </Animated.View>
            </View>
          )}

          {/* Features List - Show when weekly is selected */}
          {selected === 'weekly' && (
            <View style={styles.featuresList}>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[0],
                  transform: [
                    { translateY: itemAnimations[0].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Unlimited personalized horoscopes</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[1],
                  transform: [
                    { translateY: itemAnimations[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Complete birth chart analysis</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[2],
                  transform: [
                    { translateY: itemAnimations[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Advanced compatibility reports</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[3],
                  transform: [
                    { translateY: itemAnimations[3].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>AI astrologer chat</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[4],
                  transform: [
                    { translateY: itemAnimations[4].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Transit forecasts & predictions</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[5],
                  transform: [
                    { translateY: itemAnimations[5].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Moon phase rituals & guidance</Text>
              </Animated.View>
            </View>
          )}


          {/* Yearly content - Show when yearly is selected */}
          {selected === 'yearly' && (
            <View style={styles.featuresList}>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[0],
                  transform: [
                    { translateY: itemAnimations[0].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Unlimited personalized horoscopes</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[1],
                  transform: [
                    { translateY: itemAnimations[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Complete birth chart analysis</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[2],
                  transform: [
                    { translateY: itemAnimations[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Advanced compatibility reports</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[3],
                  transform: [
                    { translateY: itemAnimations[3].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>AI astrologer chat</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[4],
                  transform: [
                    { translateY: itemAnimations[4].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Transit forecasts & predictions</Text>
              </Animated.View>
              <Animated.View style={[
                styles.featureItem,
                {
                  opacity: itemAnimations[5],
                  transform: [
                    { translateY: itemAnimations[5].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Moon phase rituals & guidance</Text>
              </Animated.View>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Fixed Bottom Section - Always in same position */}
      <View style={styles.fixedBottomSection}>
        {/* All Plans in consistent layout */}
        <View style={styles.plansContainer}>
          {/* Free Trial Option */}
          <TouchableOpacity
            style={[styles.trialCard, selected === 'trial' && styles.trialSelected]}
            onPress={() => handlePlanChange('trial')}
            activeOpacity={0.9}
          >
            <View style={styles.trialContent}>
              <View style={styles.trialText}>
                <Text style={styles.trialLabel}>1 Day Free Trial</Text>
                <Text style={styles.trialSubtext}>Then $49.99 annually</Text>
              </View>
              <View style={[styles.radioCircle, selected === 'trial' && styles.radioSelected]}>
                {selected === 'trial' && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </View>
          </TouchableOpacity>

          {/* Weekly and Yearly Plans */}
          <View style={styles.planRow}>
            <TouchableOpacity
              style={[styles.planCard, styles.planCardWeekly, selected === 'weekly' && styles.planSelected]}
              onPress={() => handlePlanChange('weekly')}
              activeOpacity={0.9}
            >
              <View style={styles.planContent}>
                <View style={styles.planText}>
                  <Text style={styles.planLabel}>Weekly</Text>
                  <Text style={styles.planPrice}>$4.99</Text>
                </View>
                <View style={[styles.radioCircle, selected === 'weekly' && styles.radioSelected]}>
                  {selected === 'weekly' && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.yearlyContainer}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>Save 83%</Text>
              </View>
              <TouchableOpacity
                style={[styles.planCard, styles.planCardYearly, selected === 'yearly' && styles.planSelected]}
                onPress={() => handlePlanChange('yearly')}
                activeOpacity={0.9}
              >
                <View style={styles.planContent}>
                  <View style={styles.planText}>
                    <Text style={styles.planLabel}>Yearly</Text>
                    <Text style={styles.planPrice}>$49.99</Text>
                  </View>
                  <View style={[styles.radioCircle, selected === 'yearly' && styles.radioSelected]}>
                    {selected === 'yearly' && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      {/* CTA */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePurchase}
          style={[styles.ctaButton, isPurchasing && styles.ctaButtonDisabled]}
          disabled={isPurchasing}
        >
          <LinearGradient
            colors={isPurchasing ? ['#666', '#555'] : ['#A66CFF', '#6246EA']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.ctaGradient}
          >
            {isPurchasing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={[styles.ctaText, { marginLeft: 8 }]}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.ctaText}>
                {selected === 'trial' ? 'Start Free Trial' : selected === 'weekly' ? 'Start Weekly Plan' : 'Start Yearly Plan'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Error message */}
        {purchaseError && (
          <Text style={styles.errorText}>{purchaseError}</Text>
        )}
        
        <Text style={styles.ctaCaption}>
          {selected === 'trial' 
            ? 'Try free for 1 day, then $49.99 annually.' 
            : selected === 'weekly' 
            ? 'Just $4.99 per week. Cancel anytime.' 
            : 'Just $49.99 per year. Cancel anytime.'
          }
        </Text>
        
        {/* Restore purchases button */}
        <TouchableOpacity
          onPress={handleRestorePurchases}
          style={styles.restoreButton}
          disabled={isPurchasing}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  backgroundImage: { 
    position: 'absolute', 
    width: '100%', 
    height: '100%' 
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 70 },
  headerLink: { padding: 8 },
  linkText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
  titleWrap: { paddingHorizontal: 24, paddingTop: 18, alignItems: 'center' },
  title: { color: '#FFF', fontSize: 36, textAlign: 'center', fontWeight: '700', letterSpacing: 0.2, fontFamily: 'Cinzel_700Bold' },
  subtitle: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 8, lineHeight: 22, fontSize: 18, fontWeight: '400', fontFamily: 'Cinzel_400Regular' },
  titleGlow: { position: 'absolute', top: 40, width: width * 0.8, height: 120, borderRadius: 120, backgroundColor: 'rgba(166,108,255,0.25)', filter: undefined },
  star: { position: 'absolute', backgroundColor: '#FFFFFF', borderRadius: 50, shadowColor: '#A66CFF', shadowOpacity: 0.7, shadowOffset: { width: 0, height: 0 }, shadowRadius: 3 },
  timeline: { marginTop: 24, marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  timelineText: { color: 'rgba(255,255,255,0.8)' },
  timelineDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 10 },
  contentArea: { flex: 1, paddingTop: 40 },
  contentContainer: { minHeight: 280, justifyContent: 'center' },
  enhancedTimeline: { marginTop: 24, marginHorizontal: 20, paddingHorizontal: 10 },
  timelineTitle: { color: '#FFF', fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 30 },
  timelineContainer: { alignItems: 'flex-start', position: 'relative', paddingLeft: 0 },
  progressBarBackground: { 
    position: 'absolute', 
    left: 0, 
    top: 0, 
    height: 260, 
    width: 40, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 20 
  },
  progressBarFill: { 
    position: 'absolute', 
    left: 0, 
    top: 0, 
    height: 220, 
    width: 40, 
    borderRadius: 20
  },
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, position: 'relative', zIndex: 2 },
  timelineIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: 'transparent', borderWidth: 2 },
  timelineIconToday: { borderColor: 'transparent' },
  timelineIconReminder: { borderColor: 'transparent' },
  timelineIconBilling: { borderColor: 'transparent' },
  timelineIconText: { fontSize: 24 },
  timelineIconImage: { width: 20, height: 20, tintColor: '#FFFFFF' },
  timelineTextWrap: { flex: 1, marginTop: 4 },
  timelineItemTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  timelineItemText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20 },
  fixedBottomSection: { position: 'absolute', bottom: -25, left: 0, right: 0, paddingBottom: 40 },
  plansContainer: { paddingHorizontal: 20 },
  planRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  trialCard: { 
    backgroundColor: 'rgba(255,255,255,0.12)', 
    borderRadius: 14, 
    padding: 16, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.18)', 
    height: 70, 
    justifyContent: 'center',
    marginBottom: 8
  },
  trialSelected: { 
    borderColor: '#A66CFF', 
    shadowColor: '#A66CFF', 
    shadowOpacity: 0.35, 
    shadowRadius: 12, 
    shadowOffset: { width: 0, height: 8 }, 
    backgroundColor: 'rgba(166,108,255,0.18)' 
  },
  trialContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trialText: { flex: 1 },
  trialLabel: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  trialSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
  planCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.18)', height: 95, justifyContent: 'center' },
  planCardWeekly: { flex:  0.78},
  planCardYearly: { flex: 1 },
  planSelected: { borderColor: '#A66CFF', shadowColor: '#A66CFF', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, backgroundColor: 'rgba(166,108,255,0.18)' },
  planContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planContentWithBadge: { marginTop: 0 },
  planText: { flex: 1 },
  radioCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: '#A66CFF', backgroundColor: '#A66CFF' },
  checkmark: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  featuresList: { marginTop: 32, marginHorizontal: 20, paddingHorizontal: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  featureText: { color: '#FFF', fontSize: 18, marginLeft: 12, flex: 1, fontWeight: '600' },
  badge: { position: 'absolute', top: -12, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 3, backgroundColor: '#A66CFF', borderRadius: 12, borderColor: '#A66CFF', borderWidth: 1, shadowColor: '#A66CFF', shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  planLabel: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  planPrice: { color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 2 },
  planSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
  planSavings: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  planMeta: { color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  yearlyContainer: { position: 'relative', flex: 1 },
  discountBadge: { 
    position: 'absolute', 
    top: -8, 
    right: -8, 
    backgroundColor: '#A66CFF', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12, 
    zIndex: 10,
    shadowColor: '#A66CFF',
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  discountText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  yearlyContent: { marginTop: 32, marginHorizontal: 20, paddingHorizontal: 20, alignItems: 'center' },
  yearlyBadge: { backgroundColor: '#A66CFF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  yearlyBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  yearlyFeatures: { width: '100%' },
  yearlyFeatureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  yearlyFeatureText: { color: '#FFF', fontSize: 18, marginLeft: 12, flex: 1, fontWeight: '600' },
  ctaWrap: { marginTop: 22, paddingHorizontal: 20 },
  ctaButton: { borderRadius: 16, overflow: 'hidden' },
  ctaButtonDisabled: { opacity: 0.7 },
  ctaGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  ctaCaption: { color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 10 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#FF6B6B', textAlign: 'center', marginTop: 8, fontSize: 14 },
  restoreButton: { marginTop: 16, paddingVertical: 12 },
  restoreButtonText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: 14, textDecorationLine: 'underline' },
  footer: { marginTop: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  footerLink: { color: 'rgba(255,255,255,0.65)' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
});

export default PaywallScreen;


