from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from .settings import settings

# Create SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Enable connection pool "pre-ping" feature
    pool_size=5,  # Number of connections to keep open
    max_overflow=10,  # Max number of connections to create above pool_size
    pool_timeout=30,  # Timeout for getting connection from pool
)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Database dependency to be used in FastAPI dependency injection.
    Creates a new database session for each request and ensures it is closed after the request is complete.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 