# TurnOver

A modern web application for runners to track their running shoe rotation, archive retired shoes, and receive personalized recommendations based on their preferences and ratings.

## Features

- **Shoe Rotation** - Track your active running shoes and when you started using them
- **Shoe Graveyard** - Archive retired shoes with ratings and reviews for future reference
- **Smart Recommendations** - Get personalized shoe suggestions based on your ratings and preferences
- **User Profile** - Manage your running stats and preferences

## Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: Python 3.11+
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth

## Project Structure

```
turnover/
├── app/                      # Next.js frontend
│   ├── (pages)/              # Route group for authenticated pages
│   ├── api/                  # Next.js API routes (optional proxy)
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   ├── core/             # Core configuration
│   │   ├── models/           # Pydantic data models
│   │   ├── schemas/          # API request/response schemas
│   │   └── main.py           # FastAPI application
│   ├── supabase/             # Database migrations & seeds
│   ├── tests/                # Backend tests
│   └── requirements.txt      # Python dependencies
├── components/               # React components
│   ├── features/             # Feature-specific components
│   ├── layout/               # Layout components
│   ├── shared/               # Shared/reusable components
│   └── ui/                   # shadcn/ui primitives
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities and types
└── public/                   # Static assets
```

## Prerequisites

- Node.js 18.17+ (for frontend)
- Python 3.11+ (for backend)
- [Supabase](https://supabase.com/) account

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/turnover.git
cd turnover
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com/)
2. Run the database migration in SQL Editor:
   - Copy contents of `backend/supabase/migrations/001_initial_schema.sql`
   - Execute in Supabase Dashboard > SQL Editor
3. Seed the database:
   - Copy contents of `backend/supabase/seed.sql`
   - Execute in Supabase Dashboard > SQL Editor

### 3. Set Up the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Supabase credentials
cat > .env << EOF
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
DEBUG=true
CORS_ORIGINS=["http://localhost:3000"]
EOF

# Run the server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at http://localhost:8000
- API Docs: http://localhost:8000/docs

### 4. Set Up the Frontend

```bash
# From project root
npm install

# Create .env.local with your configuration
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF

# Run the development server
npm run dev
```

Frontend will be available at http://localhost:3000

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

### Backend

| Command | Description |
|---------|-------------|
| `uvicorn app.main:app --reload` | Start development server |
| `pytest` | Run tests |
| `black app/` | Format code |
| `mypy app/` | Type checking |

## API Documentation

Once the backend is running, view the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Sign in |
| GET | `/api/shoes` | List all shoes |
| GET | `/api/rotation` | Get user's rotation |
| POST | `/api/rotation` | Add shoe to rotation |
| POST | `/api/graveyard` | Retire a shoe |
| GET | `/api/recommendations` | Get personalized recommendations |

## Deployment

### Frontend (Vercel)

```bash
npm run build
# Deploy to Vercel
```

### Backend (Railway/Render/Fly.io)

```bash
# Build Docker image
docker build -t turnover-backend ./backend

# Or deploy directly using the Dockerfile in backend/
```

### Environment Variables

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Backend (.env)**:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
CORS_ORIGINS=["https://your-frontend-domain.com"]
DEBUG=false
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
