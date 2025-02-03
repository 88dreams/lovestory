import { BaseModel } from './base';

/**
 * User roles enum
 */
export enum UserRole {
  USER = 'USER',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN',
}

/**
 * User status enum
 */
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

/**
 * User profile model
 */
export interface UserProfile extends BaseModel {
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
}

/**
 * User model
 */
export interface User extends BaseModel {
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  profile: UserProfile;
  isEmailVerified: boolean;
  lastLoginAt?: string;
}

/**
 * User creation request
 */
export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

/**
 * User update request
 */
export interface UpdateUserRequest {
  username?: string;
  profile?: Partial<UserProfile>;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
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

/**
 * Email verification request
 */
export interface EmailVerificationRequest {
  token: string;
} 