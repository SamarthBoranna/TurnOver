from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

from app.models.shoe import ShoeCategory


class UserProfileCreate(BaseModel):
    """Schema for creating user profile (usually auto-created on signup)"""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    avg_miles_per_week: float = Field(default=0.0, ge=0)
    preferred_categories: List[ShoeCategory] = []


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    avg_miles_per_week: Optional[float] = Field(None, ge=0)
    preferred_categories: Optional[List[ShoeCategory]] = None


class UserProfileResponse(BaseModel):
    """Schema for user profile response"""
    id: str
    user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    avg_miles_per_week: float
    preferred_categories: List[ShoeCategory]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Schema for authentication response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: str
    user: UserProfileResponse
