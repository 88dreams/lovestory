from datetime import datetime, timedelta
from typing import Any, Dict
from jose import jwt

from config.settings import settings

class AuthService:
    """Service for handling authentication operations"""

    @staticmethod
    def create_access_token(data: Dict[str, Any]) -> str:
        """Create access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt 