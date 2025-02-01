export const mockDispatch = jest.fn((action) => {
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