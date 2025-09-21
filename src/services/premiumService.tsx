import { User } from './horoscopesState';
import { AnalyticsService } from './trackingService';

// Premium feature definitions
export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  category: 'reading' | 'chart' | 'insights' | 'personalization';
  requiredLevel: 'premium';
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'extended_readings',
    name: 'Extended Readings',
    description: 'Get complete 4-paragraph horoscopes with detailed insights',
    category: 'reading',
    requiredLevel: 'premium'
  },
  {
    id: 'category_breakdowns',
    name: 'Category Breakdowns',
    description: 'Detailed readings for love, career, health, and personal growth',
    category: 'reading',
    requiredLevel: 'premium'
  },
  {
    id: 'birth_chart_analysis',
    name: 'Birth Chart Analysis',
    description: 'Interactive natal chart with planetary positions and aspects',
    category: 'chart',
    requiredLevel: 'premium'
  },
  {
    id: 'multiple_time_periods',
    name: 'Multiple Time Periods',
    description: 'Access to weekly, monthly, and yearly horoscopes',
    category: 'reading',
    requiredLevel: 'premium'
  },
  {
    id: 'personalized_timing',
    name: 'Personalized Timing',
    description: 'Best times for important decisions based on your chart',
    category: 'personalization',
    requiredLevel: 'premium'
  },
  {
    id: 'mood_insights',
    name: 'Mood Insights',
    description: 'Advanced mood correlation analysis and predictions',
    category: 'insights',
    requiredLevel: 'premium'
  },
  {
    id: 'transit_alerts',
    name: 'Transit Alerts',
    description: 'Notifications for important planetary transits',
    category: 'insights',
    requiredLevel: 'premium'
  },
  {
    id: 'compatibility_reports',
    name: 'Compatibility Reports',
    description: 'Detailed relationship compatibility analysis',
    category: 'chart',
    requiredLevel: 'premium'
  }
];

// Paywall content definitions
export interface PaywallContent {
  title: string;
  subtitle: string;
  benefits: string[];
  ctaText: string;
  price: string;
  features: PremiumFeature[];
}

export const PAYWALL_CONTENT: Record<string, PaywallContent> = {
  extended_readings: {
    title: 'Unlock Full Readings',
    subtitle: 'Get the complete cosmic picture',
    benefits: [
      'Complete 4-paragraph horoscopes',
      'Detailed planetary influences',
      'Lucky timing guidance',
      'Personalized insights'
    ],
    ctaText: 'Start Free Trial',
    price: '$9.99/month',
    features: PREMIUM_FEATURES.filter(f => f.category === 'reading')
  },
  birth_chart_analysis: {
    title: 'Discover Your Birth Chart',
    subtitle: 'Explore your cosmic blueprint',
    benefits: [
      'Interactive natal chart',
      'Personal planet positions',
      'Aspect analysis',
      'Life area focus'
    ],
    ctaText: 'View My Chart',
    price: '$9.99/month',
    features: PREMIUM_FEATURES.filter(f => f.category === 'chart')
  },
  category_breakdowns: {
    title: 'Deep Dive Categories',
    subtitle: 'Explore every area of your life',
    benefits: [
      'Love & relationships',
      'Career & money',
      'Health & wellness',
      'Personal growth'
    ],
    ctaText: 'Unlock Categories',
    price: '$9.99/month',
    features: PREMIUM_FEATURES.filter(f => f.id === 'category_breakdowns')
  },
  general: {
    title: 'Unlock Your Full Cosmic Potential',
    subtitle: 'Get unlimited access to all premium features',
    benefits: [
      'Extended horoscope readings',
      'Interactive birth chart',
      'Category breakdowns',
      'Mood insights & tracking',
      'Transit alerts',
      'Compatibility reports'
    ],
    ctaText: 'Start Free Trial',
    price: '$9.99/month',
    features: PREMIUM_FEATURES
  }
};

// Premium service class
export class PremiumService {
  // Check if user has access to a specific feature
  static checkAccess(user: User, featureId: string): boolean {
    const feature = PREMIUM_FEATURES.find(f => f.id === featureId);
    if (!feature) return true; // Feature doesn't exist or is free

    return user.subscriptionLevel === feature.requiredLevel;
  }

  // Check if user has premium access
  static isPremium(user: User): boolean {
    return user.subscriptionLevel === 'premium';
  }

  // Get paywall content for a specific feature
  static getPaywallContent(featureId: string): PaywallContent {
    return PAYWALL_CONTENT[featureId] || PAYWALL_CONTENT.general;
  }

