from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, List

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response wrapper"""
    data: T
    success: bool = True
    message: Optional[str] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response for list endpoints"""
    data: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class MessageResponse(BaseModel):
    """Simple message response"""
    success: bool
    message: str
