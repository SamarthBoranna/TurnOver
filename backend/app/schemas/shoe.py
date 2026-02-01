from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from app.models.shoe import ShoeCategory, ShoeTag


# ============ Shoe Schemas ============

class ShoeCreate(BaseModel):
    """Schema for creating a new shoe"""
    brand: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=200)
    category: ShoeCategory
    tags: List[ShoeTag] = []
    weight: float = Field(..., gt=0, description="Weight in grams")
    drop: float = Field(..., ge=0, description="Drop in mm")
    stack_height_heel: float = Field(..., ge=0, description="Heel stack height in mm")
    stack_height_forefoot: float = Field(..., ge=0, description="Forefoot stack height in mm")
    image_url: Optional[str] = None


class ShoeUpdate(BaseModel):
    """Schema for updating a shoe"""
    brand: Optional[str] = Field(None, min_length=1, max_length=100)
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[ShoeCategory] = None
    tags: Optional[List[ShoeTag]] = None
    weight: Optional[float] = Field(None, gt=0)
    drop: Optional[float] = Field(None, ge=0)
    stack_height_heel: Optional[float] = Field(None, ge=0)
    stack_height_forefoot: Optional[float] = Field(None, ge=0)
    image_url: Optional[str] = None


class ShoeResponse(BaseModel):
    """Schema for shoe response"""
    id: str
    brand: str
    name: str
    category: str  # Stored as string in DB
    tags: List[str]  # Stored as text[] in DB, accept strings
    weight: float
    drop: float
    stack_height_heel: float
    stack_height_forefoot: float
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ Rotation Shoe Schemas ============

class RotationShoeCreate(BaseModel):
    """Schema for adding a shoe to rotation"""
    shoe_id: str
    start_date: Optional[datetime] = None  # Defaults to now if not provided


class RotationShoeResponse(ShoeResponse):
    """Schema for rotation shoe response"""
    start_date: datetime
    user_id: str

    class Config:
        from_attributes = True


# ============ Retired Shoe Schemas ============

class RetiredShoeCreate(BaseModel):
    """Schema for retiring a shoe (moving from rotation to graveyard)"""
    shoe_id: str
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    review: Optional[str] = Field(None, max_length=1000)
    miles_run: Optional[float] = Field(None, ge=0)


class RetiredShoeResponse(ShoeResponse):
    """Schema for retired shoe response"""
    retired_at: datetime
    rating: int
    review: Optional[str] = None
    miles_run: Optional[float] = None
    user_id: str

    class Config:
        from_attributes = True
