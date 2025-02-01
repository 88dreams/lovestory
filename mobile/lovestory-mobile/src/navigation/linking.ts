import { LinkingOptions } from '@react-navigation/native';
import { APP_CONFIG } from '../config';

/**
 * Deep linking configuration for the app
 * Supports URLs like:
 * - lovestory://login
 * - lovestory://register
 * - lovestory://reset-password?token=xyz
 */
export const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [
    'lovestory://', // App scheme
    `https://${APP_CONFIG.webDomain}`, // Web domain
  ],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ResetPassword: {
            path: 'reset-password/:token',
            parse: {
              token: (token: string) => token,
            },
          },
        },
      },
      // Add other navigation stacks here as needed
    },
  },
  // Custom function to handle any incoming links
  async getInitialURL() {
    // Handle incoming links when app was not running
    // Add any custom logic here (e.g., handle push notification deep links)
    return null;
  },
  // Subscribe to incoming links when app is running
  subscribe(listener) {
    // Listen to incoming links
    const unsubscribe = () => {
      // Cleanup subscription
    };
    return unsubscribe;
  },
}; 