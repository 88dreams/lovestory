/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';
import type { NavigationContainerRef } from '@react-navigation/native';
import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';

// Define minimal types for our tests
export interface AuthState {
  user: null | Record<string, any>;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
}

// Centralized mock implementations
export const mockAuthState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
};

// Redux mock exports
export const mockDispatch = jest.fn() as jest.MockedFunction<Dispatch<UnknownAction>>;
export const mockSelector = jest.fn();

// Centralized mock setup
export const setupMocks = (): void => {
  // Mock AsyncStorage
  jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  }));

  // Mock Auth API
  jest.mock('../services/api/auth', () => ({
    authApi: {
      login: jest.fn(),
      socialAuth: jest.fn(),
      validateToken: jest.fn(),
    },
  }));

  // Mock Social Auth
  jest.mock('../services/auth/socialAuth', () => ({
    signInWithGoogle: jest.fn(),
    signInWithApple: jest.fn(),
    isAppleSignInAvailable: jest.fn(() => Promise.resolve(true)),
  }));

  // Mock Navigation
  jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
      NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
      useNavigation: () => mockNavigation,
      createNavigatorFactory: jest.fn(),
      useRoute: () => ({ params: {} }),
    };
  });

  // Mock Redux
  jest.mock('react-redux', () => {
    const actualRedux = jest.requireActual('react-redux');
    return {
      Provider: ({ children }: { children: React.ReactNode }) => children,
      useDispatch: () => mockDispatch,
      useSelector: (selector: any) => mockSelector(selector),
    };
  });
};

// Initialize mocks
setupMocks();

// Mock fetch globally
global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: typeof input === 'string' ? input : input.toString(),
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

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});