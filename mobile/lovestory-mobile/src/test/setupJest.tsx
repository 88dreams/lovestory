// Import jest first
import { jest } from '@jest/globals';
import type { NativeModules } from 'react-native';

// Define all mocks that might be used by other imports
export const mockAsyncStorage = {
  getItem: jest.fn(async (key: string): Promise<string | null> => null),
  setItem: jest.fn(async (key: string, value: string): Promise<void> => {}),
  removeItem: jest.fn(async (key: string): Promise<void> => {}),
  clear: jest.fn(async (): Promise<void> => {}),
};

// Define auth mocks
export const mockAuthResponse = {
  token: 'mock-token',
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    isEmailVerified: false,
  }
};

export const mockAuthApi = {
  login: jest.fn(async (params: { email: string; password: string }) => {
    if (params.email === 'test@example.com' && params.password === 'password123') {
      return mockAuthResponse;
    }
    throw new Error('Invalid credentials');
  }),
  validateToken: jest.fn(async (token: string) => {
    if (token === mockAuthResponse.token) {
      return { valid: true, user: mockAuthResponse.user };
    }
    return { valid: false };
  }),
  socialAuth: jest.fn(async (params: { token: string; provider: 'google' | 'apple' }) => {
    if (params.token && params.provider) {
      return mockAuthResponse;
    }
    throw new Error(`Failed to sign in with ${params.provider}`);
  }),
};

export const mockSocialAuth = {
  signInWithGoogle: jest.fn(async () => 'mock-google-token'),
  signInWithApple: jest.fn(async () => 'mock-apple-token'),
  isAppleSignInAvailable: jest.fn(async () => true),
};

export const mockNavigation = {
  navigate: jest.fn((route: string) => {}),
  goBack: jest.fn(() => {}),
};

// Mock AsyncStorage immediately
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock auth services immediately
jest.mock('../services/api/auth', () => ({
  authApi: mockAuthApi,
}));

jest.mock('../services/auth/socialAuth', () => mockSocialAuth);

// Mock React Native's Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  if (!RN.NativeModules.PlatformConstants) {
    RN.NativeModules.PlatformConstants = {};
  }
  RN.NativeModules.PlatformConstants.forceTouchAvailable = false;
  return {
    Platform: RN.Platform,
    StyleSheet: RN.StyleSheet,
    View: RN.View,
    Text: RN.Text,
    TouchableOpacity: RN.TouchableOpacity,
    TextInput: RN.TextInput,
    Animated: {
      timing: () => ({
        start: jest.fn(),
        reset: jest.fn(),
        stop: jest.fn(),
      }),
      spring: () => ({
        start: jest.fn(),
        reset: jest.fn(),
        stop: jest.fn(),
      }),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        setOffset: jest.fn(),
        flattenOffset: jest.fn(),
        extractOffset: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn(),
        stopAnimation: jest.fn(),
        resetAnimation: jest.fn(),
        interpolate: jest.fn(() => ({
          __getValue: jest.fn(),
          interpolate: jest.fn(),
        })),
        __getValue: jest.fn(),
        __attach: jest.fn(),
        __detach: jest.fn(),
        __makeNative: jest.fn(),
        __getNativeTag: jest.fn(),
        __getNativeConfig: jest.fn(),
      })),
      createAnimatedComponent: (component: any) => component,
    },
    NativeModules: RN.NativeModules,
  };
});

// Mock react-native settings
const mockSettings = {
  get: jest.fn(() => null),
  set: jest.fn(),
};
jest.mock('react-native/Libraries/Settings/Settings', () => mockSettings);

// Mock setImmediate
(global as any).setImmediate = jest.fn((callback: () => void) => setTimeout(callback, 0));

// Now import other dependencies
import { configureStore } from '@reduxjs/toolkit';
import type { Action, ThunkDispatch } from '@reduxjs/toolkit';
import type * as ReactNavigation from '@react-navigation/native';
import type * as ReactRedux from 'react-redux';
import authReducer from '../store/slices/authSlice';

// Import mocks
import { mockReactNative } from './mocks/react-native';
import {
  mockTypography,
  mockButton,
  mockInput,
  mockIcon,
  mockScreen,
  mockSpacer,
  mockForm,
  mockDivider,
} from './mocks/components';

// Add type declaration for unwrap
declare module '@reduxjs/toolkit' {
  interface ThunkDispatch<State, ExtraThunkArg, BasicAction extends Action, S = State, E = ExtraThunkArg, A extends Action = BasicAction> {
    <T extends A>(action: T): T;
    <R>(asyncAction: (dispatch: ThunkDispatch<S, E, A>, getState: () => S, extra: E) => R): R;
  }
}

interface AsyncThunkPromise<T> extends Promise<T> {
  unwrap(): Promise<T>;
}

type AppDispatch = {
  <T>(action: T): T extends (...args: any[]) => any ? ReturnType<T> & { unwrap(): Promise<any> } : Promise<T> & { unwrap(): Promise<any> };
};

// Create test store
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      })
  });
};

// Mock React Native first
jest.mock('react-native', () => mockReactNative);

// Then import and configure jest-native
import '@testing-library/jest-native/extend-expect';

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Silence React Native warnings
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (typeof args[0] === 'string' && (
    args[0].startsWith('ProgressBarAndroid has been merged') ||
    args[0].startsWith('Clipboard has been extracted') ||
    args[0].startsWith('PushNotificationIOS has been extracted')
  )) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => mockNavigation,
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock redux
jest.mock('react-redux', () => {
  const actual = jest.requireActual<typeof ReactRedux>('react-redux');
  return {
    ...actual,
    useDispatch: () => {
      const store = createTestStore();
      return store.dispatch;
    },
    useSelector: jest.fn((selector: (state: { auth: any }) => any) => selector(createTestStore().getState())),
  };
});

// Mock components
jest.mock('../components/common/Typography', () => mockTypography);
jest.mock('../components/common/Button', () => mockButton);
jest.mock('../components/common/Input', () => mockInput);
jest.mock('../components/common/Icon', () => mockIcon);
jest.mock('../components/common/Screen', () => mockScreen);
jest.mock('../components/common/Spacer', () => mockSpacer);
jest.mock('../components/common/form/Form', () => mockForm);
jest.mock('../components/common/Divider', () => mockDivider);

// Mock MaterialCommunityIcons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock expo-font
jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    clone: function() { return this; },
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(''),
  } as Response)
);

// Mock console.error to avoid noise in tests
console.error = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockAsyncStorage.clear.mockClear();
});

// Mock theme provider
jest.mock('../theme/ThemeProvider', () => ({
  useThemedStyles: (fn: any) => {
    if (typeof fn === 'function') {
      return fn({
        colors: {
          primary: { 500: '#000000' },
          error: { 500: '#FF0000' },
          text: { primary: '#000000' },
          background: { 
            primary: '#FFFFFF',
            secondary: '#F5F5F5'
          },
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        radius: {
          sm: 4,
          md: 8,
          lg: 16,
        },
      });
    }
    return {};
  },
}));