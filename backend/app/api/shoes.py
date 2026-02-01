from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from supabase_auth.types import User

from app.core.auth import get_current_user, get_optional_user
from app.core.supabase import supabase_admin
from app.schemas.shoe import ShoeCreate, ShoeUpdate, ShoeResponse
from app.schemas.common import ApiResponse, PaginatedResponse
from app.models.shoe import ShoeCategory

router = APIRouter()


@router.get("", response_model=ApiResponse[List[ShoeResponse]])
async def get_shoes(
    category: Optional[ShoeCategory] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get all shoes from the shoe catalog.
    Supports filtering by category, brand, and search term.
    """
    try:
        query = supabase_admin.table("shoes").select("*", count="exact")
        
        if category:
            query = query.eq("category", category.value)
        
        if brand:
            query = query.ilike("brand", f"%{brand}%")
        
        if search:
            query = query.or_(f"name.ilike.%{search}%,brand.ilike.%{search}%")
        
        # Pagination
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        
        response = query.execute()
        
        shoes = [ShoeResponse(**shoe) for shoe in (response.data or [])]
        
        return ApiResponse(
            data=shoes,
            success=True
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch shoes: {str(e)}"
        )


@router.get("/{shoe_id}", response_model=ApiResponse[ShoeResponse])
async def get_shoe(shoe_id: str):
    """
    Get a single shoe by ID.
    """
    try:
        response = supabase_admin.table("shoes").select("*").eq(
            "id", shoe_id
        ).single().execute()
        
        if response.data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shoe not found"
            )
        
        return ApiResponse(
            data=ShoeResponse(**response.data),
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch shoe: {str(e)}"
        )


@router.post("", response_model=ApiResponse[ShoeResponse], status_code=status.HTTP_201_CREATED)
async def create_shoe(
    shoe: ShoeCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new shoe in the catalog.
    Note: In production, this might be admin-only.
    """
    try:
        shoe_data = shoe.model_dump()
        shoe_data["tags"] = [tag.value for tag in shoe.tags]
        shoe_data["category"] = shoe.category.value
        
        response = supabase_admin.table("shoes").insert(shoe_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create shoe"
            )
        
        return ApiResponse(
            data=ShoeResponse(**response.data[0]),
            success=True,
            message="Shoe created successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create shoe: {str(e)}"
        )


@router.patch("/{shoe_id}", response_model=ApiResponse[ShoeResponse])
async def update_shoe(
    shoe_id: str,
    shoe_update: ShoeUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update a shoe in the catalog.
    Note: In production, this might be admin-only.
    """
    try:
        update_data = shoe_update.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Convert enums to values
        if "tags" in update_data:
            update_data["tags"] = [tag.value for tag in update_data["tags"]]
        if "category" in update_data:
            update_data["category"] = update_data["category"].value
        
        response = supabase_admin.table("shoes").update(update_data).eq(
            "id", shoe_id
        ).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shoe not found"
            )
        
        return ApiResponse(
            data=ShoeResponse(**response.data[0]),
            success=True,
            message="Shoe updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update shoe: {str(e)}"
        )


@router.delete("/{shoe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shoe(
    shoe_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a shoe from the catalog.
    Note: In production, this might be admin-only.
    """
    try:
        response = supabase_admin.table("shoes").delete().eq(
            "id", shoe_id
        ).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shoe not found"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete shoe: {str(e)}"
        )
