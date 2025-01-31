from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, constr, Field

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: constr(min_length=3, max_length=50)
    is_active: bool = True

class UserCreate(UserBase):
    """User creation schema"""
    password: constr(min_length=8)

class UserUpdate(BaseModel):
    """User update schema"""
    email: Optional[EmailStr] = None
    username: Optional[constr(min_length=3, max_length=50)] = None
    password: Optional[constr(min_length=8)] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    """User response schema"""
    id: int
    is_admin: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config"""
        from_attributes = True

class UserList(BaseModel):
    """User list response schema"""
    total: int
    page: int
    size: int
    items: List[UserResponse]

class UserSearchParams(BaseModel):
    """User search parameters"""
    email: Optional[str] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None

class UserProfileUpdate(BaseModel):
    """User profile update schema"""
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None
    display_name: Optional[str] = Field(None, min_length=2, max_length=50)
    website: Optional[str] = None
    location: Optional[str] = None 