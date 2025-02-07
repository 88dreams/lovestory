import { ApiClient } from '../../services/api/client';
import { ApiServiceFactory } from '../../services/api/factory';
import { server } from '../setup/msw';
import { createMockApiResponse, createMockApiError } from '../setup/factories';

/**
 * Create a test API client with optional configuration
 */
export const createTestApiClient = () => {
  return new ApiClient({
    baseURL: 'https://api.lovestory.app/v1',
  });
};

/**
 * Create a test service factory
 */
export const createTestServiceFactory = () => {
  return ApiServiceFactory.getInstance({
    baseURL: 'https://api.lovestory.app/v1',
  });
};

/**
 * Helper to wait for MSW request to complete
 */
export const waitForRequest = (method: string, path: string): Promise<Request> => {
  return new Promise((resolve) => {
    server.events.on('request:match', ({ request }) => {
      if (
        request.method.toLowerCase() === method.toLowerCase() &&
        request.url.includes(path)
      ) {
        resolve(request);
      }
    });
  });
};

/**
 * Mock successful API response
 */
export const mockSuccessResponse = <T>(data: T) => {
  return createMockApiResponse(data);
};

/**
 * Mock failed API response
 */
export const mockErrorResponse = (code: string, message: string, status = 400) => {
  return createMockApiError(code, message, status);
};

/**
 * Helper to test API error handling
 */
export const expectApiError = async (promise: Promise<any>, code: string, status: number) => {
  try {
    await promise;
    fail('Expected promise to reject');
  } catch (error: any) {
    expect(error.code).toBe(code);
    expect(error.status).toBe(status);
  }
};

/**
 * Helper to test API success response
 */
export const expectApiSuccess = async <T>(promise: Promise<T>, expectedData: T) => {
  const result = await promise;
  expect(result).toEqual(expectedData);
};

/**
 * Setup function for API tests
 */
export const setupApiTest = () => {
  // Start MSW server before tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  // Reset handlers between tests
  afterEach(() => server.resetHandlers());

  // Clean up after tests
  afterAll(() => server.close());

  // Create fresh instances for each test
  const client = createTestApiClient();
  const factory = createTestServiceFactory();

  return {
    client,
    factory,
  };
};

/**
 * Helper to create mock AsyncStorage for token tests
 */
export const createMockAsyncStorage = () => {
  const store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => Promise.resolve(store[key])),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
    multiGet: jest.fn((keys: string[]) => 
      Promise.resolve(keys.map(key => [key, store[key]]))
    ),
    multiSet: jest.fn((keyValuePairs: string[][]) => {
      keyValuePairs.forEach(([key, value]) => {
        store[key] = value;
      });
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys: string[]) => {
      keys.forEach(key => delete store[key]);
      return Promise.resolve();
    }),
  };
}; 