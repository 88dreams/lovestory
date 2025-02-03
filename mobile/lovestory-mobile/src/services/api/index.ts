export * from './client';
export * from './factory';
export * from './auth';
export * from './story';
export * from './video';

import { ApiServiceFactory } from './factory';
import { AuthService } from './auth';
import { StoryService, TemplateService } from './story';
import { VideoService } from './video';

// Create and export service instances
const factory = ApiServiceFactory.getInstance();

export const authService = factory.getService(AuthService);
export const storyService = factory.getService(StoryService);
export const templateService = factory.getService(TemplateService);
export const videoService = factory.getService(VideoService); 