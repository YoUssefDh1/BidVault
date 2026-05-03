from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional, List


# ---------------------------------------------------------------------------
# USER SCHEMAS
# ---------------------------------------------------------------------------

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# ADMIN SCHEMAS
# ---------------------------------------------------------------------------

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# TOKEN
# ---------------------------------------------------------------------------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str   # "user" | "admin"


# ---------------------------------------------------------------------------
# CATEGORY SCHEMAS
# ---------------------------------------------------------------------------

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class SubCategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    model_config = {"from_attributes": True}

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    subcategories: List[SubCategoryResponse] = []
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# SUBCATEGORY SCHEMAS
# ---------------------------------------------------------------------------

class SubCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: int

class SubCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


# ---------------------------------------------------------------------------
# IMAGE SCHEMAS
# ---------------------------------------------------------------------------

class ImageResponse(BaseModel):
    id: int
    url: str
    created_at: datetime
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# PRODUCT SCHEMAS
# ---------------------------------------------------------------------------

class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    starting_price: float
    start_date: datetime
    end_date: datetime
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    bid_step: Optional[float] = None   # e.g. 0.10 = 10% minimum increment

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    starting_price: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    bid_step: Optional[float] = None

class ProductResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    starting_price: float
    current_price: float
    start_date: datetime
    end_date: datetime
    status: str
    created_at: datetime
    bid_step: Optional[float] = None
    seller: UserResponse
    category: Optional[CategoryResponse]
    images: List[ImageResponse] = []
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# AUCTION SCHEMAS
# ---------------------------------------------------------------------------

class AuctionCreate(BaseModel):
    product_id: int
    start_date: datetime
    end_date: datetime

class AuctionUpdate(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None

class AuctionResponse(BaseModel):
    id: int
    start_date: datetime
    end_date: datetime
    status: str
    created_at: datetime
    product: ProductResponse
    winner: Optional[UserResponse]
    bid_count: Optional[int] = 0
    model_config = {"from_attributes": True}