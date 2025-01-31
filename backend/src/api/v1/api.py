from fastapi import APIRouter
from api.v1.endpoints import auth, users, templates, videos, stories

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(templates.router, prefix="/templates", tags=["Story Templates"])
api_router.include_router(videos.router, prefix="/videos", tags=["Video Management"])
api_router.include_router(stories.router, prefix="/stories", tags=["Story Generation"]) 