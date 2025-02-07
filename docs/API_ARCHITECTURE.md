# API Architecture Documentation

## Overview
This document outlines the API architecture for the LoveStory mobile application, detailing the structure, patterns, and best practices for API integration.

## Implementation Status ✅

The API infrastructure has been fully implemented with the following components:

### 1. API Client Infrastructure (`src/services/api/client.ts`)
✅ Implemented with:
- Centralized Axios instance with interceptors
- Request/Response transformation
- Error handling with custom ApiError class
- Token management (storage, refresh, cleanup)
- Network status checking
- Platform information headers
- Type-safe responses

### 2. Service Layer (`src/services/api/`)

#### 2.1 Base Infrastructure
✅ Implemented:
- Abstract base service with CRUD operations
- Service factory pattern for dependency injection
- Type-safe service creation
- Query parameter typing

#### 2.2 Core Services
All core services have been implemented:

##### AuthService (`src/services/api/auth.ts`)
✅ Features:
- Login/Register with token management
- Password reset and update
- Email verification
- Token validation
- Current user profile

##### TemplateService (`src/services/api/story.ts`)
✅ Features:
- Template CRUD operations
- Step management
- Featured and popular templates
- Category and tag support
- Visibility control

##### StoryService (`src/services/api/story.ts`)
✅ Features:
- Story generation
- Status tracking
- Sharing functionality
- Recent stories
- Template-based filtering

##### VideoService (`src/services/api/video.ts`)
✅ Features:
- Presigned upload URLs
- Upload completion handling
- Processing management
- Thumbnail generation
- Secure playback URLs

### 3. Type System (`src/types/`)

#### 3.1 Base Types
✅ Implemented:
```typescript
interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface SoftDeleteModel extends BaseModel {
  deletedAt?: string;
}

interface OwnedModel extends BaseModel {
  userId: string;
}
```

#### 3.2 Domain Models
✅ Implemented comprehensive type definitions for:
- User and authentication
- Story templates and steps
- Generated stories
- Video segments and processing

## Usage Examples

### Basic Service Usage
```typescript
import { authService, storyService, videoService } from '../services/api';

// Authentication
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get user profile
const user = await authService.getCurrentUser();
```

### Template Management
```typescript
import { templateService } from '../services/api';

// Create template
const template = await templateService.createTemplate({
  title: 'Birthday Celebration',
  description: 'A template for birthday celebrations',
  visibility: 'PUBLIC',
  steps: [
    {
      title: 'Opening',
      description: 'Start with a greeting',
      type: 'VIDEO',
      order: 1,
      requirements: {
        minDuration: 5,
        maxDuration: 15
      },
      isOptional: false
    }
  ]
});

// Get template steps
const steps = await templateService.getSteps(template.id);
```

### Video Upload Flow
```typescript
import { videoService } from '../services/api';

// 1. Get upload URL
const { uploadUrl, videoId, fields } = await videoService.getUploadUrl({
  stepId: 'step-123',
  title: 'Opening Scene'
});

// 2. Upload to S3 (using your preferred upload method)
await uploadToS3(uploadUrl, videoFile, fields);

// 3. Complete upload
const video = await videoService.completeUpload({ videoId });

// 4. Track processing
const status = await videoService.getProcessingStatus(video.id);
```

### Story Generation
```typescript
import { storyService } from '../services/api';

// Generate story
const story = await storyService.generate({
  templateId: 'template-123',
  title: 'My Birthday Story',
  segmentIds: ['video-1', 'video-2', 'video-3']
});

// Track generation
const status = await storyService.getGenerationStatus(story.id);

// Share when ready
const { shareUrl } = await storyService.share(story.id);
```

## Error Handling

The API infrastructure includes comprehensive error handling:

```typescript
try {
  await authService.login(credentials);
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case ApiErrorCode.UNAUTHORIZED:
        // Handle invalid credentials
        break;
      case ApiErrorCode.NETWORK_ERROR:
        // Handle network issues
        break;
      default:
        // Handle other errors
    }
  }
}
```

## Best Practices

1. **Token Management**
   - Tokens are automatically managed by the API client
   - Refresh is handled transparently
   - Failed refreshes trigger automatic logout

