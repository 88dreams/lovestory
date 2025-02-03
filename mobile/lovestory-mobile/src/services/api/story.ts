import { ApiClient } from './client';
import { AbstractBaseService } from './factory';
import {
  CreateTemplateRequest,
  GenerateStoryRequest,
  GeneratedStory,
  StoryStep,
  StoryTemplate,
  UpdateTemplateRequest,
} from '../../types/models';
import { BaseQueryParams } from '../../types/api/common';

/**
 * Query parameters for story templates
 */
export interface TemplateQueryParams extends BaseQueryParams {
  status?: string;
  visibility?: string;
  category?: string;
  difficulty?: string;
  tags?: string[];
  userId?: string;
}

/**
 * Service for managing story templates
 */
export class TemplateService extends AbstractBaseService<StoryTemplate, TemplateQueryParams> {
  constructor(client: ApiClient) {
    super(client, '/templates');
  }

  /**
   * Get template steps
   */
  async getSteps(templateId: string): Promise<StoryStep[]> {
    const response = await this.client.get<StoryStep[]>(`${this.basePath}/${templateId}/steps`);
    return response.data;
  }

  /**
   * Update template steps
   */
  async updateSteps(templateId: string, steps: Partial<StoryStep>[]): Promise<StoryStep[]> {
    const response = await this.client.put<StoryStep[]>(`${this.basePath}/${templateId}/steps`, steps);
    return response.data;
  }

  /**
   * Create a new template
   */
  async createTemplate(data: CreateTemplateRequest): Promise<StoryTemplate> {
    const response = await this.client.post<StoryTemplate>(this.basePath, data);
    return response.data;
  }

  /**
   * Update a template
   */
  async updateTemplate(id: string, data: UpdateTemplateRequest): Promise<StoryTemplate> {
    const response = await this.client.put<StoryTemplate>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  /**
   * Get featured templates
   */
  async getFeatured(): Promise<StoryTemplate[]> {
    const response = await this.client.get<StoryTemplate[]>(`${this.basePath}/featured`);
    return response.data;
  }

  /**
   * Get popular templates
   */
  async getPopular(): Promise<StoryTemplate[]> {
    const response = await this.client.get<StoryTemplate[]>(`${this.basePath}/popular`);
    return response.data;
  }
}

/**
 * Query parameters for generated stories
 */
export interface StoryQueryParams extends BaseQueryParams {
  status?: string;
  templateId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Service for managing generated stories
 */
export class StoryService extends AbstractBaseService<GeneratedStory, StoryQueryParams> {
  constructor(client: ApiClient) {
    super(client, '/stories');
  }

  /**
   * Generate a new story
   */
  async generate(data: GenerateStoryRequest): Promise<GeneratedStory> {
    const response = await this.client.post<GeneratedStory>(`${this.basePath}/generate`, data);
    return response.data;
  }

  /**
   * Get story generation status
   */
  async getGenerationStatus(id: string): Promise<GeneratedStory> {
    const response = await this.client.get<GeneratedStory>(`${this.basePath}/${id}/status`);
    return response.data;
  }

  /**
   * Cancel story generation
   */
  async cancelGeneration(id: string): Promise<void> {
    await this.client.post(`${this.basePath}/${id}/cancel`);
  }

  /**
   * Share a generated story
   */
  async share(id: string): Promise<{ shareUrl: string }> {
    const response = await this.client.post<{ shareUrl: string }>(`${this.basePath}/${id}/share`);
    return response.data;
  }

  /**
   * Get user's recent stories
   */
  async getRecent(): Promise<GeneratedStory[]> {
    const response = await this.client.get<GeneratedStory[]>(`${this.basePath}/recent`);
    return response.data;
  }

  /**
   * Get stories by template
   */
  async getByTemplate(templateId: string): Promise<GeneratedStory[]> {
    const response = await this.client.get<GeneratedStory[]>(`${this.basePath}/by-template/${templateId}`);
    return response.data;
  }
} 