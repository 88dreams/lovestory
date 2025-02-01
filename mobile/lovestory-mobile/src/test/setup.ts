/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';
import type { ReactNode } from 'react';
import type { Store } from 'redux';

interface Action {
  type: string;
  payload?: any;
  error?: any;
}

type AsyncThunkAction = (dispatch: any, getState: () => any) => Promise<any>;
type MockDispatch = jest.Mock & ((action: Action | AsyncThunkAction) => any);

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn((key: string) => {
    if (key === '@LoveStory:theme') return Promise.resolve('light');
    if (key === '@LoveStory:system_theme') return Promise.resolve('false');
    return Promise.resolve(null);
  }),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock SafeAreaProvider
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock Apple Authentication
jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  signInAsync: jest.fn(),
  getCredentialStateAsync: jest.fn(),
}));

// Mock Google Sign In
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    isSignedIn: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

// Mock navigation hooks
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }: { children: ReactNode }) => children,
}));

// Mock Redux hooks and state
export const mockAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const createMockDispatchHandler = (action: unknown) => {
  if (typeof action === 'function') {
    return (action as AsyncThunkAction)(mockDispatch, () => ({ auth: mockAuthState }));
  }

  const actionObj = action as Action;
  const actionResult = {
    type: actionObj.type,
    payload: actionObj.payload,
    error: actionObj.error,
  };

  return Promise.resolve({
    ...actionResult,
    unwrap: () => actionObj.error ? Promise.reject(actionObj.error) : Promise.resolve(actionObj.payload),
  });
};

export const mockDispatch: MockDispatch = jest.fn(createMockDispatchHandler) as MockDispatch;

export const mockSelector = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: any) => any) => mockSelector(selector),
  Provider: ({ children, store }: { children: ReactNode; store: Store }) => children,
}));

// Export navigation mocks for tests
export const navigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
};

// Global test cleanup
afterEach(() => {
  jest.clearAllMocks();
  mockDispatch.mockImplementation(createMockDispatchHandler);
  mockSelector.mockImplementation(() => ({ auth: mockAuthState }));
});