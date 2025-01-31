from typing import Optional, List, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from fastapi import HTTPException, status
from passlib.context import CryptContext

from models.base import User
from schemas.user import UserCreate, UserUpdate, UserSearchParams, UserProfileUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    """Service for handling user operations"""

    def __init__(self, db: Session):
        self.db = db

    def get_password_hash(self, password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)

    async def get_user(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()

    async def create_user(self, user: UserCreate) -> User:
        """Create a new user"""
        # Check if user with email already exists
        if await self.get_user_by_email(user.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user
        db_user = User(
            email=user.email,
            username=user.username,
            hashed_password=self.get_password_hash(user.password),
            is_active=True,
            is_admin=False
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    async def update_user(self, user_id: int, user_update: UserUpdate) -> User:
        """Update user information"""
        db_user = await self.get_user(user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Check if email is being updated and is not already taken
        if user_update.email and user_update.email != db_user.email:
            if await self.get_user_by_email(user_update.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )

        update_data = user_update.dict(exclude_unset=True)
        
        # Hash password if it's being updated
        if "password" in update_data:
            update_data["hashed_password"] = self.get_password_hash(update_data.pop("password"))

        for field, value in update_data.items():
            setattr(db_user, field, value)

        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    async def delete_user(self, user_id: int) -> bool:
        """Delete user (soft delete by deactivating)"""
        db_user = await self.get_user(user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        db_user.is_active = False
        self.db.commit()
        return True

    async def list_users(
        self,
        skip: int = 0,
        limit: int = 10,
        search_params: Optional[UserSearchParams] = None
    ) -> Tuple[List[User], int]:
        """List users with pagination and filtering"""
        query = self.db.query(User)

        if search_params:
            filters = []
            if search_params.email:
                filters.append(User.email.ilike(f"%{search_params.email}%"))
            if search_params.username:
                filters.append(User.username.ilike(f"%{search_params.username}%"))
            if search_params.is_active is not None:
                filters.append(User.is_active == search_params.is_active)
            if search_params.is_admin is not None:
                filters.append(User.is_admin == search_params.is_admin)
            if search_params.created_after:
                filters.append(User.created_at >= search_params.created_after)
            if search_params.created_before:
                filters.append(User.created_at <= search_params.created_before)
            
            if filters:
                query = query.filter(and_(*filters))

        total = query.count()
        users = query.offset(skip).limit(limit).all()
        return users, total

    async def search_users(self, search_term: str, limit: int = 10) -> List[User]:
        """Search users by email or username"""
        return self.db.query(User).filter(
            or_(
                User.email.ilike(f"%{search_term}%"),
                User.username.ilike(f"%{search_term}%")
            )
        ).limit(limit).all()

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password"""
        return pwd_context.verify(plain_password, hashed_password)

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user"""
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    async def update_user_profile(
        self,
        user_id: int,
        profile_update: UserProfileUpdate
    ) -> User:
        """Update user profile information"""
        db_user = await self.get_user(user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        update_data = profile_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)

        self.db.commit()
        self.db.refresh(db_user)
        return db_user 