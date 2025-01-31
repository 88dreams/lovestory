"""
LoveStory Backend API

A FastAPI application for creating and sharing love story videos.
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from api.v1.api import api_router
from config.settings import settings
from config.database import verify_database_connection

app = FastAPI(
    title="LoveStory API",
    description="""
    LoveStory is a platform for creating and sharing beautiful love story videos.
    
    ## Features
    
    * 📹 Video Upload & Processing
        * Upload videos securely using presigned URLs
        * Automatic video validation and processing
        * Video segment management for stories
    
    * 📝 Story Templates
        * Pre-designed story templates for different occasions
        * Customizable template steps
        * Template categories for easy discovery
    
    * 👥 User Management
        * Secure user authentication
        * Role-based access control
        * Profile management
    
    ## Authentication
    
    The API uses JWT tokens for authentication. To use protected endpoints:
    
    1. Register a new account using `/auth/register`
    2. Login using `/auth/login` to get access and refresh tokens
    3. Include the access token in the `Authorization` header:
       `Authorization: Bearer <your_access_token>`
    
    ## Rate Limiting
    
    Some endpoints have rate limiting to prevent abuse. The limits are:
    
    * Login attempts: 5 per minute
    * Video uploads: 10 per hour
    * API calls: 1000 per hour per user
    
    ## Error Handling
    
    The API uses standard HTTP status codes and returns detailed error messages:
    
    * `400`: Bad Request - Invalid input
    * `401`: Unauthorized - Missing or invalid token
    * `403`: Forbidden - Insufficient permissions
    * `404`: Not Found - Resource doesn't exist
    * `422`: Validation Error - Invalid data format
    * `429`: Too Many Requests - Rate limit exceeded
    * `500`: Internal Server Error - Something went wrong
    
    Each error response includes:
    * `detail`: Human-readable error message
    * `code`: Machine-readable error code (when applicable)
    """,
    version="1.0.0",
    contact={
        "name": "LoveStory Support",
        "url": "https://lovestory.com/support",
        "email": "support@lovestory.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
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

def custom_openapi():
    """Customize OpenAPI schema"""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter the JWT token in the format: Bearer <token>"
        }
    }
    
    # Add global security requirement
    openapi_schema["security"] = [{"bearerAuth": []}]
    
    # Add example responses for common errors
    openapi_schema["components"]["responses"] = {
        "UnauthorizedError": {
            "description": "Authentication failed",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Could not validate credentials",
                        "code": "invalid_token"
                    }
                }
            }
        },
        "NotFoundError": {
            "description": "Resource not found",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Resource with specified ID not found",
                        "code": "not_found"
                    }
                }
            }
        },
        "ValidationError": {
            "description": "Validation error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "email"],
                                "msg": "Invalid email format",
                                "type": "value_error"
                            }
                        ]
                    }
                }
            }
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

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