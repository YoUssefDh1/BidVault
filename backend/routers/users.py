from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional

from auth import get_current_user, hash_password, verify_password, create_access_token
from database import get_db
from models import User, Bid, Product, Auction, Notification
from schemas import Token

router = APIRouter()


@router.get("/me/stats")
def get_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    bids        = db.query(Bid).filter(Bid.bidder_id == user.id).all()
    listings    = db.query(Product).filter(Product.seller_id == user.id).count()
    total_spent = sum(b.amount for b in bids) if bids else 0
    wins        = db.query(Auction).filter(Auction.winner_id == user.id).count()
    return {
        "total_bids":     len(bids),
        "total_listings": listings,
        "total_spent":    total_spent,
        "total_wins":     wins,
    }


@router.get("/me/wins")
def get_wins(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    auctions = db.query(Auction).filter(Auction.winner_id == user.id).all()
    return [
        {
            "id":            a.id,
            "product_title": a.product.title,
            "product_image": a.product.images[0].url if a.product.images else None,
            "final_price":   a.product.current_price,
            "end_date":      a.end_date,
            "status":        a.status,
        }
        for a in auctions
    ]


@router.get("/me/notifications")
def get_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    notifs = db.query(Notification).filter(
        Notification.user_id == user.id
    ).order_by(Notification.date.desc()).limit(20).all()
    return [
        {
            "id":      n.id,
            "message": n.message,
            "date":    n.date,
            "status":  n.status,
        }
        for n in notifs
    ]


@router.post("/me/notifications/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    n = db.get(Notification, notif_id)
    if not n or n.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    n.status = "read"
    db.commit()
    return {"ok": True}


@router.post("/me/notifications/read-all")
def mark_all_read(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.query(Notification).filter(
        Notification.user_id == user.id, Notification.status == "unread"
    ).update({"status": "read"})
    db.commit()
    return {"ok": True}


class ProfileUpdate(BaseModel):
    name:             Optional[str] = None
    city:             Optional[str] = None
    country:          Optional[str] = None
    current_password: Optional[str] = None
    new_password:     Optional[str] = None


@router.get("/me")
def get_me(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return {
        "id":         user.id,
        "name":       user.name,
        "email":      user.email,
        "city":       user.city,
        "country":    user.country,
        "created_at": user.created_at,
    }


@router.put("/me", response_model=Token)
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if data.name:    user.name    = data.name
    if data.city is not None:    user.city    = data.city
    if data.country is not None: user.country = data.country
    if data.new_password:
        if not data.current_password:
            raise HTTPException(status_code=400, detail="Current password is required")
        if not verify_password(data.current_password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        if len(data.new_password) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
        user.hashed_password = hash_password(data.new_password)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": "user"})
    return Token(access_token=token, role="user")


# ── Favourites ────────────────────────────────────────────────
@router.get("/me/favourites")
def get_favourites(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.execute(
        text("SELECT auction_id FROM favourites WHERE user_id = :uid"),
        {"uid": user.id}
    ).fetchall()
    ids = [r[0] for r in rows]
    auctions = db.query(Auction).filter(Auction.id.in_(ids)).all() if ids else []
    return [
        {
            "id":            a.id,
            "status":        a.status,
            "end_date":      a.end_date,
            "product_title": a.product.title,
            "product_image": a.product.images[0].url if a.product.images else None,
            "current_price": a.product.current_price,
            "bid_count":     len(a.bids),
        }
        for a in auctions
    ]


@router.post("/me/favourites/{auction_id}")
def add_favourite(auction_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not db.get(Auction, auction_id):
        raise HTTPException(status_code=404, detail="Auction not found")
    existing = db.execute(
        text("SELECT 1 FROM favourites WHERE user_id=:uid AND auction_id=:aid"),
        {"uid": user.id, "aid": auction_id}
    ).fetchone()
    if not existing:
        db.execute(
            text("INSERT INTO favourites (user_id, auction_id) VALUES (:uid, :aid)"),
            {"uid": user.id, "aid": auction_id}
        )
        db.commit()
    return {"ok": True}


@router.delete("/me/favourites/{auction_id}")
def remove_favourite(auction_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.execute(
        text("DELETE FROM favourites WHERE user_id=:uid AND auction_id=:aid"),
        {"uid": user.id, "aid": auction_id}
    )
    db.commit()
    return {"ok": True}


@router.get("/me/favourites/ids")
def get_favourite_ids(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.execute(
        text("SELECT auction_id FROM favourites WHERE user_id = :uid"),
        {"uid": user.id}
    ).fetchall()
    return [r[0] for r in rows]