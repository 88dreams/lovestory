import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { ThemeProvider } from './src/theme/ThemeProvider';
import RootNavigator from './src/navigation/RootNavigator';
import { ToastProvider } from './src/contexts/ToastContext';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { NavigationContainer } from '@react-navigation/native';
import { useNetworkState } from './src/hooks/useNetworkState';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from './src/theme/ThemeProvider';

const NetworkBanner = () => {
  const { isConnected } = useNetworkState();
  const { theme } = useTheme();

  if (isConnected) return null;

  return (
    <View style={[styles.banner, { backgroundColor: theme.colors.error[500] }]}>
      <Text style={[styles.bannerText, { color: theme.colors.text.inverse }]}>
        No Internet Connection
      </Text>
    </View>
  );
};

const AppContent = () => (
  <>
    <NetworkBanner />
    <RootNavigator />
  </>
);

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ErrorBoundary>
          <ThemeProvider>
            <ToastProvider>
              <NavigationContainer>
                <AppContent />
              </NavigationContainer>
            </ToastProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
