module.exports = {
  rootDir: '.',
  preset: 'jest-expo',
  setupFiles: [
    './node_modules/react-native/jest/setup.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupJest.tsx'],
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-redux|@react-native-async-storage/async-storage|@react-navigation/native-stack|@invertase/react-native-apple-authentication|@react-native-community/netinfo|@react-native-google-signin/google-signin|@react-navigation/bottom-tabs|@reduxjs/toolkit|axios|expo|react|react-native|react-native-safe-area-context|react-native-screens|redux|redux-persist)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}; 