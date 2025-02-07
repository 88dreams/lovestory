import {
  User,
  UserRole,
  UserStatus,
  StoryTemplate as Template,
  TemplateStatus,
  TemplateVisibility,
  StoryStep as TemplateStep,
  StoryStepType,
  VideoSegment,
  VideoStatus,
  Video,
} from '../../types/models';

/**
 * Create a mock user
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  isEmailVerified: true,
  profile: {
    id: 'profile-123',
    displayName: 'Test User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Create a mock story step
 */
export const createMockStoryStep = (overrides: Partial<TemplateStep> = {}): TemplateStep => ({
  id: 'step-123',
  templateId: 'template-123',
  order: 1,
  type: StoryStepType.VIDEO,
  title: 'Test Step',
  description: 'A test step',
  requirements: {
    minDuration: 5,
    maxDuration: 15,
  },
  isOptional: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Create a mock story template
 */
export const createMockTemplate = (overrides: Partial<Template> = {}): Template => ({
  id: 'template-1',
  title: 'Birthday Celebration',
  description: 'Perfect for birthday celebrations',
  status: TemplateStatus.PUBLISHED,
  visibility: TemplateVisibility.PUBLIC,
  steps: [
    {
      id: 'step-1',
      title: 'Opening',
      description: 'Start with a greeting',
      order: 1,
      type: StoryStepType.VIDEO,
      requirements: {
        minDuration: 5,
        maxDuration: 15,
      },
      isOptional: false,
      templateId: 'template-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  tags: ['birthday', 'celebration'],
  category: 'celebrations',
  estimatedDuration: 60,
  difficulty: 'EASY',
  requiredParticipants: 1,
  userId: 'user-123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Create a mock video segment
 */
export const createMockVideoSegment = (overrides: Partial<VideoSegment> = {}): VideoSegment => ({
  id: 'video-123',
  userId: 'user-123',
  stepId: 'step-123',
  title: 'Test Video',
  description: 'A test video',
  status: VideoStatus.READY,
  url: 'https://example.com/video.mp4',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  metadata: {
    duration: 10,
    resolution: {
      width: 1920,
      height: 1080,
    },
    format: 'mp4',
    size: 1024 * 1024, // 1MB
    fps: 30,
    bitrate: 2000000,
    hasAudio: true,
  },
  processingProgress: 100,
  duration: 10,
  tags: ['test', 'video'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Create a mock API response
 */
export const createMockApiResponse = <T>(data: T, status = 200) => ({
  data,
  status,
  message: undefined,
});

/**
 * Create a mock API error
 */
export const createMockApiError = (code: string, message: string, status = 400) => ({
  code,
  message,
  status,
});

/**
 * Creates a mock video with default values that can be overridden
 */
export const createMockVideo = (overrides: Partial<Video> = {}): Video => ({
  id: 'video-123',
  status: VideoStatus.PROCESSING,
  processingProgress: 0,
  url: null,
  thumbnailUrl: null,
  duration: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Creates mock auth tokens
 */
export const createMockAuthTokens = (overrides: Partial<{ accessToken: string; refreshToken: string }> = {}) => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  ...overrides,
}); 