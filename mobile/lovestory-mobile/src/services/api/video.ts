import { ApiClient } from './client';
import { AbstractBaseService } from './factory';
import {
  ProcessVideoRequest,
  UpdateVideoRequest,
  VideoQueryParams,
  VideoSegment,
  VideoUploadCompletionRequest,
  VideoUploadRequest,
  VideoUploadResponse,
} from '../../types/models';

/**
 * Service for managing video segments and processing
 */
export class VideoService extends AbstractBaseService<VideoSegment, VideoQueryParams> {
  constructor(client: ApiClient) {
    super(client, '/videos');
  }

  /**
   * Get upload URL for a new video
   */
  async getUploadUrl(data: VideoUploadRequest): Promise<VideoUploadResponse> {
    const response = await this.client.post<VideoUploadResponse>(`${this.basePath}/upload-url`, data);
    return response.data;
  }

  /**
   * Complete video upload and start processing
   */
  async completeUpload(data: VideoUploadCompletionRequest): Promise<VideoSegment> {
    const response = await this.client.post<VideoSegment>(`${this.basePath}/complete-upload`, data);
    return response.data;
  }

  /**
   * Update video metadata
   */
  async updateMetadata(id: string, data: UpdateVideoRequest): Promise<VideoSegment> {
    const response = await this.client.patch<VideoSegment>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  /**
   * Start video processing with options
   */
  async startProcessing(data: ProcessVideoRequest): Promise<VideoSegment> {
    const response = await this.client.post<VideoSegment>(`${this.basePath}/process`, data);
    return response.data;
  }

  /**
   * Get video processing status
   */
  async getProcessingStatus(id: string): Promise<VideoSegment> {
    const response = await this.client.get<VideoSegment>(`${this.basePath}/${id}/status`);
    return response.data;
  }

  /**
   * Cancel video processing
   */
  async cancelProcessing(id: string): Promise<void> {
    await this.client.post(`${this.basePath}/${id}/cancel`);
  }

  /**
   * Get videos by step
   */
  async getByStep(stepId: string): Promise<VideoSegment[]> {
    const response = await this.client.get<VideoSegment[]>(`${this.basePath}/by-step/${stepId}`);
    return response.data;
  }

  /**
   * Get user's recent videos
   */
  async getRecent(): Promise<VideoSegment[]> {
    const response = await this.client.get<VideoSegment[]>(`${this.basePath}/recent`);
    return response.data;
  }

  /**
   * Generate video thumbnail
   */
  async generateThumbnail(id: string, timeInSeconds: number): Promise<{ thumbnailUrl: string }> {
    const response = await this.client.post<{ thumbnailUrl: string }>(
      `${this.basePath}/${id}/thumbnail`,
      { timeInSeconds }
    );
    return response.data;
  }

  /**
   * Get signed URL for video playback
   */
  async getPlaybackUrl(id: string): Promise<{ url: string; expiresAt: string }> {
    const response = await this.client.get<{ url: string; expiresAt: string }>(
      `${this.basePath}/${id}/playback-url`
    );
    return response.data;
  }
} 