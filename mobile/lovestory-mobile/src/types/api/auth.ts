import { User } from '../models';
import { ApiResponse } from './common';

/**
 * Auth response data
 */
export interface AuthResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Login response from the API
 */
export type LoginResponse = ApiResponse<AuthResponseData>;

/**
 * Refresh token response data
 */
export interface RefreshTokenResponseData {
  accessToken: string;
}

/**
 * Refresh token response from the API
 */
export type RefreshTokenResponse = ApiResponse<RefreshTokenResponseData>;

/**
 * Login credentials for email/password authentication
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Social authentication credentials
 */
export interface SocialAuthCredentials {
  provider: 'google' | 'apple';
  token: string;
  email?: string;
  name?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password update request
 */
export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
} 