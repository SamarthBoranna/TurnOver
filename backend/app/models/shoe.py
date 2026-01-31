from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


class ShoeCategory(str, Enum):
    """Shoe category types"""
    DAILY = "daily"
    WORKOUT = "workout"
    RACE = "race"


class ShoeTag(str, Enum):
    """Shoe characteristic tags"""
    CUSHIONED = "cushioned"
    RESPONSIVE = "responsive"
    LIGHTWEIGHT = "lightweight"
    STABLE = "stable"
    NEUTRAL = "neutral"
    PLUSH = "plush"
    FIRM = "firm"
    BREATHABLE = "breathable"
    DURABLE = "durable"
    VERSATILE = "versatile"
    FAST = "fast"
    COMFORTABLE = "comfortable"


class ShoeBase(BaseModel):
    """Base shoe model with common fields"""
    brand: str
    name: str
    category: ShoeCategory
    tags: List[ShoeTag]
    weight: float  # in grams
    drop: float  # in mm
    stack_height_heel: float  # in mm
    stack_height_forefoot: float  # in mm
    image_url: Optional[str] = None


class Shoe(ShoeBase):
    """Complete shoe model with ID"""
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RotationShoe(Shoe):
    """Shoe in active rotation"""
    user_id: str
    start_date: datetime

    class Config:
        from_attributes = True


class RetiredShoe(Shoe):
    """Retired shoe in graveyard"""
    user_id: str
    retired_at: datetime
    rating: int  # 1-5
    review: Optional[str] = None
    miles_run: Optional[float] = None

    class Config:
        from_attributes = True
