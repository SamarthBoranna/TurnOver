# TurnOver Backend

FastAPI backend for TurnOver - Running Shoe Rotation Tracker

## Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Language**: Python 3.11+

## Prerequisites

- Python 3.11 or later
- [Supabase](https://supabase.com/) account and project
- pip or uv (recommended)

## Project Structure

```
backend/
├── app/
│   ├── api/                 # API route handlers
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── users.py         # User profile endpoints
│   │   ├── shoes.py         # Shoe catalog endpoints
│   │   ├── rotation.py      # Rotation management
│   │   ├── graveyard.py     # Retired shoes management
│   │   └── recommendations.py # Recommendation engine
│   ├── core/                # Core configuration
│   │   ├── config.py        # Settings & environment
│   │   ├── supabase.py      # Supabase client setup
│   │   └── auth.py          # Auth dependencies
│   ├── models/              # Pydantic data models
│   │   ├── shoe.py          # Shoe models
│   │   ├── user.py          # User models
│   │   └── recommendation.py # Recommendation models
│   ├── schemas/             # API request/response schemas
│   │   ├── shoe.py          # Shoe schemas
│   │   ├── user.py          # User schemas
│   │   └── common.py        # Common response schemas
│   ├── scripts/             # Utility scripts
│   │   └── seed_database.py # Database seeding script
│   └── main.py              # FastAPI application
├── supabase/
│   ├── migrations/          # SQL migration files
│   │   └── 001_initial_schema.sql
│   └── seed.sql             # Seed data (SQL version)
├── tests/                   # Test files
├── .env.example             # Example environment variables
├── requirements.txt         # Python dependencies
├── pyproject.toml           # Project configuration
└── README.md
```

## Getting Started

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Note your project URL and API keys from **Project Settings > API**

### 2. Set Up the Database

#### Option A: Using Supabase Dashboard (Recommended for first-time setup)

1. **Run the migration** - Copy the contents of `supabase/migrations/001_initial_schema.sql` and run it in Supabase Dashboard > SQL Editor
2. **Seed the data** - Copy the contents of `supabase/seed.sql` and run it in Supabase Dashboard > SQL Editor

#### Option B: Using the Python Seeding Script

After setting up environment variables (step 3), you can use the Python script:

```bash
# Verify connection
python -m app.scripts.seed_database --verify

# Seed the database
python -m app.scripts.seed_database

# Clear and reseed
python -m app.scripts.seed_database --clear

# View statistics
python -m app.scripts.seed_database --stats
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-publishable-key
SUPABASE_SERVICE_KEY=your-secret-key  # Note: Does NOT bypass RLS

# Optional
JWT_SECRET=your-jwt-secret
DEBUG=false
CORS_ORIGINS=["http://localhost:3000"]
```

> **Note on RLS**: The new Supabase secret key does not bypass Row Level Security. 
> The backend passes user authentication context to Supabase so RLS policies work correctly.

### 4. Install Dependencies

Using uv (recommended):

```bash
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
```

Using pip (alternative):

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Run the Server

Development:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Production:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 6. View API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/signin` | Sign in with email/password |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/signout` | Sign out current user |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update current user profile |
| GET | `/api/users/{id}/stats` | Get user's shoe statistics |

### Shoes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shoes` | List all shoes (with filters) |
| GET | `/api/shoes/{id}` | Get a single shoe |
| POST | `/api/shoes` | Create a new shoe |
| PATCH | `/api/shoes/{id}` | Update a shoe |
| DELETE | `/api/shoes/{id}` | Delete a shoe |

### Rotation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rotation` | Get user's current rotation |
| POST | `/api/rotation` | Add shoe to rotation |
| DELETE | `/api/rotation/{shoe_id}` | Remove shoe from rotation |

### Graveyard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/graveyard` | Get user's retired shoes |
| POST | `/api/graveyard` | Retire a shoe (with rating) |
| PATCH | `/api/graveyard/{shoe_id}` | Update retired shoe rating/review |
| DELETE | `/api/graveyard/{shoe_id}` | Remove from graveyard |

### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | Get personalized recommendations |
| GET | `/api/recommendations/similar/{shoe_id}` | Get similar shoes |

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black app/
isort app/
ruff check app/
```

### Type Checking

```bash
mypy app/
```

## Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

Make sure to set these in your hosting environment:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_KEY`
- `CORS_ORIGINS` (set to your frontend domain)
- `DEBUG=false`

## License

MIT
