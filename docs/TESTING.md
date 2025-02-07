# Testing Strategy & Infrastructure

## Overview
This document outlines the testing strategy, infrastructure, and implementation guidelines for the LoveStory mobile application.

## Table of Contents
1. [Testing Layers](#testing-layers)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Test Organization](#test-organization)
4. [Implementation Guide](#implementation-guide)
5. [Best Practices](#best-practices)
6. [Current Status](#current-status)

## Testing Layers

### Unit Tests
- Individual component testing
- Service method testing
- Utility function testing
- State management testing

### Integration Tests
- Service interactions
- Complex workflows
- API integration
- State management integration

### End-to-End Tests
- User flows
- Critical paths
- Cross-feature interactions

## Infrastructure Setup

### 1. Testing Framework
- Jest with `jest-expo` preset as the main test runner
- React Native Testing Library for component testing
- Mock Service Worker (MSW) for API mocking
- Custom test utilities and helpers

### 2. Key Configuration Files

#### 2.1 Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFiles: [
    './node_modules/react-native/jest/setup.js',
    './node_modules/react-native-gesture-handler/jestSetup.js',
  ],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    './src/test/setupJest.tsx'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@rneui/.*|@testing-library/jest-native)'
  ],
  moduleNameMapper: {
    '^@components(.*)$': '<rootDir>/src/components$1',
    '^@screens(.*)$': '<rootDir>/src/screens$1',
    '^@navigation(.*)$': '<rootDir>/src/navigation$1',
    '^@services(.*)$': '<rootDir>/src/services$1',
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@hooks(.*)$': '<rootDir>/src/hooks$1',
    '^@store(.*)$': '<rootDir>/src/store$1',
    '^@theme(.*)$': '<rootDir>/src/theme$1',
    '^@test(.*)$': '<rootDir>/src/test$1'
  }
}
```

#### 2.2 Global Test Setup
```typescript
// src/test/setupJest.tsx
// 1. Setup Jest and Testing Library
import { jest } from '@jest/globals';

// 2. React Native core mocks
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native') as typeof import('react-native');
  return {
    ...RN,
    Platform: {
      OS: 'ios',
      select: jest.fn((obj: { ios: unknown; android: unknown }) => obj.ios),
    },
    StyleSheet: {
      create: jest.fn((styles: Record<string, any>) => styles),
    },
  };
});

// 3. Theme provider mocks
jest.mock('../theme/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useThemedStyles: (fn: (theme: any) => Record<string, any>) => {
    if (typeof fn === 'function') {
      return fn({
        colors: {
          primary: { 500: '#000000' },
          error: { 500: '#FF0000' },
          text: { primary: '#000000' },
          background: { primary: '#FFFFFF', secondary: '#F5F5F5' },
        },
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
        radius: { sm: 4, md: 8, lg: 16 },
      });
    }
    return {};
  },
}));

// 4. Service mocks and MSW setup
// ... (existing MSW setup code)
```

### 3. Directory Structure
```
src/
├── services/
│   └── api/
│       ├── __tests__/                  # Service-level tests
│       │   ├── client.test.ts          # API client tests
│       │   ├── auth.test.ts            # Auth service tests
│       │   ├── story.test.ts           # Story service tests
│       │   ├── video.test.ts           # Video service tests
│       │   └── factory.test.ts         # Service factory tests
│       └── __mocks__/                  # Service mocks
│           ├── responses/              # Mock API responses
│           └── handlers.ts             # MSW request handlers
└── test/
    ├── setup/                          # Test setup files
    │   ├── msw.ts                      # MSW setup
    │   └── factories.ts                # Test data factories
    ├── mocks/                          # Mock implementations
    │   ├── components/                 # Component mocks
    │   ├── navigation/                 # Navigation mocks
    │   └── services/                   # Service mocks
    └── unit/                           # Unit tests
        └── components/                 # Component tests
```

### 3. Key Components

#### 3.1 Mock Service Worker (MSW)
```typescript
// src/test/setup/msw.ts
import { setupServer } from 'msw/node';
import { handlers } from '../../services/api/__mocks__/handlers';

