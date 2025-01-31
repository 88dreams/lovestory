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

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/login", response_model=TokenPair)
@limiter.limit("5/minute")  # Limit to 5 login attempts per minute
async def login(
    request: Request,  # Required for rate limiting
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user and return access and refresh tokens"""
    user = await UserService(db).authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token, refresh_token = AuthService.create_tokens(
        data={"sub": str(user.id)}
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """Create new access token using refresh token"""
    try:
        payload = AuthService.verify_refresh_token(refresh_token)
        user_id = payload.get("sub")
        user = await UserService(db).get_user(int(user_id))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user or inactive user"
            )
        
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id)}
        )
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token"
        ) 