2. **Type Safety**
   - Use provided type definitions
   - Extend base interfaces for new models
   - Leverage query parameter types

3. **Error Handling**
   - Always wrap API calls in try/catch
   - Use ApiError type checking
   - Handle specific error codes appropriately

4. **Service Usage**
   - Use exported service instances
   - Don't create new service instances manually
   - Utilize the service factory for testing

## Next Steps

1. **React Hooks Layer**
   - Create custom hooks for each service
   - Add loading and error states
   - Implement caching strategy

2. **Testing**
   - Unit tests for services
   - Integration tests for API flows
   - Mock service responses

3. **Monitoring**
   - Add request logging
   - Track API performance
   - Monitor error rates

## Core Components

### 1. API Client Infrastructure

#### 1.1 Base API Client (`src/services/api/client.ts`)
- Centralized Axios instance with interceptors
- Request/Response transformation
- Error handling
- Authentication token management
- Rate limiting implementation
- Retry logic for failed requests
- Request cancellation support

```typescript
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

interface ApiError {
  message: string;
  code: string;
  status: number;
  data?: any;
}
```

#### 1.2 API Service Factory (`src/services/api/factory.ts`)
- Creates service instances with typed endpoints
- Manages service lifecycle
- Handles dependency injection
- Provides caching strategies

### 2. Service Layer

#### 2.1 Core Services
Each service follows a consistent pattern:
```typescript
interface BaseService<T> {
  get(id: string): Promise<T>;
  list(params?: QueryParams): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

Services include:
- AuthService (`src/services/api/auth.ts`)
- UserService (`src/services/api/user.ts`)
- StoryService (`src/services/api/story.ts`)
- VideoService (`src/services/api/video.ts`)
- TemplateService (`src/services/api/template.ts`)

#### 2.2 Service Hooks (`src/hooks/api/`)
React hooks for each service providing:
- Data fetching
- Caching
- Loading states
- Error handling
- Optimistic updates

### 3. Type System

#### 3.1 API Types (`src/types/api/`)
- Request/Response types
- Error types
- Pagination types
- Filter types
- Sort types

#### 3.2 Model Types (`src/types/models/`)
- Domain models
- DTO interfaces
- Validation schemas

### 4. Error Handling

#### 4.1 Error Types
```typescript
enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

