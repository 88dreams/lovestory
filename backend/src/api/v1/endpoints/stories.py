from typing import Optional
from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy.orm import Session

from api.deps import get_db, get_current_user
from models.base import User
from schemas.story import (
    StoryGenerationRequest,
    GeneratedStoryResponse,
    GeneratedStoryList,
    StoryGenerationStatus
)
from services.story_generation import StoryGenerationService

router = APIRouter()

@router.post("", response_model=GeneratedStoryResponse)
async def generate_story(
    request: StoryGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a new story from template.
    The story will be generated asynchronously in the background.
    """
    story_service = StoryGenerationService(db)
    return await story_service.generate_story(current_user.id, request)

@router.get("", response_model=GeneratedStoryList)
async def list_stories(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List generated stories with pagination"""
    story_service = StoryGenerationService(db)
    stories, total = await story_service.list_stories(user_id, skip, limit)
    return {
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "items": stories
    }

@router.get("/{story_id}", response_model=GeneratedStoryResponse)
async def get_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific generated story"""
    story_service = StoryGenerationService(db)
    return await story_service.get_story(story_id, current_user.id)

@router.delete("/{story_id}")
async def delete_story(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a generated story"""
    story_service = StoryGenerationService(db)
    await story_service.delete_story(story_id, current_user.id)
    return {"message": "Story deleted successfully"} 