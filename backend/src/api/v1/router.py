from fastapi import APIRouter
from .endpoints import users, stories, videos, templates

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(stories.router, prefix="/stories", tags=["stories"])
api_router.include_router(videos.router, prefix="/videos", tags=["videos"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"]) 