interface ApiErrorResponse {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, string[]>;
}
```

#### 4.2 Error Handling Strategy
- Global error interceptor
- Service-level error handling
- UI-level error presentation
- Retry strategies for transient failures
- Offline error queueing

### 5. Authentication

#### 5.1 Token Management
- Secure token storage
- Token refresh mechanism
- Token rotation
- Multi-device session handling

#### 5.2 Auth Headers
```typescript
interface AuthHeaders {
  Authorization: string;
  'X-Client-Version': string;
  'X-Device-Id': string;
}
```

### 6. Caching Strategy

#### 6.1 Cache Levels
- Memory cache (RTK Query)
- Persistence cache (AsyncStorage)
- Cache invalidation rules
- Stale-while-revalidate pattern

#### 6.2 Cache Configuration
```typescript
interface CacheConfig {
  ttl: number;
  invalidationRules: Record<string, string[]>;
  persistenceKey?: string;
}
```

### 7. Rate Limiting

#### 7.1 Implementation
- Request throttling
- Concurrency limiting
- Retry backoff strategy
- Queue management

### 8. Monitoring & Logging

#### 8.1 Request Logging
- Request/Response logging
- Error tracking
- Performance metrics
- Usage analytics

#### 8.2 Metrics
```typescript
interface ApiMetrics {
  requestDuration: number;
  requestSize: number;
  responseSize: number;
  cacheHits: number;
  cacheMisses: number;
}
```

## Implementation Plan

### Phase 1: Core Infrastructure
1. Implement base API client
2. Set up authentication flow
3. Implement error handling
4. Add request/response interceptors

### Phase 2: Service Layer
1. Create service factory
2. Implement core services
3. Add service hooks
4. Set up caching

### Phase 3: Advanced Features
1. Add rate limiting
2. Implement monitoring
3. Add offline support
4. Optimize performance

## Best Practices

### Code Organization
- Keep services modular and focused
- Use dependency injection
- Follow consistent naming conventions
- Maintain comprehensive type coverage

### Error Handling
- Always handle errors at appropriate levels
- Provide meaningful error messages
- Implement retry strategies where appropriate
- Log errors for debugging

### Performance
- Implement efficient caching
- Use request cancellation
- Optimize payload size
- Implement pagination

### Security
- Secure token storage
- Implement request signing
- Validate all responses
- Handle sensitive data appropriately

## Testing

### Test Categories
1. Unit tests for services ✅
   - API client tests
   - Service method tests
   - Error handling scenarios
   - Token management
   - Cache behavior

2. Integration tests for API flows 🚧
   - Authentication flows
   - Story creation and management
   - Video upload process
   - Template management

3. Error handling tests ✅
   - Network errors
   - Authentication failures
   - Validation errors
   - Rate limiting
   - Timeout handling

4. Performance tests 📅
   - Response times
   - Concurrent requests
   - Cache effectiveness
   - Memory usage

5. Security tests 📅
   - Token security
   - Request signing
   - Data encryption
   - Access control

### Test Implementation
```typescript
// Example service test implementation
describe('ApiClient', () => {
  beforeEach(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should handle network errors', async () => {
    server.use(
      http.get('*/api/test', () => {
        return HttpResponse.error();
      })
    );

    await expect(apiClient.get('/test')).rejects.toThrow('Network Error');
  });

  it('should retry failed requests', async () => {
    let attempts = 0;
    server.use(
      http.get('*/api/test', () => {
        attempts++;
        if (attempts < 3) {
          return HttpResponse.error();
        }
        return HttpResponse.json({ success: true });
      })
    );

    const response = await apiClient.get('/test');
    expect(response.data).toEqual({ success: true });
    expect(attempts).toBe(3);
  });

  it('should cache responses', async () => {
    const mockData = { id: 1, name: 'Test' };
    server.use(
      http.get('*/api/test', () => {
        return HttpResponse.json(mockData);
      })
    );

    const response1 = await apiClient.get('/test');
    const response2 = await apiClient.get('/test');

    expect(response1.data).toEqual(mockData);
    expect(response2.data).toEqual(mockData);
    // Verify it came from cache
    expect(server.events.length).toBe(1);
  });

  it('should handle authentication', async () => {
    const mockToken = 'test-token';
    server.use(
      http.get('*/api/auth', ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth !== `Bearer ${mockToken}`) {
          return new HttpResponse(null, { status: 401 });
        }
        return HttpResponse.json({ authenticated: true });
      })
    );

    apiClient.setToken(mockToken);
    const response = await apiClient.get('/auth');
    expect(response.data).toEqual({ authenticated: true });
  });
});

## React Hooks Layer

### API Hooks
Each service has corresponding React hooks for easy integration:

```typescript
// Example hook implementation
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    login,
    // ... other auth methods
  };
};
```

### Hook Features
- Loading state management
- Error handling
- Automatic retries
- Cache integration
- Optimistic updates
- Request cancellation
- Offline support

## Monitoring & Analytics

### Request Tracking
```typescript
interface RequestMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: string;
  cached: boolean;
  retries: number;
}

class MetricsCollector {
  private metrics: RequestMetrics[] = [];

  trackRequest(metric: RequestMetrics) {
    this.metrics.push(metric);
    // Send to analytics service
  }

  getAverageResponseTime(endpoint: string): number {
    const endpointMetrics = this.metrics.filter(m => m.endpoint === endpoint);
    return endpointMetrics.reduce((acc, m) => acc + m.duration, 0) / endpointMetrics.length;
  }

  getErrorRate(): number {
    const totalRequests = this.metrics.length;
    const errorRequests = this.metrics.filter(m => m.status >= 400).length;
    return (errorRequests / totalRequests) * 100;
  }
}
```

### Performance Monitoring
- Response time tracking
- Error rate monitoring
- Cache hit ratio
- Network usage
- Memory consumption

### Error Tracking
- Error categorization
- Stack trace collection
- User context
- Device information
- Network conditions

## Migration Strategy

### Steps
1. Create new API infrastructure
2. Gradually migrate existing services
3. Update components to use new services
4. Remove old implementation

### Rollback Plan
- Maintain compatibility layer
- Feature flags for new implementation
- Monitoring for issues
- Rollback procedures 