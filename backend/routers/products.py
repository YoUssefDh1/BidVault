from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil, os, uuid

from auth import get_current_user
from database import get_db
from models import Product, Image, User
from schemas import ProductCreate, ProductUpdate, ProductResponse, ImageResponse

router = APIRouter()

UPLOAD_DIR = "uploads/products"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("", response_model=List[ProductResponse])
def list_products(
    status: Optional[str] = None,
    category_id: Optional[int] = None,
    subcategory_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if status:        query = query.filter(Product.status == status)
    if category_id:   query = query.filter(Product.category_id == category_id)
    if subcategory_id: query = query.filter(Product.subcategory_id == subcategory_id)
    if search:        query = query.filter(Product.title.ilike(f"%{search}%"))
    return query.order_by(Product.created_at.desc()).all()


@router.get("/seller/mine", response_model=List[ProductResponse])
def get_my_products(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(Product).filter(Product.seller_id == user.id).all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if data.end_date <= data.start_date:
        raise HTTPException(status_code=400, detail="end_date must be after start_date")
    product = Product(
        **data.model_dump(),
        seller_id=user.id,
        current_price=data.starting_price,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.post("/{product_id}/images", response_model=ImageResponse, status_code=201)
def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.seller_id != user.id:
        raise HTTPException(status_code=403, detail="You don't own this product")

    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image = Image(url=f"/uploads/products/{filename}", product_id=product_id)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.seller_id != user.id:
        raise HTTPException(status_code=403, detail="You don't own this product")
    if product.status == "active":
        raise HTTPException(status_code=400, detail="Cannot edit a product while its auction is active")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.seller_id != user.id:
        raise HTTPException(status_code=403, detail="You don't own this product")
    if product.status == "active":
        raise HTTPException(status_code=400, detail="Cannot delete a product with an active auction")
    db.delete(product)
    db.commit()