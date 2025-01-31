"""Video management endpoints"""
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import tempfile

from api.deps import get_db, get_current_user, get_current_admin_user
from models.base import User
from schemas.video import (
    PresignedUrlRequest,
    PresignedUrlResponse,
    VideoMetadata,
    VideoUploadComplete,
    VideoSegment,
    VideoSegmentUpdate
)
from services.storage import StorageService
from services.video import VideoService
from services.s3 import S3Service

router = APIRouter()
storage_service = StorageService()

@router.post("/upload-url", response_model=PresignedUrlResponse)
async def get_upload_url(
    request: PresignedUrlRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> PresignedUrlResponse:
    """
    Get a presigned URL for video upload.
    
    Generates a presigned URL that can be used to upload a video file directly to S3.
    
    Args:
        * **filename**: Required. Original filename of the video
        * **content_type**: Required. MIME type of the video (must be a valid video type)
    
    Returns:
        * **upload_url**: Presigned URL for uploading the video
        * **download_url**: URL for downloading the video once uploaded
        * **object_key**: Unique identifier for the video in storage
        * **expires_in**: Number of seconds until the upload URL expires
    
    Raises:
        * **400**: Invalid content type
        * **401**: Not authenticated
        * **422**: Validation error
    """
    s3_service = S3Service()
    return await s3_service.generate_presigned_url(request, current_user.id)

@router.post("/complete-upload", response_model=VideoSegment)
async def complete_upload(
    upload_data: VideoUploadComplete,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> VideoSegment:
    """
    Complete video upload process.
    
    Validates the uploaded video and processes it for use in stories.
    Must be called after successfully uploading a video using the presigned URL.
    
    Args:
        * **object_key**: Required. Object key returned from upload-url endpoint
        * **success**: Required. Whether the upload was successful
        * **error_message**: Optional. Error message if upload failed
    
    Returns:
        VideoSegment object containing:
        * **id**: Unique identifier for the video segment
        * **user_id**: ID of the user who uploaded the video
        * **object_key**: S3 object key
        * **duration**: Video duration in seconds
        * **size**: File size in bytes
        * **status**: Processing status
        * **metadata**: Additional video metadata
    
    Raises:
        * **400**: Invalid video format or failed upload
        * **401**: Not authenticated
        * **404**: Video not found in storage
        * **422**: Validation error
    """
    video_service = VideoService(db)
    return await video_service.process_upload(upload_data, current_user.id, background_tasks)

@router.get("/{object_key}/metadata", response_model=VideoMetadata)
async def get_video_metadata(
    object_key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> VideoMetadata:
    """
    Get video metadata.
    
    Retrieves metadata for a previously uploaded video.
    
    Args:
        * **object_key**: Required. Unique identifier for the video in storage
    
    Returns:
        * **object_key**: S3 object key
        * **size**: File size in bytes
        * **content_type**: MIME type of the video
        * **duration**: Video duration in seconds
        * **width**: Video width in pixels
        * **height**: Video height in pixels
    
    Raises:
        * **401**: Not authenticated
        * **403**: Not authorized to access this video
        * **404**: Video not found
    """
    video_service = VideoService(db)
    return await video_service.get_metadata(object_key, current_user.id)

@router.delete("/{object_key}")
async def delete_video(
    object_key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a video.
    
    Permanently removes a video and its associated data.
    
    Args:
        * **object_key**: Required. Unique identifier for the video in storage
    
    Returns:
        * **status**: "success" if deletion was successful
    
    Raises:
        * **401**: Not authenticated
        * **403**: Not authorized to delete this video
        * **404**: Video not found
    """
    video_service = VideoService(db)
    await video_service.delete_video(object_key, current_user.id)
    return {"status": "success"}

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
async def approve_segment(
    segment_id: int,
    update: VideoSegmentUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Approve or reject a video segment.
    
    Admin only endpoint for moderating uploaded video segments.
    
    Args:
        * **segment_id**: Required. ID of the video segment
        * **status**: Required. New status ("approved" or "rejected")
        * **rejection_reason**: Optional. Required if status is "rejected"
    
    Returns:
        * **status**: "success" if update was successful
    
    Raises:
        * **401**: Not authenticated
        * **403**: Not an admin
        * **404**: Segment not found
        * **422**: Invalid status or missing rejection reason
    """
    video_service = VideoService(db)
    await video_service.update_segment_status(segment_id, update)
    return {"status": "success"} 