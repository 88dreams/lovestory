import { ApiClient } from './client';
import { AbstractBaseService } from './factory';
import {
  AuthResponse,
  CreateUserRequest,
  EmailVerificationRequest,
  LoginCredentials,
  PasswordResetRequest,
  PasswordUpdateRequest,
  User,
} from '../../types/models';

/**
 * Service for handling authentication-related API requests
 */
export class AuthService extends AbstractBaseService<User> {
  constructor(client: ApiClient) {
    super(client, '/auth');
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(`${this.basePath}/login`, credentials);
    await this.client.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  /**
   * Register a new user
   */
  async register(data: CreateUserRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(`${this.basePath}/register`, data);
    await this.client.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    await this.client.post(`${this.basePath}/logout`);
    await this.client.clearTokens();
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await this.client.post(`${this.basePath}/password/reset`, data);
  }

  /**
   * Update password
   */
  async updatePassword(data: PasswordUpdateRequest): Promise<void> {
    await this.client.post(`${this.basePath}/password/update`, data);
  }

  /**
   * Verify email address
   */
  async verifyEmail(data: EmailVerificationRequest): Promise<void> {
    await this.client.post(`${this.basePath}/email/verify`, data);
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    await this.client.post(`${this.basePath}/email/verify/resend`);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>(`${this.basePath}/me`);
    return response.data;
  }

  /**
   * Check if access token is valid
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
} 