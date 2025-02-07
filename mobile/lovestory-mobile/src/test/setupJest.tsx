// 1. Setup Jest and Testing Library
import { jest } from '@jest/globals';

// 2. Setup React Native mocks first (before any component mocks)
jest.unstable_mockModule('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj: { ios: unknown; android: unknown }) => obj.ios),
  },
  StyleSheet: {
    create: jest.fn((styles: Record<string, any>) => styles),
  },
}));

// 3. Setup theme mock (needed by components)
const mockTheme = {
  colors: {
    primary: {
      100: '#007AFF19',
      200: '#007AFF33',
      300: '#007AFF4D',
      400: '#007AFF66',
      500: '#007AFF',
      600: '#007AFFB3',
      700: '#007AFFCC',
      800: '#007AFFE6',
      900: '#007AFFFF',
    },
    secondary: {
      100: '#5856D619',
      200: '#5856D633',
      300: '#5856D64D',
      400: '#5856D666',
      500: '#5856D6',
      600: '#5856D6B3',
      700: '#5856D6CC',
      800: '#5856D6E6',
      900: '#5856D6FF',
    },
    error: {
      100: '#FF3B3019',
      200: '#FF3B3033',
      300: '#FF3B304D',
      400: '#FF3B3066',
      500: '#FF3B30',
      600: '#FF3B30B3',
      700: '#FF3B30CC',
      800: '#FF3B30E6',
      900: '#FF3B30FF',
    },
    warning: {
      100: '#FF950019',
      200: '#FF950033',
      300: '#FF95004D',
      400: '#FF950066',
      500: '#FF9500',
      600: '#FF9500B3',
      700: '#FF9500CC',
      800: '#FF9500E6',
      900: '#FF9500FF',
    },
    success: {
      100: '#34C75919',
      200: '#34C75933',
      300: '#34C7594D',
      400: '#34C75966',
      500: '#34C759',
      600: '#34C759B3',
      700: '#34C759CC',
      800: '#34C759E6',
      900: '#34C759FF',
    },
    info: {
      100: '#5856D619',
      200: '#5856D633',
      300: '#5856D64D',
      400: '#5856D666',
      500: '#5856D6',
      600: '#5856D6B3',
      700: '#5856D6CC',
      800: '#5856D6E6',
      900: '#5856D6FF',
    },
    grey: {
      100: '#8E8E9319',
      200: '#8E8E9333',
      300: '#8E8E934D',
      400: '#8E8E9366',
      500: '#8E8E93',
      600: '#8E8E93B3',
      700: '#8E8E93CC',
      800: '#8E8E93E6',
      900: '#8E8E93FF',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F2F2F7',
      tertiary: '#EFEFF4',
    },
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      disabled: '#6B6B6B',
      inverse: '#000000',
    },
    border: {
      light: '#E5E5EA',
      medium: '#C7C7CC',
      dark: '#8E8E93',
    },
    action: {
      active: '#007AFF',
      hover: '#47A1FF',
      disabled: '#99A9BF',
      disabledBackground: '#F5F7FA',
    },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 16 },
  typography: {
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
      letterSpacing: 0.5,
    },
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

jest.mock('../theme/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useThemedStyles: (fn: (theme: any) => Record<string, any>) => {
    if (typeof fn === 'function') {
      return fn(mockTheme);
    }
    return {};
  },
  useTheme: () => ({
    theme: mockTheme
  }),
}));

// 4. Setup basic service mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

// 5. Setup MSW
// import { worker } from './setup/msw';

// 6. Global test lifecycle
// beforeAll(async () => {
//   await worker.start();
// });

// afterEach(() => {
//   worker.resetHandlers();
//   jest.clearAllMocks();
// });

// afterAll(async () => {
//   await worker.stop();
// });

afterEach(() => {
  jest.clearAllMocks();
});

// 7. Error handling
const originalError = console.error;
console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('React error')) {
    throw new Error(args[0]);
  }
  originalError.call(console, ...args);
};

// 8. Global settings
jest.setTimeout(10000);

// Mock ActivityIndicator component
jest.mock('react-native/Libraries/Components/ActivityIndicator/ActivityIndicator', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ color, size, ...props }: { color?: string; size?: 'small' | 'large'; [key: string]: any }) => {
      return React.createElement(View, {
        ...props,
        role: 'progressbar',
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-busy': true,
        testID: 'activity-indicator',
        style: {
          width: size === 'large' ? 36 : 24,
          height: size === 'large' ? 36 : 24,
          borderRadius: 18,
          borderWidth: 2,
          borderColor: color || '#999999',
        },
      });
    },
  };
});