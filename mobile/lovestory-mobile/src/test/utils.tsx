import React from 'react';
import { render, cleanup } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { ThemeProvider } from '../theme/ThemeProvider';
import type { RootState } from '../store';
import type { AuthState } from '../store/slices/authSlice';

const defaultAuthState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  isAuthenticated: false,
};

// Mock initial state
const initialState: Partial<RootState> = {
  auth: defaultAuthState,
};

// Mock reducer
const mockReducer = (state: AuthState = defaultAuthState, action: any): AuthState => {
  switch (action.type) {
    case 'auth/loginAsync/pending':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'auth/loginAsync/fulfilled':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };
    case 'auth/loginAsync/rejected':
      return {
        ...state,
        isLoading: false,
        error: action.error.message,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case 'auth/socialAuthAsync/pending':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'auth/socialAuthAsync/fulfilled':
      return {
        ...state,
        isLoading: false,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };
    case 'auth/socialAuthAsync/rejected':
      return {
        ...state,
        isLoading: false,
        error: action.error.message,
        token: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  auth: mockReducer,
});

// Create a new store for each test to avoid state leakage
const createTestStore = (preloadedState = initialState) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = initialState,
    ...renderOptions
  } = {}
) {
  // Clean up any previous renders
  cleanup();

  const store = createTestStore(preloadedState);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </Provider>
    );
  }

  const result = render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });

  return {
    store,
    ...result,
  };
}