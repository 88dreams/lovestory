import React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen } from '../../screens/auth/LoginScreen';
import { renderWithProviders } from '../utils';
import { signInWithGoogle, signInWithApple } from '../../services/auth/socialAuth';
import { authApi } from '../../services/api/auth';
import { mockNavigation, mockDispatch } from '../setup';
import type { TestElement } from '../jest.d';
import type { AppDispatch } from '../../store';

// Mock response types
interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

interface SocialAuthResponse {
  token: string;
  provider: 'google' | 'apple';
}

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('Email/Password Authentication', () => {
    it('successfully completes login flow and stores token', async () => {
      const mockToken = 'mock-auth-token';
      const mockUser = { id: 1, email: 'test@example.com' };
      
      (authApi.login as jest.Mock).mockResolvedValueOnce({
        token: mockToken,
        user: mockUser,
      });

      const { getByTestId } = renderWithProviders(<LoginScreen />);

      await act(async () => {
        fireEvent.changeText(getByTestId('email-input') as TestElement, 'test@example.com');
        fireEvent.changeText(getByTestId('password-input') as TestElement, 'password123');
        fireEvent.press(getByTestId('sign-in-button') as TestElement);
      });

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@auth_token', mockToken);
        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });
    });

    it('handles login failure with invalid credentials', async () => {
      (authApi.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

      const { getByTestId, findByTestId } = renderWithProviders(<LoginScreen />);

      await act(async () => {
        fireEvent.changeText(getByTestId('email-input') as TestElement, 'test@example.com');
        fireEvent.changeText(getByTestId('password-input') as TestElement, 'wrongpassword');
        fireEvent.press(getByTestId('sign-in-button') as TestElement);
      });

      const errorMessage = await findByTestId('form-error');
      expect(errorMessage).toBeTruthy();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('handles network errors during login', async () => {
      const networkError = new Error('Network request failed');
      (authApi.login as jest.Mock).mockRejectedValueOnce(networkError);

      const { getByTestId, findByTestId } = renderWithProviders(<LoginScreen />);

      await act(async () => {
        fireEvent.changeText(getByTestId('email-input') as TestElement, 'test@example.com');
        fireEvent.changeText(getByTestId('password-input') as TestElement, 'password123');
        fireEvent.press(getByTestId('sign-in-button') as TestElement);
      });

      const errorMessage = await findByTestId('form-error');
      expect(errorMessage).toBeTruthy();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('handles timeout during login', async () => {
      (authApi.login as jest.Mock).mockImplementationOnce(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 5000);
        })
      );

      const { getByTestId, findByTestId } = renderWithProviders(<LoginScreen />);

      await act(async () => {
        fireEvent.changeText(getByTestId('email-input') as TestElement, 'test@example.com');
        fireEvent.changeText(getByTestId('password-input') as TestElement, 'password123');
        fireEvent.press(getByTestId('sign-in-button') as TestElement);
      });

      const errorMessage = await findByTestId('form-error');
      expect(errorMessage).toBeTruthy();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('disables form during submission', async () => {
      const { getByTestId } = renderWithProviders(<LoginScreen />);

      // Fill form
      await act(async () => {
        fireEvent.changeText(getByTestId('email-input') as TestElement, 'test@example.com');
        fireEvent.changeText(getByTestId('password-input') as TestElement, 'password123');
        fireEvent.press(getByTestId('sign-in-button') as TestElement);
      });

      const emailInput = getByTestId('email-input') as TestElement;
      const passwordInput = getByTestId('password-input') as TestElement;
      const signInButton = getByTestId('sign-in-button-loading') as TestElement;

      expect(signInButton).toBeTruthy();
      expect(emailInput.props.editable).toBe(false);
      expect(passwordInput.props.editable).toBe(false);
    });
  });

  describe('Social Authentication', () => {
    it('successfully completes Google authentication flow', async () => {
      const mockGoogleToken = 'mock-google-token';
      const mockAuthToken = 'mock-auth-token';
      const mockUser = { id: 1, email: 'test@gmail.com' };

      (signInWithGoogle as jest.Mock).mockResolvedValueOnce({
        token: mockGoogleToken,
        provider: 'google',
      });

      (authApi.socialAuth as jest.Mock).mockResolvedValueOnce({
        token: mockAuthToken,
        user: mockUser,
      });

      const { getByTestId } = renderWithProviders(<LoginScreen />);

      await act(async () => {
        fireEvent.press(getByTestId('google-auth-button') as TestElement);
      });

      await waitFor(() => {
        expect(signInWithGoogle).toHaveBeenCalled();
        expect(authApi.socialAuth).toHaveBeenCalledWith({
          token: mockGoogleToken,
          provider: 'google',
        });
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@auth_token', mockAuthToken);
        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });
    });

    it('handles Google authentication failure', async () => {
      (signInWithGoogle as jest.Mock).mockRejectedValueOnce(new Error('Google auth failed'));

      const { getByTestId, findByTestId } = renderWithProviders(<LoginScreen />);

      await act(async () => {
        fireEvent.press(getByTestId('google-auth-button') as TestElement);
      });

      const errorMessage = await findByTestId('form-error');
      expect(errorMessage).toBeTruthy();
      expect(authApi.socialAuth).not.toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('handles network errors during social auth', async () => {
      (signInWithGoogle as jest.Mock).mockResolvedValueOnce({
        token: 'google-token',
        provider: 'google',
      });
      (authApi.socialAuth as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { getByTestId, findByTestId } = renderWithProviders(<LoginScreen />);

      await act(async () => {
        fireEvent.press(getByTestId('google-auth-button') as TestElement);
      });

      const errorMessage = await findByTestId('form-error');
      expect(errorMessage).toBeTruthy();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Token Management', () => {
    it('validates and restores existing auth session on mount', async () => {
      const mockToken = 'stored-auth-token';
      const mockUser = { id: 1, email: 'test@example.com' };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(mockToken);
      (authApi.validateToken as jest.Mock).mockResolvedValueOnce({
        valid: true,
        user: mockUser,
      });

      renderWithProviders(<LoginScreen />);

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('@auth_token');
        expect(authApi.validateToken).toHaveBeenCalledWith(mockToken);
        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });
    });

    it('clears invalid token and requires re-authentication', async () => {
      const mockToken = 'invalid-token';

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(mockToken);
      (authApi.validateToken as jest.Mock).mockResolvedValueOnce({
        valid: false,
      });

      renderWithProviders(<LoginScreen />);

      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@auth_token');
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockNavigation.navigate).not.toHaveBeenCalled();
      });
    });

    it('handles token validation network errors', async () => {
      const mockToken = 'stored-token';
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(mockToken);
      (authApi.validateToken as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<LoginScreen />);

      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@auth_token');
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockNavigation.navigate).not.toHaveBeenCalled();
      });
    });
  });
}); 