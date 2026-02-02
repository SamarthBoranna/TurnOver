from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List, Tuple
from datetime import datetime
from supabase_auth.types import User
from supabase import Client

from app.core.auth import get_current_user_with_client
from app.core.supabase import supabase_admin
from app.schemas.shoe import RetiredShoeCreate, RetiredShoeResponse
from app.schemas.common import ApiResponse
from app.models.shoe import ShoeCategory

router = APIRouter()


@router.get("", response_model=ApiResponse[List[RetiredShoeResponse]])
async def get_graveyard(
    category: Optional[ShoeCategory] = None,
    min_rating: Optional[int] = Query(None, ge=1, le=5),
    sort_by: Optional[str] = Query("retired_at", regex="^(retired_at|rating|name|brand)$"),
    sort_order: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    auth: Tuple[User, Client] = Depends(get_current_user_with_client)
):
    """
    Get all shoes in the current user's graveyard (retired shoes).
    """
    current_user, db = auth
    
    try:
        # Join graveyard with shoes table to get full shoe details
        query = db.table("graveyard").select(
            "*, shoes(*)"
        ).eq("user_id", current_user.id)
        
        if category:
            query = query.eq("shoes.category", category.value)
        
        if min_rating:
            query = query.gte("rating", min_rating)
        
        # Handle sorting
        if sort_by in ["name", "brand"]:
            # These are in the shoes table
            query = query.order(f"shoes.{sort_by}", desc=(sort_order == "desc"))
        else:
            query = query.order(sort_by, desc=(sort_order == "desc"))
        
        response = query.execute()
        
        # Transform the joined data
        retired_shoes = []
        for item in (response.data or []):
            shoe_data = item.get("shoes", {})
            retired_shoes.append(RetiredShoeResponse(
                id=shoe_data.get("id"),
                graveyard_id=item.get("id"),  # Unique graveyard entry ID
                brand=shoe_data.get("brand"),
                name=shoe_data.get("name"),
                category=shoe_data.get("category"),
                tags=shoe_data.get("tags", []),
                weight=shoe_data.get("weight"),
                drop=shoe_data.get("drop"),
                stack_height_heel=shoe_data.get("stack_height_heel"),
                stack_height_forefoot=shoe_data.get("stack_height_forefoot"),
                image_url=shoe_data.get("image_url"),
                retired_at=item.get("retired_at"),
                rating=item.get("rating"),
                review=item.get("review"),
                miles_run=item.get("miles_run"),
                user_id=item.get("user_id"),
            ))
        
        return ApiResponse(
            data=retired_shoes,
            success=True
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch graveyard: {str(e)}"
        )


