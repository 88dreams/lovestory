from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean, Text, ARRAY, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base, TimestampMixin

class StoryTemplate(Base, TimestampMixin):
    """Defines the structure of a story with its sequential steps."""
    
    __tablename__ = "story_templates"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    steps = relationship("StoryStep", back_populates="template", cascade="all, delete-orphan")
    generated_stories = relationship("GeneratedStory", back_populates="template")

class StoryStep(Base, TimestampMixin):
    """Represents a single step in a story template."""
    
    __tablename__ = "story_steps"

    id = Column(Integer, primary_key=True)
    template_id = Column(Integer, ForeignKey("story_templates.id"), nullable=False)
    order = Column(Integer, nullable=False)  # Position in the sequence
    name = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    duration_min = Column(Float, nullable=True)  # Minimum duration in seconds
    duration_max = Column(Float, nullable=True)  # Maximum duration in seconds
    
    template = relationship("StoryTemplate", back_populates="steps")
    video_segments = relationship("VideoSegment", back_populates="step")
    generated_segments = relationship("GeneratedStorySegment", back_populates="step")

class VideoSegment(Base, TimestampMixin):
    """Represents a user-submitted video segment for a specific story step."""
    
    __tablename__ = "video_segments"

    id = Column(Integer, primary_key=True)
    step_id = Column(Integer, ForeignKey("story_steps.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    storage_path = Column(String, nullable=False)  # S3 path
    thumbnail_path = Column(String, nullable=True)
    
    # Basic metadata
    duration = Column(Float, nullable=False)  # Duration in seconds
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    fps = Column(Float, nullable=True)
    content_type = Column(String, nullable=True)
    
    # Advanced metadata
    scene_changes = Column(ARRAY(Float), nullable=True)
    max_volume = Column(Float, nullable=True)
    mean_volume = Column(Float, nullable=True)
    moderation_labels = Column(JSONB, nullable=True)
    
    # Quality variants
    quality_variants = Column(JSONB, nullable=True, default={})
    
    # Status
    is_approved = Column(Boolean, default=False)
    approval_notes = Column(String, nullable=True)
    processing_status = Column(String, nullable=False, default='pending')
    processing_error = Column(String, nullable=True)
    
    step = relationship("StoryStep", back_populates="video_segments")
    user = relationship("User", back_populates="video_segments")
    used_in_stories = relationship("GeneratedStorySegment", back_populates="video_segment")

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

class GeneratedStory(Base, TimestampMixin):
    """Represents a complete story generated from random video segments."""
    
    __tablename__ = "generated_stories"

    id = Column(Integer, primary_key=True)
    template_id = Column(Integer, ForeignKey("story_templates.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(String, nullable=True)
    storage_path = Column(String, nullable=True)  # Path to concatenated video
    thumbnail_path = Column(String, nullable=True)
    duration = Column(Float, nullable=True)
    
    # Video metadata
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    fps = Column(Float, nullable=True)
    quality_variants = Column(JSONB, nullable=True, default={})
    
    # Generation status
    status = Column(String, nullable=False, default='pending')  # pending, processing, completed, failed
    error_message = Column(String, nullable=True)
    generation_metadata = Column(JSONB, nullable=True)  # Additional metadata about generation process
    
    # Stats
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)

    template = relationship("StoryTemplate", back_populates="generated_stories")
    user = relationship("User", back_populates="generated_stories")
    segments = relationship("GeneratedStorySegment", back_populates="story", order_by="GeneratedStorySegment.order")

class GeneratedStorySegment(Base, TimestampMixin):
    """Represents a video segment used in a generated story."""
    
    __tablename__ = "generated_story_segments"

    id = Column(Integer, primary_key=True)
    story_id = Column(Integer, ForeignKey("generated_stories.id"), nullable=False)
    step_id = Column(Integer, ForeignKey("story_steps.id"), nullable=False)
    video_segment_id = Column(Integer, ForeignKey("video_segments.id"), nullable=False)
    order = Column(Integer, nullable=False)
    
    # Transition metadata
    transition_type = Column(String, nullable=True)  # fade, dissolve, cut, etc.
    transition_duration = Column(Float, nullable=True)
    
    # Segment customization
    start_time = Column(Float, nullable=True)  # Start time in source video
    end_time = Column(Float, nullable=True)    # End time in source video
    volume_adjustment = Column(Float, default=1.0)  # Volume multiplier
    
    # Processing status
    processing_status = Column(String, nullable=False, default='pending')
    processing_error = Column(String, nullable=True)

    story = relationship("GeneratedStory", back_populates="segments")
    step = relationship("StoryStep", back_populates="generated_segments")
    video_segment = relationship("VideoSegment", back_populates="used_in_stories") 