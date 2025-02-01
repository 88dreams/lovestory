import { jest } from '@jest/globals';
import { mockAuthApi, mockSocialAuth, mockNavigation, mockAsyncStorage, mockAuthResponse } from './auth';

interface Action {
  type?: string;
  payload?: any;
}

// Redux mock
export const mockDispatch = jest.fn((action: Action) => {
  if (action.type?.endsWith('/rejected')) {
    return {
      unwrap: () => Promise.reject(new Error('Mock error'))
    };
  }
  return {
    unwrap: () => Promise.resolve({ token: 'mock-token', user: { id: 1, email: 'test@example.com' } })
  };
});

export const mockSelector = jest.fn();

// Settings mock
export const mockSettings = {
  get: jest.fn(),
  set: jest.fn(),
};

export {
  mockAuthApi,
  mockSocialAuth,
  mockNavigation,
  mockAsyncStorage,
  mockAuthResponse
};
