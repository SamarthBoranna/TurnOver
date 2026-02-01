from fastapi import APIRouter, Depends, HTTPException, status
from typing import Tuple
from supabase_auth.types import User
from supabase import Client

from app.core.auth import get_current_user_with_client
from app.core.supabase import supabase_admin
from app.schemas.user import UserProfileResponse, UserProfileUpdate
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("/me", response_model=ApiResponse[UserProfileResponse])
async def get_current_user_profile(
    auth: Tuple[User, Client] = Depends(get_current_user_with_client)
):
    """
    Get the current authenticated user's profile.
    """
    current_user, db = auth
    
    try:
        response = db.table("profiles").select("*").eq(
            "user_id", current_user.id
        ).single().execute()
        
        if response.data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return ApiResponse(
            data=UserProfileResponse(**response.data),
            success=True
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile: {str(e)}"
        )


@router.patch("/me", response_model=ApiResponse[UserProfileResponse])
async def update_current_user_profile(
    profile_update: UserProfileUpdate,
    auth: Tuple[User, Client] = Depends(get_current_user_with_client)
):
    """
    Update the current authenticated user's profile.
    """
    current_user, db = auth
    
    try:
        update_data = profile_update.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        response = db.table("profiles").update(update_data).eq(
            "user_id", current_user.id
        ).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return ApiResponse(
            data=UserProfileResponse(**response.data[0]),
            success=True,
            message="Profile updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.get("/{user_id}/stats")
async def get_user_stats(
    user_id: str,
    auth: Tuple[User, Client] = Depends(get_current_user_with_client)
):
    """
    Get user's shoe statistics.
    Only accessible by the user themselves.
    """
    current_user, db = auth
    
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user's stats"
        )
    
    try:
        # Count rotation shoes
        rotation_count = db.table("rotation").select(
            "id", count="exact"
        ).eq("user_id", user_id).execute()
        
        # Count graveyard shoes
        graveyard_response = db.table("graveyard").select(
            "id, rating"
        ).eq("user_id", user_id).execute()
        
        graveyard_count = len(graveyard_response.data) if graveyard_response.data else 0
        avg_rating = 0.0
        
        if graveyard_response.data:
            ratings = [s["rating"] for s in graveyard_response.data]
            avg_rating = sum(ratings) / len(ratings)
        
        return ApiResponse(
            data={
                "active_shoes": rotation_count.count or 0,
                "retired_shoes": graveyard_count,
                "total_shoes": (rotation_count.count or 0) + graveyard_count,
                "avg_rating": round(avg_rating, 1),
            },
            success=True
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stats: {str(e)}"
        )
