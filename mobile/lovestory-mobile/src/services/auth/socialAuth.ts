import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

// Initialize Google Sign-In
// TODO: Replace with your Google Web Client ID
const GOOGLE_WEB_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID';
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

export type SocialAuthResponse = {
  type: 'success' | 'error';
  message?: string;
  data?: {
    id: string;
    email: string;
    name?: string;
    photoUrl?: string;
    provider: 'google' | 'apple';
  };
};

export const signInWithGoogle = async (): Promise<SocialAuthResponse> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    if (!userInfo.user) {
      throw new Error('Failed to get user information');
    }

    return {
      type: 'success',
      data: {
        id: userInfo.user.id,
        email: userInfo.user.email,
        name: userInfo.user.name,
        photoUrl: userInfo.user.photo,
        provider: 'google',
      },
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return {
      type: 'error',
      message: 'Failed to sign in with Google',
    };
  }
};

export const signInWithApple = async (): Promise<SocialAuthResponse> => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    return {
      type: 'success',
      data: {
        id: credential.user,
        email: credential.email || '',
        name: credential.fullName?.givenName 
          ? `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`
          : undefined,
        provider: 'apple',
      },
    };
  } catch (error) {
    if (error.code === 'ERR_CANCELED') {
      return {
        type: 'error',
        message: 'Sign in was canceled',
      };
    }

    console.error('Apple Sign-In Error:', error);
    return {
      type: 'error',
      message: 'Failed to sign in with Apple',
    };
  }
};

// Check if device supports Apple Sign In
export const isAppleSignInAvailable = async (): Promise<boolean> => {
  return Platform.OS === 'ios' && 
    (await AppleAuthentication.isAvailableAsync());
}; 