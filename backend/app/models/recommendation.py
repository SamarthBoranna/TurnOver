from pydantic import BaseModel
from typing import List

from app.models.shoe import Shoe


class Recommendation(BaseModel):
    """Shoe recommendation with match score"""
    shoe: Shoe
    score: float  # 0.0 to 1.0 match score
    explanation: str

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    """Response model for recommendations endpoint"""
    recommendations: List[Recommendation]
    based_on_shoes: List[str]  # IDs of shoes used to generate recommendations
