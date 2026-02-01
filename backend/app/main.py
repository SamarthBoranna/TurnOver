from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import shoes, rotation, graveyard, recommendations, users, auth
from app.core.config import settings

app = FastAPI(
    title="TurnOver API",
    description="API for managing running shoe rotation, tracking retired shoes, and getting personalized recommendations",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(shoes.router, prefix="/api/shoes", tags=["Shoes"])
app.include_router(rotation.router, prefix="/api/rotation", tags=["Rotation"])
app.include_router(graveyard.router, prefix="/api/graveyard", tags=["Graveyard"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "TurnOver API", "version": "0.1.0"}


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check including database connectivity"""
    from app.core.supabase import supabase_admin
    
    db_status = "unknown"
    db_shoe_count = 0
    
    try:
        # Test database connectivity
        response = supabase_admin.table("shoes").select("*", count="exact").limit(1).execute()
        db_status = "connected"
        db_shoe_count = response.count or 0
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "shoe_count": db_shoe_count,
        "version": "0.1.0",
    }
