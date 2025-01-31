import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime
import tempfile
import asyncio
from moviepy.editor import VideoFileClip
import magic
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.story import VideoSegment
from services.storage import StorageService
from config.settings import settings

logger = logging.getLogger(__name__)

class VideoService:
    """Service for handling video processing operations"""

    def __init__(self, db: Session):
        self.db = db
        self.storage_service = StorageService()

    async def validate_video(self, file_path: str) -> Dict[str, Any]:
        """
        Validate video file and extract metadata.
        Returns dict with metadata if valid, raises HTTPException if invalid.
        """
        try:
            # Check file type
            mime_type = magic.from_file(file_path, mime=True)
            if mime_type not in settings.ALLOWED_VIDEO_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file type. Allowed types: {settings.ALLOWED_VIDEO_TYPES}"
                )

            # Get video metadata
            with VideoFileClip(file_path) as video:
                duration = video.duration
                width = int(video.size[0])
                height = int(video.size[1])

                # Check duration
                if duration > settings.MAX_VIDEO_DURATION:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Video duration exceeds maximum of {settings.MAX_VIDEO_DURATION} seconds"
                    )

                return {
                    "duration": duration,
                    "width": width,
                    "height": height,
                    "content_type": mime_type
                }

        except Exception as e:
            logger.error(f"Error validating video: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid video file"
            )

    async def process_video(
        self,
        object_key: str,
        step_id: int,
        user_id: int
    ) -> VideoSegment:
        """
        Process uploaded video:
        1. Download from S3
        2. Validate and extract metadata
        3. Create video segment record
        """
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_file:
                # Download file from S3
                self.storage_service.s3_client.download_file(
                    settings.AWS_BUCKET_NAME,
                    object_key,
                    temp_file.name
                )

                # Validate video and get metadata
                metadata = await self.validate_video(temp_file.name)

                # Create video segment
                video_segment = VideoSegment(
                    step_id=step_id,
                    user_id=user_id,
                    storage_path=object_key,
                    duration=metadata["duration"],
                    is_approved=False
                )

                self.db.add(video_segment)
                self.db.commit()
                self.db.refresh(video_segment)

                return video_segment

        except Exception as e:
            logger.error(f"Error processing video: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process video"
            )
        finally:
            # Clean up temporary file
            if 'temp_file' in locals():
                os.unlink(temp_file.name)

    async def get_video_segment(self, segment_id: int) -> Optional[VideoSegment]:
        """Get video segment by ID"""
        return self.db.query(VideoSegment).filter(VideoSegment.id == segment_id).first()

    async def update_video_segment(
        self,
        segment_id: int,
        is_approved: bool,
        approval_notes: Optional[str] = None
    ) -> VideoSegment:
        """Update video segment approval status"""
        segment = await self.get_video_segment(segment_id)
        if not segment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video segment not found"
            )

        segment.is_approved = is_approved
        segment.approval_notes = approval_notes
        self.db.commit()
        self.db.refresh(segment)
        return segment

    async def delete_video_segment(self, segment_id: int) -> bool:
        """Delete video segment and its associated file"""
        segment = await self.get_video_segment(segment_id)
        if not segment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video segment not found"
            )

        # Delete file from S3
        await self.storage_service.delete_file(segment.storage_path)

        # Delete segment record
        self.db.delete(segment)
        self.db.commit()
        return True 