// Mock functions for AsyncStorage
export const mockAsyncStorage = {
  setItem: () => Promise.resolve(),
  getItem: () => Promise.resolve(null),
  removeItem: () => Promise.resolve(),
  clear: () => Promise.resolve(),
};

const createMockFunction = () => (...args: any[]) => {};
const createAsyncMockFunction = () => (...args: any[]) => Promise.resolve();

// Mock functions for Settings
export const mockSettings = {
  get: jest.fn(() => null),
  set: jest.fn(),
  watchKeys: jest.fn(),
  clearWatch: jest.fn(),
};

// Mock functions for Navigation
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
};

// Mock functions for Redux
export const mockDispatch = jest.fn();
export const mockSelector = jest.fn(() => ({
  auth: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
}));

// Mock functions for Social Auth
export const mockSocialAuth = {
  signInWithGoogle: jest.fn(() => Promise.resolve({ token: 'mock-token', provider: 'google' })),
  signInWithApple: jest.fn(() => Promise.resolve({ token: 'mock-token', provider: 'apple' })),
  isAppleSignInAvailable: jest.fn(() => Promise.resolve(true)),
};

// Mock functions for Auth API
export const mockAuthApi = {
  login: jest.fn(() => Promise.resolve({ token: 'mock-token', user: { id: 1, email: 'test@example.com' } })),
  socialAuth: jest.fn(() => Promise.resolve({ token: 'mock-token', user: { id: 1, email: 'test@example.com' } })),
  validateToken: jest.fn(() => Promise.resolve({ valid: true, user: { id: 1, email: 'test@example.com' } })),
}; 