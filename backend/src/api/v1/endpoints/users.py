from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from models.base import User
from schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserList,
    UserSearchParams,
    UserProfileUpdate
)
from services.user import UserService
from api.deps import get_db, get_current_user, get_current_admin_user

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    return await UserService(db).create_user(user)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    return await UserService(db).update_user(current_user.id, user_update)

@router.put("/me/profile", response_model=UserResponse)
async def update_current_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    return await UserService(db).update_user_profile(current_user.id, profile_update)

@router.get("/search", response_model=List[UserResponse])
async def search_users(
    q: str = Query(..., min_length=2, description="Search term"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)  # Ensure user is authenticated
):
    """Search users by email or username"""
    return await UserService(db).search_users(q, limit)

# Admin endpoints
@router.get("", response_model=UserList)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    email: Optional[str] = None,
    username: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_admin: Optional[bool] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)  # Ensure user is admin
):
    """List all users with filtering and pagination (admin only)"""
    search_params = UserSearchParams(
        email=email,
        username=username,
        is_active=is_active,
        is_admin=is_admin
    )
    users, total = await UserService(db).list_users(skip, limit, search_params)
    return {
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "items": users
    }

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user by ID (admin or same user only)"""
    if not current_user.is_admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    user = await UserService(db).get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)  # Ensure user is admin
):
    """Update user (admin only)"""
    return await UserService(db).update_user(user_id, user_update)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)  # Ensure user is admin
):
    """Delete user (admin only)"""
    await UserService(db).delete_user(user_id)
    return None