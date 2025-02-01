import { jest } from '@jest/globals';

// Helper to cast a jest.fn to a typed mock function (only enforcing return type)
const typedMock = <T extends (...args: any[]) => any>(fn: T): jest.Mock<ReturnType<T>> => {
  return fn as unknown as jest.Mock<ReturnType<T>>;
};

// Types
interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

interface ValidateTokenResponse {
  valid: boolean;
  user?: AuthResponse['user'];
}

interface LoginParams {
  email: string;
  password: string;
}

interface SocialAuthParams {
  token: string;
  provider: string;
}

// Mock responses
export const mockAuthResponse: AuthResponse = {
  token: 'mock-token',
  user: { id: 1, email: 'test@example.com' }
};

// Refined mocks with explicit typing using the helper
export const mockAuthApi = {
  login: typedMock(jest.fn<Promise<AuthResponse>, [LoginParams]>()).mockResolvedValue(mockAuthResponse),
  validateToken: typedMock(jest.fn<Promise<ValidateTokenResponse>, [string]>()).mockResolvedValue({ valid: true, user: mockAuthResponse.user }),
  socialAuth: typedMock(jest.fn<Promise<AuthResponse>, [SocialAuthParams]>()).mockResolvedValue(mockAuthResponse),
};

export const mockSocialAuth = {
  signInWithGoogle: typedMock(jest.fn<Promise<string>, []>()).mockResolvedValue('mock-google-token'),
  signInWithApple: typedMock(jest.fn<Promise<string>, []>()).mockResolvedValue('mock-apple-token'),
  isAppleSignInAvailable: typedMock(jest.fn<Promise<boolean>, []>()).mockResolvedValue(true),
};

export const mockNavigation = {
  navigate: typedMock(jest.fn<void, [string, any?]>()),
  goBack: typedMock(jest.fn<void, []>()),
};

export const mockAsyncStorage = {
  getItem: typedMock(jest.fn<Promise<string | null>, [string]>()),
  setItem: typedMock(jest.fn<Promise<void>, [string, string]>()),
  removeItem: typedMock(jest.fn<Promise<void>, [string]>()),
  clear: typedMock(jest.fn<Promise<void>, []>()),
}; 