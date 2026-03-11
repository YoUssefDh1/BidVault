from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from auth import get_current_admin
from database import get_db
from models import Category, SubCategory
from schemas import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    SubCategoryCreate, SubCategoryUpdate, SubCategoryResponse,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# CATEGORIES
# ---------------------------------------------------------------------------

@router.get("", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """Public — anyone can browse categories."""
    return db.query(Category).all()


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),   # admin only
):
    if db.query(Category).filter(Category.name == data.name).first():
        raise HTTPException(status_code=400, detail="Category name already exists")
    category = Category(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()


# ---------------------------------------------------------------------------
# SUBCATEGORIES
# ---------------------------------------------------------------------------

@router.get("/{category_id}/subcategories", response_model=List[SubCategoryResponse])
def list_subcategories(category_id: int, db: Session = Depends(get_db)):
    """Public — list all subcategories under a category."""
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category.subcategories


@router.post("/subcategories", response_model=SubCategoryResponse, status_code=201)
def create_subcategory(
    data: SubCategoryCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    if not db.get(Category, data.category_id):
        raise HTTPException(status_code=404, detail="Parent category not found")
    sub = SubCategory(**data.model_dump())
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.put("/subcategories/{sub_id}", response_model=SubCategoryResponse)
def update_subcategory(
    sub_id: int,
    data: SubCategoryUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    sub = db.get(SubCategory, sub_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(sub, field, value)
    db.commit()
    db.refresh(sub)
    return sub


@router.delete("/subcategories/{sub_id}", status_code=204)
def delete_subcategory(
    sub_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    sub = db.get(SubCategory, sub_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    db.delete(sub)
    db.commit()