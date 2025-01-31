from typing import Optional
from pydantic import BaseModel, EmailStr, constr

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

class UserResponse(UserBase):
    """User response schema"""
    id: int
    is_admin: bool = False

    class Config:
        """Pydantic config"""
        from_attributes = True 