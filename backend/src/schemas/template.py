from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, constr

class StoryStepBase(BaseModel):
    """Base schema for story step"""
    order: int = Field(..., ge=1)
    name: constr(min_length=1, max_length=100)
    description: Optional[str] = None
    duration_min: Optional[float] = Field(None, ge=0)
    duration_max: Optional[float] = Field(None, ge=0)

class StoryStepCreate(StoryStepBase):
    """Schema for creating a story step"""
    pass

class StoryStepUpdate(BaseModel):
    """Schema for updating a story step"""
    order: Optional[int] = Field(None, ge=1)
    name: Optional[constr(min_length=1, max_length=100)] = None
    description: Optional[str] = None
    duration_min: Optional[float] = Field(None, ge=0)
    duration_max: Optional[float] = Field(None, ge=0)

class StoryStepResponse(StoryStepBase):
    """Schema for story step response"""
    id: int
    template_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config"""
        from_attributes = True

class StoryTemplateBase(BaseModel):
    """Base schema for story template"""
    name: constr(min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: bool = True

class StoryTemplateCreate(StoryTemplateBase):
    """Schema for creating a story template"""
    steps: List[StoryStepCreate]

class StoryTemplateUpdate(BaseModel):
    """Schema for updating a story template"""
    name: Optional[constr(min_length=1, max_length=100)] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    steps: Optional[List[StoryStepCreate]] = None

class StoryTemplateResponse(StoryTemplateBase):
    """Schema for story template response"""
    id: int
    created_at: datetime
    updated_at: datetime
    steps: List[StoryStepResponse]

    class Config:
        """Pydantic config"""
        from_attributes = True

class TemplateList(BaseModel):
    """Schema for template list response"""
    total: int
    page: int
    size: int
    items: List[StoryTemplateResponse] 