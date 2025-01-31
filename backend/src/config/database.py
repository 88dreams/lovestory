from typing import Generator
import logging
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError, DBAPIError
from sqlalchemy.engine import Engine
from tenacity import retry, stop_after_attempt, wait_exponential
from .settings import settings

# Configure logging
logger = logging.getLogger(__name__)

# Create SQLAlchemy engine with enhanced configuration
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Enable connection pool "pre-ping" feature
    pool_size=5,  # Number of connections to keep open
    max_overflow=10,  # Max number of connections to create above pool_size
    pool_timeout=30,  # Timeout for getting connection from pool
    pool_recycle=3600,  # Recycle connections after 1 hour
    echo=settings.DEBUG,  # Log SQL queries in debug mode
)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

@event.listens_for(Engine, "connect")
def connect(dbapi_connection, connection_record):
    """Log when a connection is created"""
    logger.info("Database connection established")

@event.listens_for(Engine, "disconnect")
def disconnect(dbapi_connection, connection_record):
    """Log when a connection is destroyed"""
    logger.info("Database connection closed")

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    reraise=True
)
def get_db_with_retry() -> Session:
    """Create a new database session with retry logic"""
    try:
        db = SessionLocal()
        # Verify connection is active
        db.execute("SELECT 1")
        return db
    except (SQLAlchemyError, DBAPIError) as e:
        logger.error(f"Database connection error: {str(e)}")
        raise

def get_db() -> Generator[Session, None, None]:
    """
    Database dependency to be used in FastAPI dependency injection.
    Creates a new database session for each request and ensures it is closed after the request is complete.
    Includes retry logic and connection verification.
    """
    db = None
    try:
        db = get_db_with_retry()
        yield db
    except Exception as e:
        logger.error(f"Error while getting database session: {str(e)}")
        raise
    finally:
        if db:
            try:
                db.close()
                logger.debug("Database session closed successfully")
            except Exception as e:
                logger.error(f"Error while closing database session: {str(e)}")

async def verify_database_connection() -> bool:
    """
    Verify database connection is working.
    Used for health checks and startup verification.
    """
    try:
        db = get_db_with_retry()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database connection verification failed: {str(e)}")
        return False 