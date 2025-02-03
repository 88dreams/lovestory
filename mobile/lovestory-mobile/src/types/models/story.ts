import { BaseModel, OwnedModel, SoftDeleteModel } from './base';

/**
 * Story template status
 */
export enum TemplateStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Story template visibility
 */
export enum TemplateVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  UNLISTED = 'UNLISTED',
}

/**
 * Story step type
 */
export enum StoryStepType {
  VIDEO = 'VIDEO',
  TRANSITION = 'TRANSITION',
}

/**
 * Story step requirements
 */
export interface StepRequirements {
  minDuration: number;
  maxDuration: number;
  allowedTransitions?: string[];
  requiredElements?: string[];
  description?: string;
}

/**
 * Story template step
 */
export interface StoryStep extends BaseModel {
  templateId: string;
  order: number;
  type: StoryStepType;
  title: string;
  description: string;
  requirements: StepRequirements;
  isOptional: boolean;
}

/**
 * Story template model
 */
export interface StoryTemplate extends OwnedModel {
  title: string;
  description: string;
  coverImageUrl?: string;
  status: TemplateStatus;
  visibility: TemplateVisibility;
  steps: StoryStep[];
  tags: string[];
  category: string;
  estimatedDuration: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  requiredParticipants: number;
}

/**
 * Generated story status
 */
export enum GeneratedStoryStatus {
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

/**
 * Generated story segment
 */
export interface GeneratedStorySegment extends BaseModel {
  storyId: string;
  stepId: string;
  videoId: string;
  order: number;
  duration: number;
  transitionType?: string;
}

/**
 * Generated story model
 */
export interface GeneratedStory extends SoftDeleteModel {
  templateId: string;
  title: string;
  description?: string;
  status: GeneratedStoryStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  segments: GeneratedStorySegment[];
  errorMessage?: string;
  metadata: {
    resolution: string;
    format: string;
    size: number;
  };
}

/**
 * Story template creation request
 */
export interface CreateTemplateRequest {
  title: string;
  description: string;
  coverImageUrl?: string;
  visibility: TemplateVisibility;
  steps: Omit<StoryStep, 'id' | 'templateId' | 'createdAt' | 'updatedAt'>[];
  tags?: string[];
  category: string;
  requiredParticipants: number;
}

/**
 * Story template update request
 */
export interface UpdateTemplateRequest {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  status?: TemplateStatus;
  visibility?: TemplateVisibility;
  steps?: Partial<StoryStep>[];
  tags?: string[];
  category?: string;
  requiredParticipants?: number;
}

/**
 * Story generation request
 */
export interface GenerateStoryRequest {
  templateId: string;
  title: string;
  description?: string;
  segmentIds: string[]; // IDs of the video segments to use
} 