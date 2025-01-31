# LoveStory

A collaborative video storytelling platform that allows users to create and share stories through video segments.

## Project Overview

LoveStory is a modern web and mobile application that enables users to:
- Create and participate in collaborative video stories
- Upload and manage video segments
- Generate complete stories from user-submitted videos
- Share and discover unique storytelling experiences

## Technology Stack

### Backend
- Python 3.13+
- FastAPI (Web Framework)
- PostgreSQL (Database)
- SQLAlchemy (ORM)
- Alembic (Database Migrations)
- JWT Authentication
- AWS S3 (Video Storage)

### Mobile App (Coming Soon)
- React Native
- Expo
- TypeScript

## Project Structure

```
LoveStory/
├── backend/                 # Backend API service
│   ├── src/                # Source code
│   │   ├── api/           # API endpoints and routes
│   │   ├── config/        # Configuration files
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── tests/             # Test files
│   ├── migrations/        # Database migrations
│   └── requirements.txt   # Python dependencies
├── mobile/                # Mobile app (Coming Soon)
└── docs/                  # Documentation
```

## Getting Started

### Prerequisites
- Python 3.13+
- PostgreSQL 16+
- Virtual environment tool

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/LoveStory.git
cd LoveStory
```

2. Create and activate virtual environment:
```bash
python -m venv virtual
source virtual/bin/activate  # On Windows: .\virtual\Scripts\activate
```

3. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Create database:
```bash
# Using psql
createdb lovestory
```

6. Run migrations:
```bash
alembic upgrade head
```

7. Start the development server:
```bash
uvicorn src.main:app --reload
```

### API Documentation

Once the server is running, you can access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Database Migrations

To create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

To apply migrations:
```bash
alembic upgrade head
```

### Running Tests

```bash
pytest
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/LoveStory 