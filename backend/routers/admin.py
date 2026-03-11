from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from auth import get_current_admin
from database import get_db
from models import User, Auction, Bid, Product, Notification

router = APIRouter()


class StatsResponse(BaseModel):
    total_users: int
    total_products: int
    total_auctions: int
    active_auctions: int
    total_bids: int
    blocked_users: int


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return StatsResponse(
        total_users=db.query(User).count(),
        total_products=db.query(Product).count(),
        total_auctions=db.query(Auction).count(),
        active_auctions=db.query(Auction).filter(Auction.status == "active").count(),
        total_bids=db.query(Bid).count(),
        blocked_users=db.query(User).filter(User.is_active == False).count(),
    )


class UserAdminResponse(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


@router.get("/users", response_model=List[UserAdminResponse])
def list_users(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users/{user_id}/block", response_model=UserAdminResponse)
def block_user(user_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{user_id}/unblock", response_model=UserAdminResponse)
def unblock_user(user_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


@router.get("/auctions")
def list_all_auctions(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return [
        {
            "id": a.id,
            "product_title": a.product.title,
            "seller_name": a.product.seller.name,
            "status": a.status,
            "start_date": a.start_date,
            "end_date": a.end_date,
            "current_price": a.product.current_price,
            "bid_count": len(a.bids),
            "winner": a.winner.name if a.winner else None,
        }
        for a in db.query(Auction).order_by(Auction.created_at.desc()).all()
    ]


class NotificationCreate(BaseModel):
    message: str
    user_id: int


@router.post("/notifications", status_code=201)
def send_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    if not db.get(User, data.user_id):
        raise HTTPException(status_code=404, detail="User not found")
    db.add(Notification(message=data.message, user_id=data.user_id, status="unread"))
    db.commit()
    return {"message": "Notification sent"}