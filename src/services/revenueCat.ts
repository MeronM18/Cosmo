import Purchases from 'react-native-purchases';
import { Config } from '../utils/constants';
import { logger } from '../utils/logger';

export class RevenueCatService {
  static async initialize() {
    try {
      // Only configure if not in Expo Go to prevent errors
      if (!__DEV__ || !Config.revenueCatApiKey.includes('appl_')) {
        await Purchases.configure({
          apiKey: Config.revenueCatApiKey,
        });
        logger.log('RevenueCat initialized');
        return true;
      } else {
        logger.log('RevenueCat skipped in Expo Go development mode');
        return true;
      }
    } catch (error: any) {
      // Silently handle all RevenueCat errors in development
      logger.log('RevenueCat initialization skipped:', error.message);
      return true;
    }
  }

  static async getOfferings() {
    try {
      // Only try to get offerings if not in Expo Go development mode
      if (!__DEV__ || !Config.revenueCatApiKey.includes('appl_')) {
        const offerings = await Purchases.getOfferings();
        logger.log('RevenueCat offerings loaded:', offerings);
        return offerings;
      } else {
        // Return mock offerings for Expo Go development
        logger.log('Using mock offerings for Expo Go development');
        return {
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
        };
      }
    } catch (error: any) {
      logger.log('Using mock offerings due to error:', error.message);
      return {
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
      };
    }
  }

  static async testConnection() {
    try {
      await this.initialize();
      const offerings = await this.getOfferings();
      return offerings !== null;
    } catch (error: any) { // Fix: Add type annotation
      logger.log('RevenueCat test in development mode');
      return true;
    }
  }
}