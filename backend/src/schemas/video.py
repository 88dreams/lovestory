from typing import Optional
from pydantic import BaseModel, Field, HttpUrl

class PresignedUrlRequest(BaseModel):
    """Request schema for getting a presigned URL"""
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(..., regex='^video/')  # Ensure it's a video mime type

class PresignedUrlResponse(BaseModel):
    """Response schema for presigned URL generation"""
    upload_url: HttpUrl
    download_url: Optional[HttpUrl] = None
    object_key: str
    expires_in: int = 3600

class VideoMetadata(BaseModel):
    """Video metadata schema"""
    object_key: str
    size: int
    content_type: str
    duration: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None

class VideoUploadComplete(BaseModel):
    """Schema for video upload completion notification"""
    object_key: str
    success: bool
    error_message: Optional[str] = None 