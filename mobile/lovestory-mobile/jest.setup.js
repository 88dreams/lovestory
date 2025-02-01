require('@testing-library/jest-native/extend-expect');

// Mock setImmediate for React Native animations
global.setImmediate = (callback) => setTimeout(callback, 0);

// Mock React Native components and APIs
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  RN.View = ({ children, testID, ...props }) => ({
    type: 'View',
    props: {
      ...props,
      testID,
      children,
    },
  });

  RN.Text = ({ children, testID, ...props }) => ({
    type: 'Text',
    props: {
      ...props,
      testID,
      children,
    },
  });

  RN.TouchableOpacity = ({ children, testID, onPress, ...props }) => ({
    type: 'TouchableOpacity',
    props: {
      ...props,
      testID,
      onPress,
      children,
    },
  });

  RN.TextInput = ({ testID, onChangeText, value, ...props }) => ({
    type: 'TextInput',
    props: {
      testID,
      onChangeText,
      value,
      ...props,
    },
  });

  RN.KeyboardAvoidingView = ({ children, testID, ...props }) => ({
    type: 'KeyboardAvoidingView',
    props: {
      ...props,
      testID,
      children,
    },
  });

  RN.Platform = {
    OS: 'ios',
    select: (obj) => obj.ios,
  };

  RN.StyleSheet = {
    create: (styles) => styles,
    flatten: (style) => Object.assign({}, ...(Array.isArray(style) ? style : [style])),
    compose: (style1, style2) => [style1, style2],
  };

  RN.Keyboard = {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
  };

  RN.Animated = {
    createAnimatedComponent: (component) => component,
    timing: () => ({
      start: (callback) => callback?.({ finished: true }),
    }),
    Value: jest.fn((value) => ({
      setValue: jest.fn(),
      interpolate: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    })),
  };

  RN.NativeModules = {
    SettingsManager: {
      settings: {
        AppleLocale: 'en_US',
        AppleLanguages: ['en'],
      },
    },
    StatusBarManager: {
      getHeight: (callback) => callback({ height: 44 }),
    },
  };

  RN.useColorScheme = () => 'light';
  RN.Settings = {
    get: jest.fn(() => ({})),
    set: jest.fn(),
  };

  return RN;
});

// Mock MaterialCommunityIcons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock native event emitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  const NativeEventEmitter = function() {};
  NativeEventEmitter.prototype.addListener = jest.fn(() => ({ remove: jest.fn() }));
  NativeEventEmitter.prototype.removeListener = jest.fn();
  return NativeEventEmitter;
});

// Mock expo-font
jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
})); 