export const server = setupServer(...handlers);
```

#### 3.2 Test Data Factories
```typescript
// src/test/setup/factories.ts
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  // ... other user properties
  ...overrides
});

export const createMockTemplate = (overrides = {}) => ({
  id: 'template-123',
  title: 'Test Template',
  // ... other template properties
  ...overrides
});
```

#### 3.3 API Testing Utilities
```typescript
// src/test/utils/apiTestUtils.ts
export const mockApiResponse = <T>(data: T, status = 200) => ({
  data,
  status,
  headers: {},
});

export const mockApiError = (code: string, message: string, status = 400) => ({
  code,
  message,
  status,
});
```

## Test Organization

### 1. Service Tests
Each service should have its own test file with the following sections:
- Constructor and initialization
- CRUD operations
- Error handling
- Special operations
- Edge cases

Example:
```typescript
// src/services/api/__tests__/auth.test.ts
describe('AuthService', () => {
  describe('initialization', () => {
    // Constructor tests
  });

  describe('authentication', () => {
    // Login/logout tests
  });

  describe('token management', () => {
    // Token handling tests
  });

  describe('error handling', () => {
    // Error scenario tests
  });
});
```

### 2. Integration Tests
Focus on service interactions and workflows:
- Multi-step processes
- Service dependencies
- State management
- Error recovery

## Implementation Guide

### 1. Setting Up MSW
```bash
# Install dependencies
yarn add -D msw

# Initialize MSW
npx msw init ./public
```

### 2. Creating Test Data
1. Identify common data structures
2. Create factory functions
3. Allow customization through overrides
4. Maintain type safety

### 3. Writing Tests
1. Start with unit tests
2. Add integration tests
3. Implement E2E tests for critical paths
4. Focus on error scenarios

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use clear, descriptive test names
- Follow the Arrange-Act-Assert pattern
- Keep tests focused and atomic

### 2. Mocking
- Mock external dependencies
- Use MSW for API calls
- Create reusable mock factories
- Avoid excessive mocking

### 3. Assertions
- Test both success and failure cases
- Verify state changes
- Check error handling
- Validate side effects

### 4. Code Coverage
- Aim for high coverage of business logic
- Focus on critical paths
- Don't chase 100% coverage blindly
- Use coverage reports as guidance

## Running Tests

### Commands
```bash
# Run all tests
yarn test

# Run specific test file
yarn test auth.test.ts

# Run with coverage
yarn test --coverage

# Run in watch mode
yarn test --watch
```

### Coverage Thresholds
```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: yarn install
      - run: yarn test
```

## Next Steps

1. **API Service Testing**
   - [ ] Set up MSW
   - [ ] Create test data factories
   - [ ] Implement API client tests
   - [ ] Add service-specific tests

2. **Integration Testing**
   - [ ] Test service interactions
   - [ ] Verify workflows
   - [ ] Test error scenarios

3. **E2E Testing**
   - [ ] Set up E2E framework
   - [ ] Implement critical path tests
   - [ ] Add user flow tests

## Notes
- Keep tests maintainable and readable
- Focus on business value
- Regular test maintenance
- Document complex test scenarios

## Current Status

We have established a basic testing infrastructure with:
1. A clean separation of concerns in the setup files
2. Proper mocking of React Native core functionality
3. Theme provider mocks for styling
4. Basic service mocks for common functionalities

### Example Component Test
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { TouchableOpacity, Text } from 'react-native';

const SimpleButton = ({ onPress, children }) => (
  <TouchableOpacity onPress={onPress} testID="simple-button">
    <Text>{children}</Text>
  </TouchableOpacity>
);

describe('SimpleButton', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <SimpleButton onPress={() => {}}>Test</SimpleButton>
    );
    expect(getByTestId('simple-button')).toBeTruthy();
  });
});
```

### Known Issues and TODOs

1. Need to verify MSW integration with more complex API tests
2. Consider adding E2E testing setup
3. Add more comprehensive component testing examples
4. Document common testing patterns and gotchas 