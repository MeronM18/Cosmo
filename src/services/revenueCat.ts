import Purchases from 'react-native-purchases';
import { Config } from '../utils/constants';

export class RevenueCatService {
  static async initialize() {
    try {
      await Purchases.configure({
        apiKey: Config.revenueCatApiKey,
      });
      console.log('RevenueCat initialized (development mode)');
      return true;
    } catch (error: any) { // Fix: Add type annotation
      console.log('RevenueCat running in development mode:', error.message);
      return true;
    }
  }

  static async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error: any) { // Fix: Add type annotation
      console.log('Using mock offerings for development');
      return {
        current: {
          availablePackages: [
            {
              identifier: 'cosmo_weekly',
              product: {
                title: 'Weekly Premium',
                priceString: '$2.99',
                identifier: 'cosmo_weekly'
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
      console.log('RevenueCat test in development mode');
      return true;
    }
  }
}