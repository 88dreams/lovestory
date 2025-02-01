// Import test utilities and components
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { configureStore } from '@reduxjs/toolkit';
import { mockAuthApi, mockSocialAuth, mockNavigation, mockAsyncStorage, mockAuthResponse } from '../mocks/auth';

// Set up mocks first
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="stack-navigator">{children}</div>
    ),
    Screen: ({ component: Component, name, options, ...props }: { 
      component: React.ComponentType<any>, 
      name: string,
      options?: any,
      [key: string]: any 
    }) => {
      const screenProps = {
        navigation: mockNavigation,
        route: { params: {}, name },
      };
      return (
        <div data-testid={`screen-${name.toLowerCase()}`}>
          <Component {...screenProps} {...props} />
        </div>
      );
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-gesture-handler', () => ({
  ScrollView: ({ children }: { children: React.ReactNode }) => children,
}));

// Then import components that depend on the mocks
import { LoginScreen } from '../../screens/auth/LoginScreen';
import authReducer from '../../store/slices/authSlice';

// Then set up dynamic mocks that depend on imports
jest.doMock('../../services/api/auth', () => ({
  authApi: mockAuthApi,
}));

jest.doMock('../../services/auth/socialAuth', () => mockSocialAuth);

const Stack = createNativeStackNavigator();

const renderApp = () => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: false,
      },
    },
  });

  const utils = render(
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );

  // Debug helper
  const debug = () => {
    console.log('Current DOM:');
    console.log(utils.toJSON());
  };

  return {
    ...utils,
    debug,
    store,
  };
};

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Email/Password Login', () => {
    it('completes successful login flow', async () => {
      const { getByTestId, debug } = renderApp();

      try {
        const emailInput = getByTestId('email-input');
        const passwordInput = getByTestId('password-input');
        const loginButton = getByTestId('login-button');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        fireEvent.press(loginButton);

        await waitFor(() => {
          expect(mockAuthApi.login).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
          });
          expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@auth_token', mockAuthResponse.token);
          expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
        });
      } catch (error) {
        debug();
        throw error;
      }
    });

    it('handles login failure', async () => {
      mockAuthApi.login.mockRejectedValueOnce(new Error('Invalid credentials'));
      const { getByTestId, findByTestId } = renderApp();

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');
      fireEvent.press(getByTestId('login-button'));

      const errorMessage = await findByTestId('error-message');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.props.children).toBe('Invalid credentials');
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('disables form during submission', async () => {
      const { getByTestId } = renderApp();

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByTestId('login-button'));

      expect(getByTestId('email-input').props.disabled).toBe(true);
      expect(getByTestId('password-input').props.disabled).toBe(true);
      expect(getByTestId('login-button').props.disabled).toBe(true);
    });
  });

  describe('Social Authentication', () => {
    it('completes Google sign-in flow', async () => {
      const { getByTestId } = renderApp();

      fireEvent.press(getByTestId('google-auth-button'));

      await waitFor(() => {
        expect(mockSocialAuth.signInWithGoogle).toHaveBeenCalled();
        expect(mockAuthApi.socialAuth).toHaveBeenCalledWith({
          token: 'mock-google-token',
          provider: 'google',
        });
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@auth_token', mockAuthResponse.token);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });
    });

    it('completes Apple sign-in flow when available', async () => {
      const { getByTestId, findByTestId } = renderApp();

      const appleButton = await findByTestId('apple-auth-button');
      fireEvent.press(appleButton);

      await waitFor(() => {
        expect(mockSocialAuth.signInWithApple).toHaveBeenCalled();
        expect(mockAuthApi.socialAuth).toHaveBeenCalledWith({
          token: 'mock-apple-token',
          provider: 'apple',
        });
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@auth_token', mockAuthResponse.token);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });
    });

    it('handles social auth failure', async () => {
      mockSocialAuth.signInWithGoogle.mockRejectedValueOnce(new Error('Google auth failed'));
      const { getByTestId, findByText } = renderApp();

      fireEvent.press(getByTestId('google-auth-button'));

      const errorMessage = await findByText('Google auth failed');
      expect(errorMessage).toBeTruthy();
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Token Management', () => {
    it('restores valid session on mount', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(mockAuthResponse.token);
      mockAuthApi.validateToken.mockResolvedValueOnce({ valid: true, user: mockAuthResponse.user });

      renderApp();

      await waitFor(() => {
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@auth_token');
        expect(mockAuthApi.validateToken).toHaveBeenCalledWith(mockAuthResponse.token);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });
    });

    it('clears invalid session', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(mockAuthResponse.token);
      mockAuthApi.validateToken.mockResolvedValueOnce({ valid: false });

      renderApp();

      await waitFor(() => {
        expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@auth_token');
        expect(mockNavigation.navigate).not.toHaveBeenCalled();
      });
    });
  });
}); 