from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl, constr

class StoryGenerationRequest(BaseModel):
    """Schema for requesting story generation"""
    template_id: int
    title: constr(min_length=1, max_length=200)
    description: Optional[str] = None
    preferred_resolution: Optional[str] = "1080p"  # 720p, 1080p
    transition_type: Optional[str] = "fade"  # fade, dissolve, cut
    transition_duration: Optional[float] = 1.0  # seconds

class StorySegmentInfo(BaseModel):
    """Schema for story segment information"""
    step_id: int
    video_segment_id: int
    order: int
    transition_type: Optional[str] = None
    transition_duration: Optional[float] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    volume_adjustment: Optional[float] = 1.0

class GeneratedStoryMetadata(BaseModel):
    """Schema for generated story metadata"""
    width: Optional[int] = None
    height: Optional[int] = None
    fps: Optional[float] = None
    duration: Optional[float] = None
    quality_variants: Optional[Dict[str, Dict[str, Any]]] = None
    generation_metadata: Optional[Dict[str, Any]] = None

class GeneratedStoryResponse(BaseModel):
    """Schema for generated story response"""
    id: int
    template_id: int
    user_id: int
    title: str
    description: Optional[str] = None
    storage_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    view_count: int = 0
    like_count: int = 0
    share_count: int = 0
    metadata: GeneratedStoryMetadata
    segments: List[StorySegmentInfo]
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config"""
        from_attributes = True

class GeneratedStoryList(BaseModel):
    """Schema for list of generated stories"""
    total: int
    page: int
    size: int
    items: List[GeneratedStoryResponse]

class StoryGenerationStatus(BaseModel):
    """Schema for story generation status update"""
    status: str
    progress: Optional[float] = None  # 0 to 1
    current_step: Optional[str] = None
    error_message: Optional[str] = None
    estimated_time_remaining: Optional[int] = None  # seconds 