from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from api.deps import get_db, get_current_user, get_current_admin_user
from models.base import User
from schemas.template import (
    StoryTemplateCreate,
    StoryTemplateUpdate,
    StoryTemplateResponse,
    StoryStepUpdate,
    StoryStepResponse,
    TemplateList
)
from services.template import TemplateService

router = APIRouter()

@router.post("", response_model=StoryTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template: StoryTemplateCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)  # Only admins can create templates
):
    """Create a new story template"""
    template_service = TemplateService(db)
    return await template_service.create_template(template)

@router.get("", response_model=TemplateList)
async def list_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    active_only: bool = False,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """List story templates with pagination"""
    template_service = TemplateService(db)
    templates = await template_service.list_templates(skip, limit, active_only)
    total = len(templates)  # In a real app, you'd want to do a separate count query
    return {
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "items": templates
    }

@router.get("/{template_id}", response_model=StoryTemplateResponse)
async def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Get a specific story template"""
    template_service = TemplateService(db)
    template = await template_service.get_template(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return template

@router.put("/{template_id}", response_model=StoryTemplateResponse)
async def update_template(
    template_id: int,
    template_update: StoryTemplateUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)  # Only admins can update templates
):
    """Update a story template"""
    template_service = TemplateService(db)
    return await template_service.update_template(template_id, template_update)

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)  # Only admins can delete templates
):
    """Delete a story template"""
    template_service = TemplateService(db)
    await template_service.delete_template(template_id)
    return None

@router.get("/{template_id}/steps/{step_order}", response_model=StoryStepResponse)
async def get_template_step(
    template_id: int,
    step_order: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Get a specific step from a template"""
    template_service = TemplateService(db)
    step = await template_service.get_template_step(template_id, step_order)
    if not step:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Step not found"
        )
    return step

@router.put("/{template_id}/steps/{step_id}", response_model=StoryStepResponse)
async def update_template_step(
    template_id: int,
    step_id: int,
    step_update: StoryStepUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)  # Only admins can update steps
):
    """Update a specific step in a template"""
    template_service = TemplateService(db)
    
    # Verify template exists
    template = await template_service.get_template(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return await template_service.update_step(step_id, step_update) 