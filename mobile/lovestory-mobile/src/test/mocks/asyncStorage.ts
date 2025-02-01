const mockStorage: { [key: string]: string } = {};

export const mockAsyncStorage = {
  setItem: jest.fn((key: string, value: string) => {
    return new Promise((resolve) => {
      mockStorage[key] = value;
      resolve(null);
    });
  }),

  getItem: jest.fn((key: string) => {
    return new Promise((resolve) => {
      resolve(mockStorage[key] || null);
    });
  }),

  removeItem: jest.fn((key: string) => {
    return new Promise((resolve) => {
      delete mockStorage[key];
      resolve(null);
    });
  }),

  clear: jest.fn(() => {
    return new Promise((resolve) => {
      Object.keys(mockStorage).forEach(key => {
        delete mockStorage[key];
      });
      resolve(null);
    });
  }),

  getAllKeys: jest.fn(() => {
    return new Promise((resolve) => {
      resolve(Object.keys(mockStorage));
    });
  }),

  multiGet: jest.fn((keys: string[]) => {
    return new Promise((resolve) => {
      const values = keys.map(key => [key, mockStorage[key] || null]);
      resolve(values);
    });
  }),

  multiSet: jest.fn((keyValuePairs: string[][]) => {
    return new Promise((resolve) => {
      keyValuePairs.forEach(([key, value]) => {
        mockStorage[key] = value;
      });
      resolve(null);
    });
  }),

  multiRemove: jest.fn((keys: string[]) => {
    return new Promise((resolve) => {
      keys.forEach(key => {
        delete mockStorage[key];
      });
      resolve(null);
    });
  }),

  _mockStorage: mockStorage, // Expose for testing
  _reset: () => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  }
}; 