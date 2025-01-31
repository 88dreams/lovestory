from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean, Text
from sqlalchemy.orm import relationship
from .base import BaseModel

class StoryTemplate(BaseModel):
    """Defines the structure of a story with its sequential steps."""
    
    __tablename__ = "story_templates"

    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    
    steps = relationship("StoryStep", back_populates="template", cascade="all, delete-orphan")

class StoryStep(BaseModel):
    """Represents a single step in a story template."""
    
    __tablename__ = "story_steps"

    template_id = Column(Integer, ForeignKey("story_templates.id"), nullable=False)
    order = Column(Integer, nullable=False)  # Position in the sequence
    name = Column(String(100), nullable=False)
    description = Column(Text)
    duration_min = Column(Float)  # Minimum duration in seconds
    duration_max = Column(Float)  # Maximum duration in seconds
    
    template = relationship("StoryTemplate", back_populates="steps")
    video_segments = relationship("VideoSegment", back_populates="step")

class VideoSegment(BaseModel):
    """Represents a user-submitted video segment for a specific story step."""
    
    __tablename__ = "video_segments"

    step_id = Column(Integer, ForeignKey("story_steps.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    storage_path = Column(String(255), nullable=False)  # S3 path
    duration = Column(Float, nullable=False)  # Duration in seconds
    is_approved = Column(Boolean, default=False)
    approval_notes = Column(Text)
    
    step = relationship("StoryStep", back_populates="video_segments")
    user = relationship("User", back_populates="video_segments")

class User(BaseModel):
    """Represents a user of the application."""
    
    __tablename__ = "users"

    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    
    # Profile fields
    bio = Column(Text)
    avatar_url = Column(String(255))
    display_name = Column(String(50))
    website = Column(String(200))
    location = Column(String(100))
    
    video_segments = relationship("VideoSegment", back_populates="user")

class GeneratedStory(BaseModel):
    """Represents a complete story generated from random video segments."""
    
    __tablename__ = "generated_stories"

    template_id = Column(Integer, ForeignKey("story_templates.id"), nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    final_video_path = Column(String(255))  # S3 path to concatenated video
    is_processing = Column(Boolean, default=True)
    processing_error = Column(Text)
    
    template = relationship("StoryTemplate")
    creator = relationship("User")
    segments = relationship("GeneratedStorySegment", back_populates="story")

class GeneratedStorySegment(BaseModel):
    """Represents a video segment used in a generated story."""
    
    __tablename__ = "generated_story_segments"

    story_id = Column(Integer, ForeignKey("generated_stories.id"), nullable=False)
    video_segment_id = Column(Integer, ForeignKey("video_segments.id"), nullable=False)
    order = Column(Integer, nullable=False)
    
    story = relationship("GeneratedStory", back_populates="segments")
    video_segment = relationship("VideoSegment") 