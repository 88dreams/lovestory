import { ApiClient } from './client';
import { ApiClientConfig, BaseQueryParams } from '../../types/api/common';

/**
 * Base service interface that all API services should implement
 */
export interface BaseService<T, Q extends BaseQueryParams = BaseQueryParams> {
  get(id: string): Promise<T>;
  list(params?: Q): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

/**
 * Abstract base service class that provides common CRUD operations
 */
export abstract class AbstractBaseService<T, Q extends BaseQueryParams = BaseQueryParams> implements BaseService<T, Q> {
  protected constructor(
    protected readonly client: ApiClient,
    protected readonly basePath: string
  ) {}

  /**
   * Get a single resource by ID
   */
  async get(id: string): Promise<T> {
    const response = await this.client.get<T>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * List resources with optional query parameters
   */
  async list(params?: Q): Promise<T[]> {
    const response = await this.client.get<T[]>(this.basePath, { params });
    return response.data;
  }

  /**
   * Create a new resource
   */
  async create(data: Partial<T>): Promise<T> {
    const response = await this.client.post<T>(this.basePath, data);
    return response.data;
  }

  /**
   * Update an existing resource
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await this.client.put<T>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  /**
   * Delete a resource
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`${this.basePath}/${id}`);
  }
}

/**
 * API Service Factory for creating and managing service instances
 */
export class ApiServiceFactory {
  private static instance: ApiServiceFactory;
  private readonly client: ApiClient;
  private readonly services: Map<string, BaseService<any>> = new Map();

  private constructor(config?: Partial<ApiClientConfig>) {
    this.client = new ApiClient(config);
  }

  /**
   * Get the singleton instance of the service factory
   */
  static getInstance(config?: Partial<ApiClientConfig>): ApiServiceFactory {
    if (!ApiServiceFactory.instance) {
      ApiServiceFactory.instance = new ApiServiceFactory(config);
    }
    return ApiServiceFactory.instance;
  }

  /**
   * Get or create a service instance
   */
  getService<T, Q extends BaseQueryParams = BaseQueryParams>(
    ServiceClass: new (client: ApiClient) => BaseService<T, Q>
  ): BaseService<T, Q> {
    const serviceName = ServiceClass.name;
    
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, new ServiceClass(this.client));
    }

    return this.services.get(serviceName) as BaseService<T, Q>;
  }

  /**
   * Clear all service instances
   */
  clearServices(): void {
    this.services.clear();
  }

  /**
   * Get the underlying API client
   */
  getClient(): ApiClient {
    return this.client;
  }
} 