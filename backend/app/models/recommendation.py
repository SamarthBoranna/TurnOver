from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class RecommendedShoe(BaseModel):
    """Shoe model for recommendations (simplified, no enum conversion needed)"""
    id: str
    brand: str
    name: str
    category: str
    tags: List[str]
    weight: float
    drop: float
    stack_height_heel: float
    stack_height_forefoot: float
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Recommendation(BaseModel):
    """Shoe recommendation with match score"""
    shoe: RecommendedShoe
    score: float  # 0.0 to 1.0 match score
    explanation: str

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    """Response model for recommendations endpoint"""
    recommendations: List[Recommendation]
    based_on_shoes: List[str]  # IDs of shoes used to generate recommendations
