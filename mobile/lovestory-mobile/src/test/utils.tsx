import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../theme/ThemeProvider';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });
};

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={store}>
        <NavigationContainer>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NavigationContainer>
      </Provider>
    );
  };

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

export const mockAuthState = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    isEmailVerified: false,
  },
  token: 'mock_token',
  isLoading: false,
  error: null,
  isInitialized: true,
};

export const mockNavigate = jest.fn();
export const mockGoBack = jest.fn();
export const mockDispatch = jest.fn(); 