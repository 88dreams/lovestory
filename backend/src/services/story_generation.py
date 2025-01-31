import os
import logging
import random
import tempfile
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from moviepy.editor import VideoFileClip, concatenate_videoclips, vfx
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from models.story import (
    StoryTemplate,
    StoryStep,
    VideoSegment,
    GeneratedStory,
    GeneratedStorySegment
)
from schemas.story import StoryGenerationRequest, StoryGenerationStatus
from services.storage import StorageService
from services.video import VideoService
from config.settings import settings

logger = logging.getLogger(__name__)

class StoryGenerationService:
    """Service for handling story generation operations"""

    def __init__(self, db: Session):
        self.db = db
        self.storage_service = StorageService()
        self.video_service = VideoService(db)

    async def _select_random_segment(
        self,
        step_id: int,
        excluded_user_ids: Optional[List[int]] = None
    ) -> VideoSegment:
        """Select a random approved video segment for a step"""
        query = self.db.query(VideoSegment).filter(
            and_(
                VideoSegment.step_id == step_id,
                VideoSegment.is_approved == True,
                VideoSegment.processing_status == 'completed'
            )
        )

        if excluded_user_ids:
            query = query.filter(VideoSegment.user_id.notin_(excluded_user_ids))

        segments = query.all()
        if not segments:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No approved video segments available for step {step_id}"
            )

        return random.choice(segments)

    async def _apply_transition(
        self,
        clip: VideoFileClip,
        transition_type: str,
        transition_duration: float
    ) -> VideoFileClip:
        """Apply transition effect to video clip"""
        if transition_type == "fade":
            clip = clip.fadein(transition_duration).fadeout(transition_duration)
        elif transition_type == "dissolve":
            # Implement dissolve transition
            pass
        # Add more transition types as needed
        return clip

    async def _concatenate_videos(
        self,
        segments: List[GeneratedStorySegment],
        preferred_resolution: str
    ) -> Tuple[str, Dict[str, Any]]:
        """Concatenate video segments into final story"""
        try:
            clips = []
            target_height = 1080 if preferred_resolution == "1080p" else 720

            with tempfile.TemporaryDirectory() as temp_dir:
                # Download and process each segment
                for segment in segments:
                    # Download video
                    temp_path = os.path.join(temp_dir, f"segment_{segment.order}.mp4")
                    self.storage_service.s3_client.download_file(
                        settings.AWS_BUCKET_NAME,
                        segment.video_segment.storage_path,
                        temp_path
                    )

                    # Load and process clip
                    clip = VideoFileClip(temp_path)
                    
                    # Apply customizations
                    if segment.start_time is not None and segment.end_time is not None:
                        clip = clip.subclip(segment.start_time, segment.end_time)
                    
                    # Resize if needed
                    if clip.h != target_height:
                        clip = clip.resize(height=target_height)
                    
                    # Apply volume adjustment
                    if segment.volume_adjustment != 1.0:
                        clip = clip.volumex(segment.volume_adjustment)
                    
                    # Apply transitions
                    if segment.transition_type and segment.transition_duration:
                        clip = await self._apply_transition(
                            clip,
                            segment.transition_type,
                            segment.transition_duration
                        )
                    
                    clips.append(clip)

                # Concatenate all clips
                final_clip = concatenate_videoclips(clips, method="compose")
                
                # Generate output path
                output_filename = f"story_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.mp4"
                output_path = os.path.join(temp_dir, output_filename)
                
                # Write final video
                final_clip.write_videofile(
                    output_path,
                    codec='libx264',
                    audio_codec='aac',
                    temp_audiofile='temp-audio.m4a',
                    remove_temp=True
                )

                # Extract metadata
                metadata = {
                    "duration": final_clip.duration,
                    "width": final_clip.w,
                    "height": final_clip.h,
                    "fps": final_clip.fps
                }

                # Upload to S3
                s3_path = f"generated_stories/{output_filename}"
                with open(output_path, 'rb') as video_file:
                    self.storage_service.s3_client.upload_fileobj(
                        video_file,
                        settings.AWS_BUCKET_NAME,
                        s3_path,
                        ExtraArgs={'ContentType': 'video/mp4'}
                    )

                # Generate thumbnail
                thumbnail_data = await self.video_service.generate_thumbnail(output_path)
                thumbnail_key = f"{s3_path}_thumb.jpg"
                self.storage_service.s3_client.put_object(
                    Bucket=settings.AWS_BUCKET_NAME,
                    Key=thumbnail_key,
                    Body=thumbnail_data,
                    ContentType='image/jpeg'
                )

                # Clean up
                for clip in clips:
                    clip.close()
                final_clip.close()

                return s3_path, metadata

        except Exception as e:
            logger.error(f"Error concatenating videos: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate story video"
            )

    async def generate_story(
        self,
        user_id: int,
        request: StoryGenerationRequest
    ) -> GeneratedStory:
        """Generate a new story from template"""
        # Get template and validate
        template = self.db.query(StoryTemplate).filter(
            and_(
                StoryTemplate.id == request.template_id,
                StoryTemplate.is_active == True
            )
        ).first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found or inactive"
            )

        try:
            # Create story record
            story = GeneratedStory(
                template_id=template.id,
                user_id=user_id,
                title=request.title,
                description=request.description,
                status='processing'
            )
            self.db.add(story)
            self.db.flush()

            # Select random segments for each step
            segments = []
            excluded_user_ids = [user_id]  # Optionally exclude user's own videos
            
            for step in sorted(template.steps, key=lambda x: x.order):
                video_segment = await self._select_random_segment(step.id, excluded_user_ids)
                
                segment = GeneratedStorySegment(
                    story_id=story.id,
                    step_id=step.id,
                    video_segment_id=video_segment.id,
                    order=step.order,
                    transition_type=request.transition_type,
                    transition_duration=request.transition_duration
                )
                self.db.add(segment)
                segments.append(segment)
            
            self.db.flush()

            # Concatenate videos
            storage_path, metadata = await self._concatenate_videos(
                segments,
                request.preferred_resolution
            )

            # Update story with final data
            story.storage_path = storage_path
            story.thumbnail_path = f"{storage_path}_thumb.jpg"
            story.duration = metadata["duration"]
            story.width = metadata["width"]
            story.height = metadata["height"]
            story.fps = metadata["fps"]
            story.status = 'completed'
            story.generation_metadata = {
                "resolution": request.preferred_resolution,
                "transition_type": request.transition_type,
                "transition_duration": request.transition_duration,
                "generation_time": datetime.utcnow().isoformat()
            }

            self.db.commit()
            self.db.refresh(story)
            return story

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error generating story: {str(e)}")
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate story"
            )

    async def get_story(self, story_id: int, user_id: int) -> GeneratedStory:
        """Get a generated story by ID"""
        story = self.db.query(GeneratedStory).filter(
            GeneratedStory.id == story_id
        ).first()

        if not story:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Story not found"
            )

        # Increment view count
        story.view_count += 1
        self.db.commit()

        return story

    async def list_stories(
        self,
        user_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 10
    ) -> Tuple[List[GeneratedStory], int]:
        """List generated stories with optional filtering"""
        query = self.db.query(GeneratedStory)
        if user_id:
            query = query.filter(GeneratedStory.user_id == user_id)
        
        total = query.count()
        stories = query.order_by(GeneratedStory.created_at.desc()).offset(skip).limit(limit).all()
        
        return stories, total

    async def delete_story(self, story_id: int, user_id: int) -> bool:
        """Delete a generated story"""
        story = self.db.query(GeneratedStory).filter(
            and_(
                GeneratedStory.id == story_id,
                GeneratedStory.user_id == user_id
            )
        ).first()

        if not story:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Story not found"
            )

        try:
            # Delete video and thumbnail from S3
            if story.storage_path:
                await self.storage_service.delete_file(story.storage_path)
            if story.thumbnail_path:
                await self.storage_service.delete_file(story.thumbnail_path)

            # Delete from database
            self.db.delete(story)
            self.db.commit()
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting story: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete story"
            ) 