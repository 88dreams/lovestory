// Import dependencies
import { jest } from '@jest/globals';
import type { Action, ThunkDispatch as BaseThunkDispatch } from '@reduxjs/toolkit';
import type * as ReactNavigation from '@react-navigation/native';
import type * as ReactRedux from 'react-redux';

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

// Import mocks
import { mockAuthApi, mockSocialAuth, mockNavigation, mockAsyncStorage } from './mocks/auth';
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

// Mock React Native first
jest.mock('react-native', () => mockReactNative);

// Then import and configure jest-native
import '@testing-library/jest-native/extend-expect';

// Define minimal types for our tests
export interface AuthState {
  user: null | Record<string, any>;
  token: string | null;
  loading: boolean;
  error: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
}

// Define the root state type for our tests
interface RootState {
  auth: AuthState;
}

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock react-native settings
const mockSettings = {
  get: jest.fn(() => null),
  set: jest.fn(),
};
jest.mock('react-native/Libraries/Settings/Settings', () => mockSettings);

// Mock setImmediate
(global as any).setImmediate = jest.fn((callback: () => void) => setTimeout(callback, 0));

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
    createNavigatorFactory: jest.fn(),
    useRoute: () => ({ params: {} }),
  };
});

// Mock redux
jest.mock('react-redux', () => {
  const actual = jest.requireActual<typeof ReactRedux>('react-redux');
  return {
    ...actual,
    useDispatch: () => {
      // Create a mock store state that matches our initial state
      const mockState: RootState = {
        auth: {
          user: null,
          token: null,
          loading: false,
          error: null,
          isLoading: false,
          isInitialized: true,
          isAuthenticated: false,
        }
      };

      // Create a recursive dispatch function that can handle nested dispatches
      const createDispatch = () => {
        const dispatch = jest.fn((action: any) => {
          // If it's a thunk action (function), execute it with a new dispatch instance
          if (typeof action === 'function') {
            try {
              const result = action(createDispatch(), () => mockState, undefined);
              
              // Handle async results
              if (result instanceof Promise) {
                return result
                  .then((value) => {
                    const promiseWithUnwrap = Promise.resolve(value) as AsyncActionResult<typeof value>;
                    promiseWithUnwrap.unwrap = () => Promise.resolve(value?.payload || value);
                    return promiseWithUnwrap;
                  })
                  .catch((error) => {
                    // Create a rejected promise that matches Redux Toolkit's error format
                    const rejectedPromise = Promise.reject(error) as AsyncActionResult<never>;
                    rejectedPromise.unwrap = () => Promise.reject(error);
                    return rejectedPromise; // Return instead of throw to allow error handling
                  });
              }
              
              return result;
            } catch (error) {
              // Handle synchronous errors
              const rejectedPromise = Promise.reject(error) as AsyncActionResult<never>;
              rejectedPromise.unwrap = () => Promise.reject(error);
              return rejectedPromise; // Return instead of throw to allow error handling
            }
          }
          
          // For regular actions, return a promise with unwrap
          const promise = Promise.resolve(action) as AsyncActionResult<typeof action>;
          promise.unwrap = () => Promise.resolve(action?.payload || action);
          return promise;
        });
        
        return dispatch;
      };

      return createDispatch();
    },
    useSelector: jest.fn((selector: (state: RootState) => any) => selector({
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: false,
      }
    })),
    Provider: ({ children }: { children: React.ReactNode }) => children,
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

// Mock auth services
jest.mock('../services/api/auth', () => ({
  authApi: mockAuthApi,
}));

jest.mock('../services/auth/socialAuth', () => mockSocialAuth);

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
  (mockAsyncStorage.clear as jest.Mock).mockClear();
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

// Define types for our async actions
interface AsyncActionResult<T> extends Promise<T> {
  unwrap(): Promise<T>;
} 