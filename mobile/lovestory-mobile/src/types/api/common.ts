/**
 * Common API types for the LoveStory application
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error?: {
    code: ApiErrorCode;
    message: string;
  };
}

/**
 * API error codes enum
 */
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, string[]>;
  status: number;
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  details?: Record<string, string[]>;

  constructor(error: ApiErrorResponse) {
    super(error.message);
    this.name = 'ApiError';
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
  }
}

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Pagination metadata in responses
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  nextCursor?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Base query parameters interface
 */
export interface BaseQueryParams extends PaginationParams {
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
} 