from supabase import create_client, Client
from functools import lru_cache

from app.core.config import settings


@lru_cache()
def get_supabase_client() -> Client:
    """
    Get Supabase client with anon key (for user-context operations)
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


@lru_cache()
def get_supabase_admin() -> Client:
    """
    Get Supabase client with service role key (for admin operations)
    Use with caution - bypasses Row Level Security
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


# Convenience exports
supabase = get_supabase_client()
supabase_admin = get_supabase_admin()
