import { jest } from '@jest/globals';

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

// Navigation mock
export const mockNavigation = {
  navigate: jest.fn((route: string) => {}),
  goBack: jest.fn(() => {}),
};
