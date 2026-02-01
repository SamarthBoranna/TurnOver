from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List, Tuple
from datetime import datetime
from supabase_auth.types import User
from supabase import Client

from app.core.auth import get_current_user_with_client
from app.core.supabase import supabase_admin
from app.schemas.shoe import RotationShoeCreate, RotationShoeResponse
from app.schemas.common import ApiResponse
from app.models.shoe import ShoeCategory

router = APIRouter()


@router.get("", response_model=ApiResponse[List[RotationShoeResponse]])
async def get_rotation(
    category: Optional[ShoeCategory] = None,
    auth: Tuple[User, Client] = Depends(get_current_user_with_client)
):
    """
    Get all shoes in the current user's rotation.
    """
    current_user, db = auth
    
    try:
        # Join rotation with shoes table to get full shoe details
        query = db.table("rotation").select(
            "*, shoes(*)"
        ).eq("user_id", current_user.id)
        
        if category:
            query = query.eq("shoes.category", category.value)
        
        response = query.order("start_date", desc=True).execute()
        
        # Transform the joined data
        rotation_shoes = []
        for item in (response.data or []):
            shoe_data = item.get("shoes", {})
            rotation_shoes.append(RotationShoeResponse(
                id=shoe_data.get("id"),
                brand=shoe_data.get("brand"),
                name=shoe_data.get("name"),
                category=shoe_data.get("category"),
                tags=shoe_data.get("tags", []),
                weight=shoe_data.get("weight"),
                drop=shoe_data.get("drop"),
                stack_height_heel=shoe_data.get("stack_height_heel"),
                stack_height_forefoot=shoe_data.get("stack_height_forefoot"),
                image_url=shoe_data.get("image_url"),
                start_date=item.get("start_date"),
                user_id=item.get("user_id"),
            ))
        
        return ApiResponse(
            data=rotation_shoes,
            success=True
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch rotation: {str(e)}"
        )


@router.post("", response_model=ApiResponse[RotationShoeResponse], status_code=status.HTTP_201_CREATED)
async def add_to_rotation(
    rotation_shoe: RotationShoeCreate,
    auth: Tuple[User, Client] = Depends(get_current_user_with_client)
):
    """
    Add a shoe to the current user's rotation.
    """
    current_user, db = auth
    
    try:
        # Check if shoe exists (use admin client for public shoe data)
        shoe_response = supabase_admin.table("shoes").select("*").eq(
            "id", rotation_shoe.shoe_id
        ).single().execute()
        
        if shoe_response.data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shoe not found"
            )
        
        # Check if shoe is already in rotation (user context)
        existing = db.table("rotation").select("id").eq(
            "user_id", current_user.id
        ).eq("shoe_id", rotation_shoe.shoe_id).execute()
        
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Shoe is already in your rotation"
            )
        
        # Add to rotation (user context for RLS)
        rotation_data = {
            "user_id": current_user.id,
            "shoe_id": rotation_shoe.shoe_id,
            "start_date": (rotation_shoe.start_date or datetime.utcnow()).isoformat(),
        }
        
        response = db.table("rotation").insert(rotation_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to add shoe to rotation"
            )
        
        shoe = shoe_response.data
        return ApiResponse(
            data=RotationShoeResponse(
                id=shoe.get("id"),
                brand=shoe.get("brand"),
                name=shoe.get("name"),
                category=shoe.get("category"),
                tags=shoe.get("tags", []),
                weight=shoe.get("weight"),
                drop=shoe.get("drop"),
                stack_height_heel=shoe.get("stack_height_heel"),
                stack_height_forefoot=shoe.get("stack_height_forefoot"),
                image_url=shoe.get("image_url"),
                start_date=response.data[0].get("start_date"),
                user_id=current_user.id,
            ),
            success=True,
            message="Shoe added to rotation"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add shoe to rotation: {str(e)}"
        )


@router.delete("/{shoe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_rotation(
    shoe_id: str,
    auth: Tuple[User, Client] = Depends(get_current_user_with_client)
):
    """
    Remove a shoe from the current user's rotation (without retiring it).
    """
    current_user, db = auth
    
    try:
        response = db.table("rotation").delete().eq(
            "user_id", current_user.id
        ).eq("shoe_id", shoe_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shoe not found in your rotation"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove shoe from rotation: {str(e)}"
        )
