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
    """
    Create a new story template.
    
    Admin only endpoint for creating story templates that users can use to create their stories.
    
    Args:
        * **title**: Required. Template title (3-100 characters)
        * **description**: Required. Template description
        * **category**: Required. Template category (e.g., "wedding", "anniversary")
        * **duration**: Required. Estimated duration in seconds
        * **steps**: Required. List of template steps, each containing:
            - title: Step title
            - description: Step description
            - duration: Step duration in seconds
            - required: Whether the step is required
            - position: Step order position
    
    Returns:
        Complete template object including:
        * **id**: Template ID
        * **title**: Template title
        * **description**: Template description
        * **category**: Template category
        * **duration**: Total duration
        * **created_at**: Creation timestamp
        * **updated_at**: Last update timestamp
        * **steps**: List of template steps
    
    Raises:
        * **401**: Not authenticated
        * **403**: Not an admin
        * **422**: Validation error
    """
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
    """
    List available story templates.
    
    Retrieves a paginated list of story templates, optionally filtered by category.
    
    Args:
        * **category**: Optional. Filter templates by category
        * **skip**: Optional. Number of templates to skip (default: 0)
        * **limit**: Optional. Maximum number of templates to return (default: 100)
    
    Returns:
        List of template objects, each containing:
        * **id**: Template ID
        * **title**: Template title
        * **description**: Template description
        * **category**: Template category
        * **duration**: Total duration
        * **created_at**: Creation timestamp
        * **updated_at**: Last update timestamp
        * **steps**: List of template steps
    
    Raises:
        * **422**: Invalid pagination parameters
    """
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
    """
    Get a specific story template.
    
    Retrieves detailed information about a story template by its ID.
    
    Args:
        * **template_id**: Required. ID of the template to retrieve
    
    Returns:
        Complete template object including:
        * **id**: Template ID
        * **title**: Template title
        * **description**: Template description
        * **category**: Template category
        * **duration**: Total duration
        * **created_at**: Creation timestamp
        * **updated_at**: Last update timestamp
        * **steps**: List of template steps
    
    Raises:
        * **404**: Template not found
        * **422**: Invalid template ID
    """
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
    """
    Update a story template.
    
    Admin only endpoint for updating an existing story template.
    
    Args:
        * **template_id**: Required. ID of the template to update
        * **title**: Optional. New template title
        * **description**: Optional. New template description
        * **category**: Optional. New template category
        * **duration**: Optional. New estimated duration
        * **is_active**: Optional. Whether the template is active
    
    Returns:
        Updated template object including:
        * **id**: Template ID
        * **title**: Template title
        * **description**: Template description
        * **category**: Template category
        * **duration**: Total duration
        * **created_at**: Creation timestamp
        * **updated_at**: Last update timestamp
        * **steps**: List of template steps
    
    Raises:
        * **401**: Not authenticated
        * **403**: Not an admin
        * **404**: Template not found
        * **422**: Validation error
    """
    template_service = TemplateService(db)
    return await template_service.update_template(template_id, template_update)

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)  # Only admins can delete templates
):
    """
    Delete a story template.
    
    Admin only endpoint for deleting a story template.
    
    Args:
        * **template_id**: Required. ID of the template to delete
    
    Returns:
        * **status**: "success" if deletion was successful
    
    Raises:
        * **401**: Not authenticated
        * **403**: Not an admin
        * **404**: Template not found
        * **422**: Invalid template ID
    """
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
    """
    Update a template step.
    
    Admin only endpoint for updating an existing template step.
    
    Args:
        * **template_id**: Required. ID of the template
        * **step_id**: Required. ID of the step to update
        * **title**: Optional. New step title
        * **description**: Optional. New step description
        * **duration**: Optional. New step duration
        * **required**: Optional. Whether the step is required
        * **position**: Optional. New step position
    
    Returns:
        Updated step object including:
        * **id**: Step ID
        * **template_id**: Template ID
        * **title**: Step title
        * **description**: Step description
        * **duration**: Step duration
        * **required**: Whether step is required
        * **position**: Step position
        * **created_at**: Creation timestamp
    
    Raises:
        * **401**: Not authenticated
        * **403**: Not an admin
        * **404**: Template or step not found
        * **422**: Validation error
    """
    template_service = TemplateService(db)
    
    # Verify template exists
    template = await template_service.get_template(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return await template_service.update_step(step_id, step_update) 