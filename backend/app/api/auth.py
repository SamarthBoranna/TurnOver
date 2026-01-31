from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from gotrue.errors import AuthApiError

from app.core.supabase import supabase

router = APIRouter()


class SignUpRequest(BaseModel):
    """Request model for user sign up"""
    email: EmailStr
    password: str
    first_name: str
    last_name: str


class SignInRequest(BaseModel):
    """Request model for user sign in"""
    email: EmailStr
    password: str


class TokenRefreshRequest(BaseModel):
    """Request model for token refresh"""
    refresh_token: str


class AuthTokenResponse(BaseModel):
    """Response model for authentication"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: str


@router.post("/signup", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(request: SignUpRequest):
    """
    Register a new user with email and password.
    Creates a user in Supabase Auth and a profile in the profiles table.
    """
    try:
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "first_name": request.first_name,
                    "last_name": request.last_name,
                }
            }
        })
        
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )
        
        # Note: Profile creation should be handled by a Supabase trigger
        # or explicitly created here
        
        return AuthTokenResponse(
            access_token=response.session.access_token,
            expires_in=response.session.expires_in,
            refresh_token=response.session.refresh_token,
        )
        
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/signin", response_model=AuthTokenResponse)
async def sign_in(request: SignInRequest):
    """
    Sign in with email and password.
    Returns access and refresh tokens.
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
        
        return AuthTokenResponse(
            access_token=response.session.access_token,
            expires_in=response.session.expires_in,
            refresh_token=response.session.refresh_token,
        )
        
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


@router.post("/refresh", response_model=AuthTokenResponse)
async def refresh_token(request: TokenRefreshRequest):
    """
    Refresh access token using refresh token.
    """
    try:
        response = supabase.auth.refresh_session(request.refresh_token)
        
        return AuthTokenResponse(
            access_token=response.session.access_token,
            expires_in=response.session.expires_in,
            refresh_token=response.session.refresh_token,
        )
        
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )


@router.post("/signout", status_code=status.HTTP_204_NO_CONTENT)
async def sign_out():
    """
    Sign out the current user.
    Note: This invalidates the current session on the server side.
    """
    try:
        supabase.auth.sign_out()
    except AuthApiError as e:
        # Sign out failures are generally safe to ignore
        pass
