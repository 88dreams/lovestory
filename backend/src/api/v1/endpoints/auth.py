from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from api.deps import get_db
from schemas.token import Token, TokenPair
from services.user import UserService
from services.auth import AuthService
from models.base import User
from schemas.user import UserCreate

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> Token:
    """
    Register a new user.
    
    Creates a new user account and returns access and refresh tokens.
    
    Args:
        * **username**: Required. 3-50 characters, alphanumeric and underscores only
        * **email**: Required. Valid email address
        * **password**: Required. Must be at least 8 characters and include:
            - One uppercase letter
            - One lowercase letter
            - One number
            - One special character
    
    Returns:
        * **access_token**: JWT access token
        * **refresh_token**: JWT refresh token
        * **token_type**: Type of token (always "bearer")
    
    Raises:
        * **400**: Email already registered
        * **422**: Validation error
    """
    auth_service = AuthService(db)
    return await auth_service.register_user(user_data)

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")  # Limit to 5 login attempts per minute
async def login(
    request: Request,  # Required for rate limiting
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login to get access token.
    
    Authenticates user credentials and returns access and refresh tokens.
    
    Args:
        * **username**: Required. Email or username
        * **password**: Required. Account password
    
    Returns:
        * **access_token**: JWT access token
        * **refresh_token**: JWT refresh token
        * **token_type**: Type of token (always "bearer")
    
    Raises:
        * **401**: Invalid credentials
        * **422**: Validation error
    """
    auth_service = AuthService(db)
    return await auth_service.authenticate_user(form_data.username, form_data.password)

@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Get new access token using refresh token.
    
    Args:
        * **refresh_token**: Required. Valid JWT refresh token
    
    Returns:
        * **access_token**: New JWT access token
        * **refresh_token**: New JWT refresh token
        * **token_type**: Type of token (always "bearer")
    
    Raises:
        * **401**: Invalid or expired refresh token
        * **422**: Validation error
    """
    auth_service = AuthService(db)
    return await auth_service.refresh_tokens(refresh_token) 