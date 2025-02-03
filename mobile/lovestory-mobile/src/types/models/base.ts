/**
 * Base model interface with common fields
 */
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Base model with soft delete
 */
export interface SoftDeleteModel extends BaseModel {
  deletedAt?: string;
}

/**
 * Base model with user ownership
 */
export interface OwnedModel extends BaseModel {
  userId: string;
} 