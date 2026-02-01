from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Tuple
from supabase_auth.types import User
from supabase import create_client, Client

from app.core.supabase import supabase, supabase_admin
from app.core.config import settings

# Security scheme for Swagger UI
security = HTTPBearer()


def get_authenticated_client(access_token: str) -> Client:
    """
    Create a Supabase client authenticated with the user's access token.
    This ensures RLS policies are evaluated in the user's context.
    """
    # Create a new client with the user's access token for RLS
    client = create_client(
        settings.SUPABASE_URL, 
        settings.SUPABASE_KEY,
    )
    # Set the session with the user's access token
    client.postgrest.auth(access_token)
    return client


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Validate JWT token and return the current user.
    Raises HTTPException if token is invalid or expired.
    """
    token = credentials.credentials
    
    try:
        # Verify the token with Supabase
        response = supabase.auth.get_user(token)
        
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return response.user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_with_client(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Tuple[User, Client]:
    """
    Validate JWT token and return the current user along with an authenticated
    Supabase client that operates in the user's RLS context.
    """
    token = credentials.credentials
    
    try:
        # Verify the token with Supabase
        response = supabase.auth.get_user(token)
        
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create an authenticated client for this user
        auth_client = get_authenticated_client(token)
        
        return response.user, auth_client
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
) -> Optional[User]:
    """
    Optional authentication - returns user if valid token provided, None otherwise.
    Useful for endpoints that work for both authenticated and anonymous users.
    """
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
