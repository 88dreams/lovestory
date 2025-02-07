// Auth service mocks
export const mockAuthService = {
  login: jest.fn(async (email: string, password: string) => {
    if (email === 'test@example.com' && password === 'password123') {
      return {
        token: 'mock-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };
    }
    throw new Error('Invalid credentials');
  }),

  validateToken: jest.fn(async (token: string) => {
    if (token === 'mock-token') {
      return {
        valid: true,
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };
    }
    return { valid: false };
  }),

  socialAuth: jest.fn(async (token: string, provider: 'google' | 'apple') => {
    if (token) {
      return {
        token: 'mock-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };
    }
    throw new Error(`Failed to sign in with ${provider}`);
  }),
};

// Social auth mocks
export const mockSocialAuth = {
  signInWithGoogle: jest.fn(async () => 'mock-google-token'),
  signInWithApple: jest.fn(async () => 'mock-apple-token'),
  isAppleSignInAvailable: jest.fn(async () => true),
};

// AsyncStorage mock
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

// Network state mock
export const mockNetInfo = {
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(() => () => {}),
}; 