@router.post("", response_model=ApiResponse[RetiredShoeResponse], status_code=status.HTTP_201_CREATED)
async def retire_shoe(
    retired_shoe: RetiredShoeCreate,
    auth: Tuple[User, Client] = Depends(get_current_user_with_client)
):
    """
    Retire a shoe - moves it from rotation to graveyard with a rating.
    """
    current_user, db = auth
    
    try:
        # Check if shoe exists in user's rotation
        rotation_response = db.table("rotation").select(
            "*, shoes(*)"
        ).eq("user_id", current_user.id).eq("shoe_id", retired_shoe.shoe_id).single().execute()
        
        if rotation_response.data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shoe not found in your rotation"
            )
        
        shoe_data = rotation_response.data.get("shoes", {})
        
        # Note: We allow the same shoe to be in graveyard multiple times
        # (common for runners who buy the same shoe repeatedly)
        
        # Add to graveyard
        graveyard_data = {
            "user_id": current_user.id,
            "shoe_id": retired_shoe.shoe_id,
            "retired_at": datetime.utcnow().isoformat(),
            "rating": retired_shoe.rating,
            "review": retired_shoe.review,
            "miles_run": retired_shoe.miles_run,
        }
        
        graveyard_response = db.table("graveyard").insert(graveyard_data).execute()
        
        if not graveyard_response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to add shoe to graveyard"
            )
        
        # Remove from rotation
        db.table("rotation").delete().eq(
            "user_id", current_user.id
        ).eq("shoe_id", retired_shoe.shoe_id).execute()
        
        return ApiResponse(
            data=RetiredShoeResponse(
                id=shoe_data.get("id"),
                graveyard_id=graveyard_response.data[0].get("id"),  # Unique graveyard entry ID
                brand=shoe_data.get("brand"),
                name=shoe_data.get("name"),
                category=shoe_data.get("category"),
                tags=shoe_data.get("tags", []),
                weight=shoe_data.get("weight"),
                drop=shoe_data.get("drop"),
                stack_height_heel=shoe_data.get("stack_height_heel"),
                stack_height_forefoot=shoe_data.get("stack_height_forefoot"),
                image_url=shoe_data.get("image_url"),
                retired_at=graveyard_response.data[0].get("retired_at"),
                rating=retired_shoe.rating,
                review=retired_shoe.review,
                miles_run=retired_shoe.miles_run,
                user_id=current_user.id,
            ),
            success=True,
            message="Shoe retired successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retire shoe: {str(e)}"
        )


@router.patch("/{graveyard_id}", response_model=ApiResponse[RetiredShoeResponse])
async def update_retired_shoe(
    graveyard_id: str,
    rating: Optional[int] = Query(None, ge=1, le=5),
    review: Optional[str] = None,
    miles_run: Optional[float] = Query(None, ge=0),
    auth: Tuple[User, Client] = Depends(get_current_user_with_client)
):
    """
    Update a retired shoe's rating, review, or miles.
    Uses graveyard_id to uniquely identify the entry (same shoe can appear multiple times).
    """
    current_user, db = auth
    
    try:
        update_data = {}
        if rating is not None:
            update_data["rating"] = rating
        if review is not None:
            update_data["review"] = review
        if miles_run is not None:
            update_data["miles_run"] = miles_run
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        response = db.table("graveyard").update(update_data).eq(
            "user_id", current_user.id
        ).eq("id", graveyard_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entry not found in your graveyard"
            )
        
        # Fetch full shoe data
        full_response = db.table("graveyard").select(
            "*, shoes(*)"
        ).eq("user_id", current_user.id).eq("id", graveyard_id).single().execute()
        
        item = full_response.data
        shoe_data = item.get("shoes", {})
        
        return ApiResponse(
            data=RetiredShoeResponse(
                id=shoe_data.get("id"),
                graveyard_id=item.get("id"),
                brand=shoe_data.get("brand"),
                name=shoe_data.get("name"),
                category=shoe_data.get("category"),
                tags=shoe_data.get("tags", []),
                weight=shoe_data.get("weight"),
                drop=shoe_data.get("drop"),
                stack_height_heel=shoe_data.get("stack_height_heel"),
                stack_height_forefoot=shoe_data.get("stack_height_forefoot"),
                image_url=shoe_data.get("image_url"),
                retired_at=item.get("retired_at"),
                rating=item.get("rating"),
                review=item.get("review"),
                miles_run=item.get("miles_run"),
                user_id=item.get("user_id"),
            ),
            success=True,
            message="Retired shoe updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update retired shoe: {str(e)}"
        )


@router.delete("/{graveyard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_from_graveyard(
    graveyard_id: str,
    auth: Tuple[User, Client] = Depends(get_current_user_with_client)
):
    """
    Remove an entry from the graveyard permanently.
    Uses graveyard_id to uniquely identify the entry (same shoe can appear multiple times).
    """
    current_user, db = auth
    
    try:
        response = db.table("graveyard").delete().eq(
            "user_id", current_user.id
        ).eq("id", graveyard_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entry not found in your graveyard"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete entry from graveyard: {str(e)}"
        )
