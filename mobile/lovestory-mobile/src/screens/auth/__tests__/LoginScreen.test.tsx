import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { renderWithProviders } from '../../../test/utils';
import { mockDispatch, mockSelector, mockAuthState } from '../../../test/setup';
import { signInWithGoogle, signInWithApple, isAppleSignInAvailable } from '../../../services/auth/socialAuth';

// Mock social auth services
jest.mock('../../../services/auth/socialAuth', () => ({
  signInWithGoogle: jest.fn(),
  signInWithApple: jest.fn(),
  isAppleSignInAvailable: jest.fn(),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelector.mockImplementation(() => ({
      auth: mockAuthState,
    }));
  });

  it('renders correctly with all UI elements', async () => {
    const { getByTestId } = await renderWithProviders(<LoginScreen />);

    // Verify all required elements are present
    expect(getByTestId('welcome-text')).toBeTruthy();
    expect(getByTestId('subtitle-text')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('sign-in-button')).toBeTruthy();
    expect(getByTestId('forgot-password-button')).toBeTruthy();
    expect(getByTestId('google-auth-button')).toBeTruthy();
    expect(getByTestId('apple-auth-button')).toBeTruthy();
    expect(getByTestId('sign-up-button')).toBeTruthy();
  });

  it('handles form input changes', async () => {
    const { getByTestId } = await renderWithProviders(<LoginScreen />);

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('handles successful login', async () => {
    const { getByTestId } = await renderWithProviders(<LoginScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('sign-in-button'));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      const dispatchedAction = mockDispatch.mock.calls[0][0];
      expect(typeof dispatchedAction).toBe('function');
    });
  });

  it('handles failed login', async () => {
    mockDispatch.mockImplementationOnce((action) => {
      if (typeof action === 'function') {
        return Promise.resolve({
          unwrap: () => Promise.reject('Failed to login'),
        });
      }
      return Promise.resolve(action);
    });

    const { getByTestId, findByText } = await renderWithProviders(<LoginScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'wrong');
    fireEvent.press(getByTestId('sign-in-button'));

    const errorMessage = await findByText('Failed to login');
    expect(errorMessage).toBeTruthy();
  });

  it('handles social auth', async () => {
    const mockGoogleResponse = { token: 'google-token', provider: 'google' };
    (signInWithGoogle as jest.Mock).mockResolvedValueOnce(mockGoogleResponse);

    const { getByTestId } = await renderWithProviders(<LoginScreen />);
    fireEvent.press(getByTestId('google-auth-button'));

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
      const dispatchedAction = mockDispatch.mock.calls[0][0];
      expect(typeof dispatchedAction).toBe('function');
    });
  });
}); 