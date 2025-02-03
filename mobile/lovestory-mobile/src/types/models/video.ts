import { OwnedModel } from './base';

/**
 * Video processing status
 */
export enum VideoStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

/**
 * Video metadata
 */
export interface VideoMetadata {
  duration: number;
  resolution: {
    width: number;
    height: number;
  };
  format: string;
  size: number;
  fps: number;
  bitrate: number;
  hasAudio: boolean;
}

/**
 * Video segment model
 */
export interface VideoSegment extends OwnedModel {
  stepId: string;
  title?: string;
  description?: string;
  status: VideoStatus;
  url?: string;
  thumbnailUrl?: string;
  metadata: VideoMetadata;
  processingProgress?: number;
  errorMessage?: string;
  tags: string[];
}

/**
 * Video upload request
 */
export interface VideoUploadRequest {
  stepId: string;
  title?: string;
  description?: string;
  tags?: string[];
}

/**
 * Video upload response
 */
export interface VideoUploadResponse {
  uploadUrl: string;
  videoId: string;
  fields: Record<string, string>;
}

/**
 * Video upload completion request
 */
export interface VideoUploadCompletionRequest {
  videoId: string;
}

/**
 * Video update request
 */
export interface UpdateVideoRequest {
  title?: string;
  description?: string;
  tags?: string[];
}

/**
 * Video processing options
 */
export interface VideoProcessingOptions {
  targetResolution?: {
    width: number;
    height: number;
  };
  targetFormat?: string;
  targetBitrate?: number;
  shouldNormalizeLoudness?: boolean;
  shouldStabilize?: boolean;
}

/**
 * Video processing request
 */
export interface ProcessVideoRequest {
  videoId: string;
  options?: VideoProcessingOptions;
}

/**
 * Video query parameters
 */
export interface VideoQueryParams {
  status?: VideoStatus;
  stepId?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  search?: string;
} 