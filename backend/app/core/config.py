from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
from functools import lru_cache
import json


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "TurnOver API"
    DEBUG: bool = False
    
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""  # publishable key for client-side (respects RLS)
    SUPABASE_SERVICE_KEY: str = ""  # secret key for server-side operations (still respects RLS)
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://v0-turn-over.vercel.app",
    ]
    
    # JWT (Supabase uses these internally, but we need for verification)
    JWT_SECRET: str = ""  # Supabase JWT secret (optional, for custom verification)
    
    # External APIs
    RAPIDAPI_KEY: str = ""  # RapidAPI key for shoe image fetching
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse CORS origins from JSON string or list"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                # If it's not valid JSON, treat as comma-separated
                return [origin.strip() for origin in v.split(',')]
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
