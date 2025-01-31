from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
import tempfile

from api.deps import get_db, get_current_user, get_current_admin_user
from models.base import User
from schemas.video import (
    PresignedUrlRequest,
    PresignedUrlResponse,
    VideoMetadata,
    VideoUploadComplete
)
from services.storage import StorageService
from services.video import VideoService

router = APIRouter()
storage_service = StorageService()

@router.post("/upload-url", response_model=PresignedUrlResponse)
async def get_upload_url(
    request: PresignedUrlRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a presigned URL for uploading a video"""
    if not request.content_type.startswith('video/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only video files are allowed"
        )

    # Generate a unique object key using user ID and timestamp
    object_key = f"videos/user_{current_user.id}/{request.filename}"
    
    # Generate presigned URL for upload
    upload_url, final_key = await storage_service.generate_presigned_url(
        object_key=object_key,
        expiration=3600,  # 1 hour
        operation='put_object'
    )

    # Generate a presigned URL for viewing (optional)
    download_url = await storage_service.get_download_url(final_key)

    return PresignedUrlResponse(
        upload_url=upload_url,
        download_url=download_url,
        object_key=final_key,
        expires_in=3600
    )

@router.post("/complete-upload")
async def complete_upload(
    upload_info: VideoUploadComplete,
    step_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Handle upload completion:
    1. Verify file exists in S3
    2. Process video in background
    3. Create video segment
    """
    video_service = VideoService(db)

    # Verify file exists
    if not await storage_service.check_file_exists(upload_info.object_key):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found"
        )

    # Process video in background
    background_tasks.add_task(
        video_service.process_video,
        upload_info.object_key,
        step_id,
        current_user.id
    )

    return {"message": "Video processing started"}

@router.get("/{object_key}/metadata", response_model=VideoMetadata)
async def get_video_metadata(
    object_key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get metadata for a video"""
    # Verify the video exists
    if not await storage_service.check_file_exists(object_key):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    # Get basic metadata
    size = await storage_service.get_file_size(object_key)
    if not size:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    # Get video metadata from temporary download
    video_service = VideoService(db)
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=True) as temp_file:
        storage_service.s3_client.download_file(
            storage_service.bucket_name,
            object_key,
            temp_file.name
        )
        metadata = await video_service.validate_video(temp_file.name)

    return VideoMetadata(
        object_key=object_key,
        size=size,
        **metadata
    )

@router.delete("/{object_key}")
async def delete_video(
    object_key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a video and its segment record"""
    # Verify ownership (videos should be in user's directory)
    if not object_key.startswith(f"videos/user_{current_user.id}/"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this video"
        )

    # Delete from S3 and database
    video_service = VideoService(db)
    segment = db.query(VideoSegment).filter(VideoSegment.storage_path == object_key).first()
    if segment:
        await video_service.delete_video_segment(segment.id)
    else:
        await storage_service.delete_file(object_key)

    return {"message": "Video deleted successfully"}

@router.get("/{object_key}/view-url")
async def get_video_view_url(
    object_key: str,
    current_user: User = Depends(get_current_user)
):
    """Get a presigned URL for viewing a video"""
    # Verify the video exists
    if not await storage_service.check_file_exists(object_key):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    # Generate a presigned URL for viewing
    url = await storage_service.get_download_url(object_key)
    return {"url": url}

# Admin endpoints
@router.put("/segments/{segment_id}/approve", dependencies=[Depends(get_current_admin_user)])
async def approve_video_segment(
    segment_id: int,
    is_approved: bool,
    approval_notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Approve or reject a video segment (admin only)"""
    video_service = VideoService(db)
    segment = await video_service.update_video_segment(
        segment_id,
        is_approved,
        approval_notes
    )
    return segment 