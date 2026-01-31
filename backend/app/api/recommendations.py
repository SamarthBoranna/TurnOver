from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from gotrue.types import User

from app.core.auth import get_current_user
from app.core.supabase import supabase_admin
from app.schemas.shoe import ShoeResponse
from app.schemas.common import ApiResponse
from app.models.shoe import ShoeCategory
from app.models.recommendation import Recommendation, RecommendationResponse

router = APIRouter()


def calculate_recommendation_score(
    shoe: dict,
    user_preferences: dict,
    top_rated_shoes: List[dict]
) -> tuple[float, str]:
    """
    Calculate a recommendation score for a shoe based on user preferences.
    Returns a tuple of (score, explanation).
    
    This is a simplified scoring algorithm. In production, you might use:
    - Machine learning models
    - Collaborative filtering
    - More sophisticated tag matching
    """
    score = 0.0
    explanations = []
    
    shoe_tags = set(shoe.get("tags", []))
    
    # Category preference matching
    preferred_categories = user_preferences.get("preferred_categories", [])
    if shoe.get("category") in preferred_categories:
        score += 0.2
        explanations.append(f"matches your preferred {shoe.get('category')} category")
    
    # Tag similarity with top-rated shoes
    if top_rated_shoes:
        all_loved_tags = set()
        loved_brands = set()
        
        for rated_shoe in top_rated_shoes:
            all_loved_tags.update(rated_shoe.get("tags", []))
            loved_brands.add(rated_shoe.get("brand"))
        
        # Tag overlap score
        if all_loved_tags:
            tag_overlap = len(shoe_tags & all_loved_tags) / len(all_loved_tags)
            score += tag_overlap * 0.5
            
            matching_tags = shoe_tags & all_loved_tags
            if matching_tags:
                explanations.append(f"shares {', '.join(list(matching_tags)[:3])} with your top-rated shoes")
        
        # Brand affinity
        if shoe.get("brand") in loved_brands:
            score += 0.15
            explanations.append(f"you've loved {shoe.get('brand')} shoes before")
    
    # Weight preference (assuming lighter is generally preferred for performance)
    weight = shoe.get("weight", 300)
    if weight < 220:
        score += 0.1
        explanations.append("lightweight design")
    elif weight < 250:
        score += 0.05
    
    # Normalize score to 0-1 range
    score = min(score, 1.0)
    
    # Generate explanation
    if not explanations:
        explanation = "A versatile option that could complement your rotation."
    else:
        explanation = "Recommended because " + ", and ".join(explanations[:2]) + "."
    
    return round(score, 2), explanation


@router.get("", response_model=ApiResponse[RecommendationResponse])
async def get_recommendations(
    category: Optional[ShoeCategory] = None,
    limit: int = Query(default=5, ge=1, le=20),
    current_user: User = Depends(get_current_user)
):
    """
    Get personalized shoe recommendations based on user's graveyard ratings
    and preferences.
    """
    try:
        # Fetch user profile for preferences
        profile_response = supabase_admin.table("profiles").select("*").eq(
            "user_id", current_user.id
        ).single().execute()
        
        user_preferences = profile_response.data or {}
        
        # Fetch user's top-rated shoes from graveyard
        graveyard_response = supabase_admin.table("graveyard").select(
            "*, shoes(*)"
        ).eq("user_id", current_user.id).gte("rating", 4).order(
            "rating", desc=True
        ).limit(5).execute()
        
        top_rated_shoes = [
            item.get("shoes", {}) for item in (graveyard_response.data or [])
        ]
        
        # Get shoes not in user's rotation or graveyard
        rotation_response = supabase_admin.table("rotation").select(
            "shoe_id"
        ).eq("user_id", current_user.id).execute()
        
        graveyard_ids_response = supabase_admin.table("graveyard").select(
            "shoe_id"
        ).eq("user_id", current_user.id).execute()
        
        excluded_ids = set()
        for item in (rotation_response.data or []):
            excluded_ids.add(item.get("shoe_id"))
        for item in (graveyard_ids_response.data or []):
            excluded_ids.add(item.get("shoe_id"))
        
        # Fetch all shoes (excluding ones user already has)
        shoes_query = supabase_admin.table("shoes").select("*")
        
        if category:
            shoes_query = shoes_query.eq("category", category.value)
        
        shoes_response = shoes_query.execute()
        
        available_shoes = [
            shoe for shoe in (shoes_response.data or [])
            if shoe.get("id") not in excluded_ids
        ]
        
        # Calculate scores and generate recommendations
        recommendations = []
        for shoe in available_shoes:
            score, explanation = calculate_recommendation_score(
                shoe, user_preferences, top_rated_shoes
            )
            
            if score > 0.1:  # Only include shoes with meaningful scores
                recommendations.append(Recommendation(
                    shoe=ShoeResponse(**shoe),
                    score=score,
                    explanation=explanation
                ))
        
        # Sort by score and limit
        recommendations.sort(key=lambda r: r.score, reverse=True)
        recommendations = recommendations[:limit]
        
        based_on = [shoe.get("id") for shoe in top_rated_shoes]
        
        return ApiResponse(
            data=RecommendationResponse(
                recommendations=recommendations,
                based_on_shoes=based_on
            ),
            success=True
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}"
        )


@router.get("/similar/{shoe_id}", response_model=ApiResponse[List[Recommendation]])
async def get_similar_shoes(
    shoe_id: str,
    limit: int = Query(default=3, ge=1, le=10),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get shoes similar to a specific shoe based on tags and category.
    """
    try:
        # Fetch the reference shoe
        shoe_response = supabase_admin.table("shoes").select("*").eq(
            "id", shoe_id
        ).single().execute()
        
        if shoe_response.data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shoe not found"
            )
        
        reference_shoe = shoe_response.data
        reference_tags = set(reference_shoe.get("tags", []))
        reference_category = reference_shoe.get("category")
        
        # Fetch all other shoes
        all_shoes_response = supabase_admin.table("shoes").select("*").neq(
            "id", shoe_id
        ).execute()
        
        # Calculate similarity scores
        similar_shoes = []
        for shoe in (all_shoes_response.data or []):
            shoe_tags = set(shoe.get("tags", []))
            
            # Calculate tag similarity
            if reference_tags:
                tag_similarity = len(reference_tags & shoe_tags) / len(reference_tags | shoe_tags)
            else:
                tag_similarity = 0
            
            # Category bonus
            category_bonus = 0.3 if shoe.get("category") == reference_category else 0
            
            score = min((tag_similarity * 0.7) + category_bonus, 1.0)
            
            if score > 0.2:
                matching_tags = list(reference_tags & shoe_tags)
                if matching_tags:
                    explanation = f"Similar {', '.join(matching_tags[:3])} characteristics"
                else:
                    explanation = f"Similar {reference_category} shoe"
                
                similar_shoes.append(Recommendation(
                    shoe=ShoeResponse(**shoe),
                    score=round(score, 2),
                    explanation=explanation
                ))
        
        # Sort and limit
        similar_shoes.sort(key=lambda r: r.score, reverse=True)
        similar_shoes = similar_shoes[:limit]
        
        return ApiResponse(
            data=similar_shoes,
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to find similar shoes: {str(e)}"
        )
