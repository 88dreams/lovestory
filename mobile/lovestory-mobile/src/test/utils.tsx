import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '../theme/ThemeProvider';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const mockAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = mockAuthState, action) => {
        switch (action.type) {
          case 'auth/login/fulfilled':
            return {
              ...state,
              user: action.payload,
              isAuthenticated: true,
              isLoading: false,
            };
          case 'auth/login/rejected':
            return {
              ...state,
              error: action.error,
              isLoading: false,
            };
          default:
            return state;
        }
      },
    },
    preloadedState: initialState,
  });
};

export const renderWithProviders = async (
  ui: React.ReactElement,
  {
    preloadedState = {},
    ...renderOptions
  } = {}
) => {
  const mockStore = createMockStore(preloadedState);

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={mockStore}>
        <SafeAreaProvider>
          <NavigationContainer>
            <ThemeProvider>{children}</ThemeProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    );
  };

  const rendered = render(ui, { wrapper: AllTheProviders, ...renderOptions });

  // Wait for any immediate effects to complete
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  return {
    store: mockStore,
    ...rendered,
  };
};