from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from api.v1.router import api_router
from config.settings import settings
from config.database import verify_database_connection

app = FastAPI(
    title="LoveStory API",
    description="API for the LoveStory video storytelling platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint to check API status"""
    return {
        "status": "online",
        "message": "Welcome to LoveStory API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint that verifies database connection"""
    db_healthy = await verify_database_connection()
    if not db_healthy:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed"
        )
    
    return {
        "status": "healthy",
        "service": "LoveStory API",
        "database": "connected"
    }

@app.on_event("startup")
async def startup_event():
    """Verify database connection on startup"""
    if not await verify_database_connection():
        raise Exception("Database connection failed during startup") 