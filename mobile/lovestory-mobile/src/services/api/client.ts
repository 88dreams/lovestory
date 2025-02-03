import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiClientConfig, ApiError, ApiErrorCode, ApiErrorResponse, ApiResponse } from '../../types/api/common';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: process.env.API_BASE_URL || 'https://api.lovestory.app/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@LoveStory:accessToken',
  REFRESH_TOKEN: '@LoveStory:refreshToken',
};

// Add custom retry property to AxiosRequestConfig
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * API Client for handling HTTP requests with proper error handling,
 * token management, and request/response transformation
 */
export class ApiClient {
  private instance: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.instance = axios.create({
      ...DEFAULT_CONFIG,
      ...config,
    });

    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        // Check network connectivity
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          throw new ApiError({
            code: ApiErrorCode.NETWORK_ERROR,
            message: 'No internet connection',
            status: 0,
          });
        }

        // Add auth token if available
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add platform info
        config.headers['X-Platform'] = Platform.OS;
        config.headers['X-Platform-Version'] = Platform.Version;

        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const apiResponse: ApiResponse<unknown> = {
          data: response.data,
          status: response.status,
          message: response.data?.message,
        };
        return { ...response, data: apiResponse };
      },
      async (error: unknown) => {
        if (axios.isAxiosError(error)) {
          const originalRequest = error.config as RetryableRequest;

          // Handle token refresh
          if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            if (this.refreshPromise) {
              // Wait for existing refresh request
              const token = await this.refreshPromise;
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            }

            try {
              originalRequest._retry = true;
              this.refreshPromise = this.refreshToken();
              const token = await this.refreshPromise;
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            } catch (refreshError) {
              return Promise.reject(this.handleError(refreshError));
            } finally {
              this.refreshPromise = null;
            }
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle successful responses
   */
  private handleSuccess<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      message: response.data?.message,
    };
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const response = error.response?.data as ApiErrorResponse;
      
      return new ApiError({
        code: response?.code || this.mapHttpErrorToCode(error.response?.status),
        message: response?.message || error.message,
        status: error.response?.status || 0,
        details: response?.details,
      });
    }

    if (error instanceof Error) {
      return new ApiError({
        code: ApiErrorCode.UNKNOWN_ERROR,
        message: error.message,
        status: 0,
      });
    }

    return new ApiError({
      code: ApiErrorCode.UNKNOWN_ERROR,
      message: 'An unknown error occurred',
      status: 0,
    });
  }

  /**
   * Map HTTP status codes to API error codes
   */
  private mapHttpErrorToCode(status?: number): ApiErrorCode {
    switch (status) {
      case 401:
        return ApiErrorCode.UNAUTHORIZED;
      case 403:
        return ApiErrorCode.FORBIDDEN;
      case 404:
        return ApiErrorCode.NOT_FOUND;
      case 422:
        return ApiErrorCode.VALIDATION_ERROR;
      case 500:
        return ApiErrorCode.SERVER_ERROR;
      default:
        return ApiErrorCode.UNKNOWN_ERROR;
    }
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(): Promise<string> {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new ApiError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'No refresh token available',
        status: 401,
      });
    }

    try {
      const response = await this.instance.post<{ accessToken: string }>('/auth/refresh', {
        refreshToken,
      });

      const newToken = response.data.accessToken;
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);
      return newToken;
    } catch (error) {
      // Clear tokens on refresh failure
      await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN]);
      throw error;
    }
  }

  /**
   * Set authentication tokens
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
    ]);
  }

  /**
   * Clear authentication tokens
   */
  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN]);
  }

  /**
   * Get the underlying axios instance
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }

  // Convenience methods for making requests
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config);
  }
} 