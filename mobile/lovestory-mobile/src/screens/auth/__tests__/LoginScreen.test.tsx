import React from 'react';
import { act, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderWithProviders } from '../../../test/utils';
import { LoginScreen } from '../LoginScreen';
import { loginAsync, socialAuthAsync } from '../../../store/slices/authSlice';
import { isAppleSignInAvailable } from '../../../services/auth/socialAuth';
import { authApi } from '../../../services/api/auth';

// Mock the modules
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/auth/socialAuth');
jest.mock('../../../store/slices/authSlice');
jest.mock('../../../services/api/auth', () => ({
  authApi: {
    validateToken: jest.fn(),
  },
}));

// Mock MaterialCommunityIcons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

describe('LoginScreen Component', () => {
  const mockDispatch = jest.fn();
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    ((useDispatch as unknown) as jest.Mock).mockReturnValue(mockDispatch);
    ((useNavigation as unknown) as jest.Mock).mockReturnValue(mockNavigation);
    (authApi.validateToken as jest.Mock).mockResolvedValue({ valid: false });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Initial Load', () => {
    it('checks for stored token on mount', async () => {
      const mockToken = 'stored-token';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(mockToken);

      const { unmount } = renderWithProviders(<LoginScreen />);
      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('@auth_token');
      });
      unmount();
    });

    it('checks Apple Sign In availability', async () => {
      (isAppleSignInAvailable as jest.Mock).mockResolvedValueOnce(true);

      const { unmount } = renderWithProviders(<LoginScreen />);
      await waitFor(() => {
        expect(isAppleSignInAvailable).toHaveBeenCalled();
      });
      unmount();
    });
  });

  describe('UI Rendering', () => {
    it('renders all required UI elements in initial state', async () => {
      const { getByTestId, unmount } = renderWithProviders(<LoginScreen />);

      await waitFor(() => {
        expect(getByTestId('welcome-header')).toBeTruthy();
        expect(getByTestId('welcome-text')).toBeTruthy();
        expect(getByTestId('subtitle-text')).toBeTruthy();
        expect(getByTestId('email-input')).toBeTruthy();
        expect(getByTestId('password-input')).toBeTruthy();
        expect(getByTestId('sign-in-button')).toBeTruthy();
      });

      unmount();
    });

    it('shows password visibility toggle', async () => {
      const { getByTestId, unmount } = renderWithProviders(<LoginScreen />);

      const passwordInput = getByTestId('password-input');
      const visibilityToggle = getByTestId('password-visibility-toggle');

      expect(passwordInput.props.secureTextEntry).toBe(true);
      await act(async () => {
        fireEvent.press(visibilityToggle);
      });
      expect(passwordInput.props.secureTextEntry).toBe(false);

      unmount();
    });
  });

  describe('Form Validation', () => {
    it('validates email format', async () => {
      const { getByTestId, unmount } = renderWithProviders(<LoginScreen />);

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signInButton = getByTestId('sign-in-button');

      await act(async () => {
        fireEvent.changeText(emailInput, 'invalid-email');
      });
      expect(signInButton.props.accessibilityState.disabled).toBe(true);

      await act(async () => {
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
      });
      expect(signInButton.props.accessibilityState.disabled).toBe(false);

      unmount();
    });

    it('validates password length', async () => {
      const { getByTestId } = renderWithProviders(<LoginScreen />);

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signInButton = getByTestId('sign-in-button');

      await act(async () => {
        fireEvent.changeText(emailInput, 'test@example.com');
      });

      await act(async () => {
        fireEvent.changeText(passwordInput, '123'); // Too short
      });

      expect(signInButton.props.accessibilityState.disabled).toBe(true);

      await act(async () => {
        fireEvent.changeText(passwordInput, 'password123');
      });

      expect(signInButton.props.accessibilityState.disabled).toBe(false);
    });
  });

  describe('Authentication Flows', () => {
    it('handles successful email/password login', async () => {
      const mockLoginResult = { token: 'test-token', user: { id: '1', email: 'test@example.com' } };
      const mockLoginAction = { unwrap: () => Promise.resolve(mockLoginResult) };
      ((loginAsync as unknown) as jest.Mock).mockReturnValueOnce(mockLoginAction);
      mockDispatch.mockReturnValueOnce(mockLoginAction);

      const { getByTestId, unmount } = renderWithProviders(<LoginScreen />);

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signInButton = getByTestId('sign-in-button');

      await act(async () => {
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
      });

      await act(async () => {
        fireEvent.press(signInButton);
      });

      await waitFor(() => {
        expect(loginAsync).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@auth_token', 'test-token');
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });

      unmount();
    });

    it('handles failed email/password login', async () => {
      const error = new Error('Invalid credentials');
      const mockLoginAction = { unwrap: () => Promise.reject(error) };
      ((loginAsync as unknown) as jest.Mock).mockReturnValueOnce(mockLoginAction);
      mockDispatch.mockReturnValueOnce(mockLoginAction);

      const { getByTestId, getByText, unmount } = renderWithProviders(<LoginScreen />);

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signInButton = getByTestId('sign-in-button');

      await act(async () => {
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
      });

      await act(async () => {
        fireEvent.press(signInButton);
      });

      await waitFor(() => {
        expect(getByTestId('form-error')).toBeTruthy();
        expect(getByText('Invalid credentials')).toBeTruthy();
      });

      unmount();
    });

    it('handles successful Google authentication', async () => {
      const mockSocialResult = { token: 'test-token', provider: 'google' };
      const mockSocialAction = { unwrap: () => Promise.resolve(mockSocialResult) };
      ((socialAuthAsync as unknown) as jest.Mock).mockReturnValueOnce(mockSocialAction);
      mockDispatch.mockReturnValueOnce(mockSocialAction);

      const { getByTestId, unmount } = renderWithProviders(<LoginScreen />);

      const googleButton = getByTestId('google-auth-button');
      await act(async () => {
        fireEvent.press(googleButton);
      });

      await waitFor(() => {
        expect(socialAuthAsync).toHaveBeenCalledWith('google');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@auth_token', 'test-token');
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });

      unmount();
    });

    it('handles Apple authentication when available', async () => {
      (isAppleSignInAvailable as jest.Mock).mockResolvedValueOnce(true);
      const mockSocialResult = { token: 'test-token', provider: 'apple' };
      const mockSocialAction = { unwrap: () => Promise.resolve(mockSocialResult) };
      ((socialAuthAsync as unknown) as jest.Mock).mockReturnValueOnce(mockSocialAction);
      mockDispatch.mockReturnValueOnce(mockSocialAction);

      const { getByTestId, unmount } = renderWithProviders(<LoginScreen />);

      await waitFor(() => {
        const appleButton = getByTestId('apple-auth-button');
        fireEvent.press(appleButton);
      });

      await waitFor(() => {
        expect(socialAuthAsync).toHaveBeenCalledWith('apple');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@auth_token', 'test-token');
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });

      unmount();
    });
  });

  describe('Loading States', () => {
    it('disables form during authentication', async () => {
      const neverResolve = new Promise(() => {});
      const mockLoginAction = { unwrap: () => neverResolve };
      ((loginAsync as unknown) as jest.Mock).mockReturnValueOnce(mockLoginAction);
      mockDispatch.mockReturnValueOnce(mockLoginAction);

      const { getByTestId, unmount } = renderWithProviders(<LoginScreen />);

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signInButton = getByTestId('sign-in-button');

      await act(async () => {
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
      });

      await act(async () => {
        fireEvent.press(signInButton);
      });

      await waitFor(() => {
        expect(signInButton.props.accessibilityState.disabled).toBe(true);
        expect(emailInput.props.editable).toBe(false);
        expect(passwordInput.props.editable).toBe(false);
      });

      unmount();
    });
  });
}); 