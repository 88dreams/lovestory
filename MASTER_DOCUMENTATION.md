# LoveStory - Master Technical Documentation

## Overview
LoveStory is a mobile application that enables collaborative storytelling through video segments. Users contribute short video clips that fit into predefined story structures, and the application can generate complete stories by randomly selecting and combining these segments.

## Technical Architecture

### Backend Architecture

#### Technology Stack
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Storage**: AWS S3
- **Video Processing**: FFmpeg via MoviePy
- **Authentication**: JWT with python-jose
- **Password Hashing**: passlib with bcrypt

#### Core Components

1. **Database Models**
   - `BaseModel`: Abstract base class with common fields (id, timestamps)
   - `StoryTemplate`: Defines story structures
   - `StoryStep`: Individual steps within a template
   - `VideoSegment`: User-submitted video clips
   - `User`: User management
   - `GeneratedStory`: Complete generated stories
   - `GeneratedStorySegment`: Segments used in generated stories

2. **API Structure**
   ```
   /api
   ├── /v1
   │   ├── /auth           # Authentication endpoints
   │   │   ├── /register   # New user registration
   │   │   ├── /login      # User login with rate limiting
   │   │   └── /refresh    # Token refresh
   │   ├── /users          # User management
   │   ├── /templates      # Story template management
   │   │   ├── GET /       # List templates with pagination
   │   │   ├── POST /      # Create template (admin)
   │   │   ├── GET /{id}   # Get template details
   │   │   ├── PUT /{id}   # Update template (admin)
   │   │   └── /steps      # Template step management
   │   ├── /videos         # Video upload and management
   │   │   ├── /upload-url # Get presigned upload URL
   │   │   ├── /complete   # Complete upload processing
   │   │   ├── /metadata   # Get video metadata
   │   │   └── /segments   # Video segment management
   │   └── /stories        # Story generation and retrieval
   ```

3. **Services Layer**
   - Authentication Service
     * JWT token generation and validation
     * Password hashing with bcrypt
     * Rate limiting for login attempts
   - Video Processing Service
     * Video validation (format, size, duration)
     * Metadata extraction
     * Background processing
   - Story Generation Service
   - Storage Service (S3 Integration)
     * Presigned URL generation
     * Video storage management
     * Access control

### API Documentation
- **OpenAPI/Swagger Integration**
  * Interactive API documentation
  * Request/response examples
  * Authentication flows
  * Error responses

### Rate Limiting
- Login attempts: 5 per minute
- Video uploads: 10 per hour
- API calls: 1000 per hour per user

### Error Handling
- Standardized error responses
  * HTTP status codes
  * Detailed error messages
  * Error codes for machine processing
- Common error scenarios:
  * Authentication failures
  * Resource not found
  * Validation errors
  * Rate limit exceeded
  * Server errors

### Mobile App Architecture

#### Technology Stack
- React Native
- Expo
- React Navigation
- React Native Camera

#### Key Features
1. **Video Recording**
   - Camera integration
   - Duration limits
   - Basic editing capabilities

2. **Story Management**
   - Template selection
   - Step visualization
   - Progress tracking

3. **Video Playback**
   - Generated story viewing
   - Segment preview
   - Playback controls

## Data Flow

### Video Upload Process
1. User selects story template
2. Chooses specific step
3. Records video segment
4. Client performs initial validation
5. Upload to S3 via presigned URL
6. Backend processes video and updates database

### Story Generation Process
1. User requests story generation
2. Backend randomly selects approved segments
3. FFmpeg combines segments
4. Generated video stored in S3
5. Database updated with new story

## Security Considerations

### Authentication
- JWT-based authentication
  * Access tokens (short-lived)
  * Refresh tokens (long-lived)
  * Token payload validation
- Secure password hashing with bcrypt
- Rate limiting on sensitive endpoints
  * Login attempts
  * Token refresh
  * Password reset

### Video Upload Security
- Presigned URL approach
  * Time-limited upload URLs
  * Content type validation
  * Size restrictions
- Post-upload validation
  * Format verification
  * Malware scanning
  * Content validation

### Data Protection
- S3 bucket policies
- Database encryption
- Secure video storage

### Video Processing
- Content validation
- Size and duration limits
- Format standardization

## Scalability Considerations

### Database
- Efficient indexing
- Relationship optimization
- Query performance monitoring

### Storage
- CDN integration
- Video compression
- Caching strategy

### Processing
- Async video processing
- Queue management
- Resource optimization

## Development Guidelines

### Code Style
- PEP 8 for Python
- ESLint for JavaScript/TypeScript
- Consistent naming conventions

### Testing Strategy
- Unit tests for services
- Integration tests for API
- E2E tests for critical flows

### Git Workflow
- Feature branch workflow
- PR review process
- Version tagging

## Deployment Architecture

### Infrastructure
- AWS-based deployment
- Container orchestration
- Load balancing

### Monitoring
- Application metrics
- Error tracking
- Performance monitoring

## Current Status
See PROGRESS.md for detailed development status and upcoming tasks.

## Future Considerations
1. **Scaling**
   - Horizontal scaling strategy
   - Database sharding
   - CDN optimization

2. **Features**
   - AI-powered content moderation
   - Advanced video editing
   - Social features

3. **Monetization**
   - Premium templates
   - Storage tiers
   - Professional features

## Contributing
See CONTRIBUTING.md for development setup and guidelines.

---
Last Updated: [Current Date]

Note: This document serves as the primary reference for the technical implementation of LoveStory. It should be updated as the project evolves. 