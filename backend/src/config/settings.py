from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App Settings
    APP_NAME: str = "LoveStory"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    
    # Database Settings
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    
    @property
    def DATABASE_URL(self) -> str:
        """Constructs database URL from components."""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # JWT Settings
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AWS Settings
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "us-west-2"
    AWS_BUCKET_NAME: str
    
    # S3 Upload Settings
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_VIDEO_TYPES: List[str] = ["video/mp4", "video/quicktime", "video/x-msvideo"]
    MAX_VIDEO_DURATION: int = 300  # 5 minutes in seconds
    UPLOAD_URL_EXPIRE: int = 3600  # 1 hour in seconds
    
    # CORS Settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """
    Creates and caches application settings.
    Uses lru_cache to ensure settings are only loaded once.
    """
    return Settings()

# Create settings instance
settings = get_settings() 