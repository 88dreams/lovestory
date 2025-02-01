import '@testing-library/jest-native/extend-expect';
import { mockAsyncStorage } from './mocks/asyncStorage';
import { mockSettings, mockNavigation, mockDispatch, mockSelector, mockSocialAuth, mockAuthApi } from './mocks';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock react-native settings
jest.mock('react-native/Libraries/Settings/Settings', () => mockSettings);

// Mock setImmediate
(global as any).setImmediate = jest.fn((callback) => setTimeout(callback, 0));

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
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

// Mock redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: mockSelector,
}));

// Mock social auth
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    isSignedIn: jest.fn(),
  },
}));

jest.mock('expo-apple-authentication', () => ({
  isAvailable: jest.fn(),
  signInAsync: jest.fn(),
}));

// Mock MaterialCommunityIcons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock expo-font
jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 