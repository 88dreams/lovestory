import { API_BASE_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../../store/slices/authSlice';
import type { SocialAuthResponse } from './socialAuth';

const TOKEN_KEY = '@auth_token';

export type ApiResponse<T = any> = {
  type: 'success' | 'error';
  data?: T;
  message?: string;
};

export type AuthData = {
  user: User;
  token: string;
};

export type PasswordResetResponse = {
  type: 'success' | 'error';
  message: string;
  isEmailSent: boolean;
};

export type ResetPasswordData = {
  email: string;
};

export type NewPasswordData = {
  token: string;
  password: string;
};

export type EmailVerificationResponse = {
  type: 'success' | 'error';
  message: string;
  isEmailSent?: boolean;
};

class AuthService {
  private static instance: AuthService;
  private baseUrl: string;
  private token: string | null = null;

  private constructor() {
    this.baseUrl = `${API_BASE_URL}/auth`;
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async validateToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // TODO: Implement token validation with backend
      // For now, just check if token exists
      return true;
    } catch (error) {
      return false;
    }
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    await AsyncStorage.setItem('@LoveStory:auth_token', token);
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('@LoveStory:auth_token');
    }
    return this.token;
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem('@LoveStory:auth_token');
  }

  async getStoredToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      this.token = token;
      return token;
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  async setStoredToken(token: string | null): Promise<void> {
    try {
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
      this.token = token;
    } catch (error) {
      console.error('Failed to set stored token:', error);
    }
  }

  async getCurrentUser(): Promise<User> {
    // TODO: Implement actual API call to get current user
    // This is a mock implementation
    return {
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
      isEmailVerified: false,
    };
  }

  /**
   * Request a password reset email
   * @param data - Object containing the user's email
   * @returns Promise<PasswordResetResponse>
   */
  public async requestPasswordReset(data: ResetPasswordData): Promise<PasswordResetResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to request password reset');
      }

      return {
        type: 'success',
        message: 'Password reset email sent successfully',
        isEmailSent: true,
      };
    } catch (error) {
      console.error('Password Reset Error:', error);
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to request password reset',
        isEmailSent: false,
      };
    }
  }

  /**
   * Reset password with token
   * @param data - Object containing the reset token and new password
   * @returns Promise<ApiResponse>
   */
  public async resetPassword(data: NewPasswordData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/reset-password/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          type: 'error',
          message: result.message || 'Failed to reset password'
        };
      }

      return {
        type: 'success',
        message: 'Password reset successful'
      };
    } catch (error) {
      console.error('Password Reset Error:', error);
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to reset password'
      };
    }
  }

  async login(credentials: { email: string; password: string }): Promise<ApiResponse<AuthData>> {
    // TODO: Implement actual API call
    // This is a mock implementation
    const mockData: AuthData = {
      user: {
        id: '1',
        email: credentials.email,
        name: 'Test User',
        isEmailVerified: false,
      },
      token: 'mock_token',
    };

    await this.setStoredToken(mockData.token);
    return {
      type: 'success',
      data: mockData,
    };
  }

  async register(data: { name: string; email: string; password: string }): Promise<ApiResponse<AuthData>> {
    // TODO: Implement actual API call
    // This is a mock implementation
    const mockData: AuthData = {
      user: {
        id: '1',
        email: data.email,
        name: data.name,
        isEmailVerified: false,
      },
      token: 'mock_token',
    };

    await this.setStoredToken(mockData.token);
    return {
      type: 'success',
      data: mockData,
    };
  }

  async socialAuth(socialAuthData: SocialAuthResponse): Promise<ApiResponse<AuthData>> {
    try {
      if (socialAuthData.type === 'error' || !socialAuthData.data) {
        return {
          type: 'error',
          message: socialAuthData.message || 'Social authentication failed',
        };
      }

      // Send the social auth data to your backend
      const response = await fetch(`${this.baseUrl}/social-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: socialAuthData.data.provider,
          providerId: socialAuthData.data.id,
          email: socialAuthData.data.email,
          name: socialAuthData.data.name,
          avatar: socialAuthData.data.photoUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to authenticate with social provider');
      }

      // Store the token
      await this.setStoredToken(result.token);

      return {
        type: 'success',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            avatar: result.user.avatar,
            isEmailVerified: result.user.isEmailVerified || false,
          },
          token: result.token,
        },
      };
    } catch (error) {
      console.error('Social Auth Error:', error);
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to authenticate with social provider',
      };
    }
  }

  async logout(): Promise<void> {
    // TODO: Implement actual API call if needed
    await this.setStoredToken(null);
  }

  /**
   * Request email verification
   * Sends a verification email to the user's email address
   */
  public async requestEmailVerification(): Promise<EmailVerificationResponse> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.baseUrl}/verify-email/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send verification email');
      }

      return {
        type: 'success',
        message: 'Verification email sent successfully',
        isEmailSent: true,
      };
    } catch (error) {
      console.error('Email Verification Request Error:', error);
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send verification email',
        isEmailSent: false,
      };
    }
  }

  /**
   * Verify email with token
   * @param token - The verification token received via email
   */
  public async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-email/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to verify email');
      }

      return {
        type: 'success',
        message: 'Email verified successfully',
        data: result.user,
      };
    } catch (error) {
      console.error('Email Verification Error:', error);
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to verify email',
      };
    }
  }
}

export const authService = AuthService.getInstance(); 