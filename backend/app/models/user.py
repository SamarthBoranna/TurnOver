from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

from app.models.shoe import ShoeCategory


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    first_name: str
    last_name: str


class User(UserBase):
    """User model from Supabase Auth"""
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    """User profile with preferences (stored in profiles table)"""
    id: str
    user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    avg_miles_per_week: float = 0.0
    preferred_categories: List[ShoeCategory] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
