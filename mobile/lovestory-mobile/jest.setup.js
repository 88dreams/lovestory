// Import test utilities
require('@testing-library/jest-native/extend-expect');

// Mock setImmediate for React Native animations
global.setImmediate = (callback) => setTimeout(callback, 0);

// Import mocks
const { mockSettings, mockAsyncStorage, mockNavigation, mockDispatch, mockSelector, mockSocialAuth, mockAuthApi } = require('./src/test/mocks');

// Mock React Native Settings
jest.mock('react-native/Libraries/Settings/Settings', () => mockSettings);

// Mock React Native components and APIs
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Settings = mockSettings;

  return {
    ...RN,
    View: ({ children, testID, ...props }) => ({
      type: 'View',
      props: {
        ...props,
        testID,
        children,
      },
    }),

    Text: ({ children, testID, ...props }) => ({
      type: 'Text',
      props: {
        ...props,
        testID,
        children,
      },
    }),

    TouchableOpacity: ({ children, testID, onPress, ...props }) => ({
      type: 'TouchableOpacity',
      props: {
        ...props,
        testID,
        onPress,
        children,
      },
    }),

    TextInput: ({ testID, onChangeText, value, ...props }) => ({
      type: 'TextInput',
      props: {
        testID,
        onChangeText,
        value,
        ...props,
      },
    }),

    KeyboardAvoidingView: ({ children, testID, ...props }) => ({
      type: 'KeyboardAvoidingView',
      props: {
        ...props,
        testID,
        children,
      },
    }),

    ScrollView: ({ children, testID, ...props }) => ({
      type: 'ScrollView',
      props: {
        ...props,
        testID,
        children,
      },
    }),

    ActivityIndicator: ({ testID, ...props }) => ({
      type: 'ActivityIndicator',
      props: {
        ...props,
        testID,
      },
    }),

    Platform: {
      ...RN.Platform,
      select: (config) => config.ios,
    },

    Animated: {
      ...RN.Animated,
      timing: () => ({
        start: (callback) => callback && callback(),
      }),
    },
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

// Mock Redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: mockSelector,
}));

// Mock Social Auth
jest.mock('./src/services/auth/socialAuth', () => mockSocialAuth);

// Mock Auth API
jest.mock('./src/services/api/auth', () => ({ authApi: mockAuthApi }));

// Mock MaterialCommunityIcons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock native event emitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  const NativeEventEmitter = function() {};
  NativeEventEmitter.prototype.addListener = () => ({ remove: () => {} });
  NativeEventEmitter.prototype.removeListener = () => {};
  return NativeEventEmitter;
});

// Mock expo-font
jest.mock('expo-font', () => ({
  isLoaded: () => true,
  loadAsync: () => Promise.resolve(),
}));

// Silence React Native warnings
console.warn = () => {};
console.error = () => {}; 