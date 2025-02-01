import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { EmailVerificationScreen } from '../EmailVerificationScreen';
import { renderWithProviders, mockAuthState } from '../../../test/utils';
import { requestEmailVerification, verifyEmail } from '../../../store/slices/authSlice';

// Mock the navigation hook
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

describe('EmailVerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly without token', () => {
    const { getByText, queryByText } = renderWithProviders(<EmailVerificationScreen />);

    expect(getByText('Verify Your Email')).toBeTruthy();
    expect(getByText('Please verify your email address to continue using all features of the app.')).toBeTruthy();
    expect(getByText('Send Verification Email')).toBeTruthy();
    expect(queryByText('Verifying Email')).toBeFalsy();
  });

  it('shows success message after sending verification email', async () => {
    const { getByText, store } = renderWithProviders(<EmailVerificationScreen />, {
      preloadedState: { auth: mockAuthState },
    });

    const sendButton = getByText('Send Verification Email');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(store.getActions()).toContainEqual(expect.objectContaining({
        type: requestEmailVerification.pending.type,
      }));
    });

    expect(getByText('A new verification email has been sent. Please check your inbox and click the verification link.')).toBeTruthy();
  });

  it('handles verification token from route params', async () => {
    jest.mock('@react-navigation/native', () => ({
      ...jest.requireActual('@react-navigation/native'),
      useRoute: () => ({
        params: { token: 'test-token' },
      }),
    }));

    const { getByText, store } = renderWithProviders(<EmailVerificationScreen />, {
      preloadedState: { auth: mockAuthState },
    });

    expect(getByText('Verifying Email')).toBeTruthy();

    await waitFor(() => {
      expect(store.getActions()).toContainEqual(expect.objectContaining({
        type: verifyEmail.pending.type,
        meta: expect.objectContaining({
          arg: 'test-token',
        }),
      }));
    });
  });

  it('shows error message when verification fails', async () => {
    const errorMessage = 'Verification failed';
    jest.mock('@react-navigation/native', () => ({
      ...jest.requireActual('@react-navigation/native'),
      useRoute: () => ({
        params: { token: 'invalid-token' },
      }),
    }));

    const { getByText, store } = renderWithProviders(<EmailVerificationScreen />, {
      preloadedState: {
        auth: {
          ...mockAuthState,
          error: errorMessage,
        },
      },
    });

    expect(getByText(errorMessage)).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });
}); 