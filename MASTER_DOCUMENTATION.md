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
   │   ├── /users          # User management
   │   ├── /templates      # Story template management
   │   ├── /videos         # Video upload and management
   │   └── /stories        # Story generation and retrieval
   ```

3. **Services Layer**
   - Authentication Service
   - Video Processing Service
   - Story Generation Service
   - Storage Service (S3 Integration)

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
- Secure password hashing
- Rate limiting on sensitive endpoints

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