import logging
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_

from models.story import StoryTemplate, StoryStep
from schemas.template import StoryTemplateCreate, StoryTemplateUpdate, StoryStepCreate, StoryStepUpdate

logger = logging.getLogger(__name__)

class TemplateService:
    """Service for handling story template operations"""

    def __init__(self, db: Session):
        self.db = db

    async def create_template(self, template_data: StoryTemplateCreate) -> StoryTemplate:
        """Create a new story template with steps"""
        try:
            # Create template
            template = StoryTemplate(
                name=template_data.name,
                description=template_data.description,
                is_active=template_data.is_active
            )
            self.db.add(template)
            self.db.flush()  # Get template ID without committing

            # Create steps
            for step_data in template_data.steps:
                step = StoryStep(
                    template_id=template.id,
                    order=step_data.order,
                    name=step_data.name,
                    description=step_data.description,
                    duration_min=step_data.duration_min,
                    duration_max=step_data.duration_max
                )
                self.db.add(step)

            self.db.commit()
            self.db.refresh(template)
            return template

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating template: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create template"
            )

    async def get_template(self, template_id: int) -> Optional[StoryTemplate]:
        """Get story template by ID"""
        return self.db.query(StoryTemplate).filter(StoryTemplate.id == template_id).first()

    async def list_templates(
        self,
        skip: int = 0,
        limit: int = 10,
        active_only: bool = False
    ) -> List[StoryTemplate]:
        """List story templates with optional filtering"""
        query = self.db.query(StoryTemplate)
        if active_only:
            query = query.filter(StoryTemplate.is_active == True)
        return query.offset(skip).limit(limit).all()

    async def update_template(
        self,
        template_id: int,
        template_data: StoryTemplateUpdate
    ) -> StoryTemplate:
        """Update story template"""
        template = await self.get_template(template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )

        try:
            # Update template fields
            update_data = template_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                if field != "steps":  # Handle steps separately
                    setattr(template, field, value)

            # Update steps if provided
            if template_data.steps:
                # Remove existing steps
                self.db.query(StoryStep).filter(
                    StoryStep.template_id == template.id
                ).delete()

                # Add new steps
                for step_data in template_data.steps:
                    step = StoryStep(
                        template_id=template.id,
                        order=step_data.order,
                        name=step_data.name,
                        description=step_data.description,
                        duration_min=step_data.duration_min,
                        duration_max=step_data.duration_max
                    )
                    self.db.add(step)

            self.db.commit()
            self.db.refresh(template)
            return template

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating template: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update template"
            )

    async def delete_template(self, template_id: int) -> bool:
        """Delete story template and its steps"""
        template = await self.get_template(template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )

        try:
            # Delete steps first (should cascade, but being explicit)
            self.db.query(StoryStep).filter(
                StoryStep.template_id == template.id
            ).delete()

            # Delete template
            self.db.delete(template)
            self.db.commit()
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting template: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete template"
            )

    async def get_template_step(
        self,
        template_id: int,
        step_order: int
    ) -> Optional[StoryStep]:
        """Get specific step from a template"""
        return self.db.query(StoryStep).filter(
            and_(
                StoryStep.template_id == template_id,
                StoryStep.order == step_order
            )
        ).first()

    async def update_step(
        self,
        step_id: int,
        step_data: StoryStepUpdate
    ) -> StoryStep:
        """Update a specific step"""
        step = self.db.query(StoryStep).filter(StoryStep.id == step_id).first()
        if not step:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Step not found"
            )

        try:
            update_data = step_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(step, field, value)

            self.db.commit()
            self.db.refresh(step)
            return step

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating step: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update step"
            ) 