import {
  LoginResponse,
  RefreshTokenResponse,
  LoginCredentials,
  SocialAuthCredentials,
  PasswordResetRequest,
  PasswordUpdateRequest,
  AuthResponseData,
  RefreshTokenResponseData,
} from '../../types/api/auth';
import { ApiResponse } from '../../types/api/common';
import { httpClient } from '../api/client';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return httpClient.post<AuthResponseData>('/auth/login', credentials);
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return httpClient.post<RefreshTokenResponseData>('/auth/refresh', { refreshToken });
  }

  async socialAuth(credentials: SocialAuthCredentials): Promise<LoginResponse> {
    return httpClient.post<AuthResponseData>('/auth/social', credentials);
  }

  async resetPassword(request: PasswordResetRequest): Promise<ApiResponse<void>> {
    return httpClient.post<void>('/auth/reset-password', request);
  }

  async updatePassword(request: PasswordUpdateRequest): Promise<ApiResponse<void>> {
    return httpClient.post<void>('/auth/update-password', request);
  }
}

export const authService = new AuthService(); 