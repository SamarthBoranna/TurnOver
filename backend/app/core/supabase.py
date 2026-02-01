from supabase import create_client, Client
from functools import lru_cache
from typing import Optional

from app.core.config import settings


def _validate_credentials() -> bool:
    """Check if Supabase credentials are configured"""
    return bool(
        settings.SUPABASE_URL 
        and settings.SUPABASE_KEY 
        and settings.SUPABASE_SERVICE_KEY
        and settings.SUPABASE_URL != "https://your-project-id.supabase.co"
    )


@lru_cache()
def get_supabase_client() -> Optional[Client]:
    """
    Get Supabase client with publishable key (for client-side operations)
    Respects Row Level Security policies
    Returns None if credentials are not configured
    """
    if not _validate_credentials():
        print("⚠️  Warning: Supabase credentials not configured. See .env.example")
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


@lru_cache()
def get_supabase_server() -> Optional[Client]:
    """
    Get Supabase client with secret key (for server-side operations)
    Note: This still respects RLS - use authenticated user context for user-specific data
    Returns None if credentials are not configured
    """
    if not _validate_credentials():
        print("⚠️  Warning: Supabase credentials not configured. See .env.example")
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


# Convenience exports - will be None if not configured
supabase = get_supabase_client()
supabase_admin = get_supabase_server()  # Note: Does NOT bypass RLS with new Supabase keys