  // Show paywall for a specific feature
  static async showPaywall(
    featureId: string,
    source: string = 'horoscopes_page',
    navigation?: any
  ): Promise<void> {
    try {
      // Track paywall view
      await AnalyticsService.trackEvent('paywall_shown', {
        feature: featureId,
        source,
        userType: 'free'
      });

      // Navigate to paywall screen
      if (navigation) {
        navigation.navigate('Paywall', {
          featureId,
          source
        });
      } else {
        // Fallback: show modal or alert
        console.log('Paywall should be shown for feature:', featureId);
      }
    } catch (error) {
      console.error('Error showing paywall:', error);
    }
  }

  // Handle premium feature access
  static async handleFeatureAccess(
    user: User,
    featureId: string,
    onAccess: () => void,
    onBlocked?: () => void,
    navigation?: any
  ): Promise<void> {
    try {
      if (this.checkAccess(user, featureId)) {
        // User has access
        await AnalyticsService.trackEvent('premium_feature_accessed', {
          feature: featureId,
          userType: user.subscriptionLevel
        });
        onAccess();
      } else {
        // User doesn't have access
        await AnalyticsService.trackEvent('premium_feature_blocked', {
          feature: featureId,
          userType: user.subscriptionLevel
        });
        
        if (onBlocked) {
          onBlocked();
        } else {
          await this.showPaywall(featureId, 'feature_access', navigation);
        }
      }
    } catch (error) {
      console.error('Error handling feature access:', error);
    }
  }

  // Get user's premium status with details
  static getPremiumStatus(user: User): {
    isPremium: boolean;
    level: string;
    features: PremiumFeature[];
    benefits: string[];
  } {
    const isPremium = this.isPremium(user);
    
    return {
      isPremium,
      level: user.subscriptionLevel,
      features: isPremium ? PREMIUM_FEATURES : [],
      benefits: isPremium ? [
        'Unlimited horoscope readings',
        'Interactive birth chart',
        'Category breakdowns',
        'Mood insights',
        'Transit alerts',
        'Compatibility reports'
      ] : [
        'Daily horoscope readings',
        'Basic planetary information',
        'Reading streak tracking'
      ]
    };
  }

  // Upgrade user to premium
  static async upgradeToPremium(
    userId: string,
    subscriptionData: {
      planId: string;
      price: string;
      duration: string;
    }
  ): Promise<boolean> {
    try {
      // Track upgrade event
      await AnalyticsService.trackEvent('premium_upgrade', {
        planId: subscriptionData.planId,
        price: subscriptionData.price,
        duration: subscriptionData.duration
      });

      // Update user subscription level
      // This would typically involve calling your backend API
      // For now, we'll simulate the update
      console.log('Upgrading user to premium:', userId, subscriptionData);
      
      return true;
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      return false;
    }
  }

  // Check subscription status
  static async checkSubscriptionStatus(userId: string): Promise<{
    isActive: boolean;
    expiresAt?: Date;
    planType?: string;
  }> {
    try {
      // This would typically involve calling your backend API
      // For now, we'll simulate the check
      console.log('Checking subscription status for user:', userId);
      
      return {
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        planType: 'premium'
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return { isActive: false };
    }
  }

  // Get feature usage statistics
  static async getFeatureUsage(userId: string): Promise<Record<string, number>> {
    try {
      // This would typically involve querying your analytics database
      // For now, we'll return mock data
      return {
        extended_readings: 15,
        birth_chart_analysis: 8,
        category_breakdowns: 23,
        mood_insights: 12,
        transit_alerts: 5
      };
    } catch (error) {
      console.error('Error getting feature usage:', error);
      return {};
    }
  }

  // Restore purchase (for App Store/Play Store)
  static async restorePurchase(userId: string): Promise<boolean> {
    try {
      // This would typically involve calling your payment provider's API
      // For now, we'll simulate the restore
      console.log('Restoring purchase for user:', userId);
      
      await AnalyticsService.trackEvent('purchase_restored', {
        userId
      });
      
      return true;
    } catch (error) {
      console.error('Error restoring purchase:', error);
      return false;
    }
  }

  // Cancel subscription
  static async cancelSubscription(userId: string): Promise<boolean> {
    try {
      // This would typically involve calling your backend API
      console.log('Cancelling subscription for user:', userId);
      
      await AnalyticsService.trackEvent('subscription_cancelled', {
        userId
      });
      
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }
}

// Feature gate component helper
export const withPremiumGate = <P extends object>(
  Component: React.ComponentType<P>,
  featureId: string,
  fallbackComponent?: React.ComponentType<P>
) => {
  return (props: P & { user: User; navigation?: any }) => {
    const { user, navigation, ...restProps } = props;
    
    if (PremiumService.checkAccess(user, featureId)) {
      return <Component {...(restProps as P)} />;
    } else {
      if (fallbackComponent) {
        return <fallbackComponent {...(restProps as P)} />;
      } else {
        // Show paywall or upgrade prompt
        PremiumService.showPaywall(featureId, 'component_gate', navigation);
        return null;
      }
    }
  };
};
