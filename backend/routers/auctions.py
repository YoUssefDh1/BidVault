from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from auth import get_current_admin, get_current_user
from database import get_db
from models import Auction, Product
from schemas import AuctionCreate, AuctionUpdate, AuctionResponse

router = APIRouter()


def enrich(auction: Auction) -> AuctionResponse:
    data = AuctionResponse.model_validate(auction)
    data.bid_count = len(auction.bids)
    return data


@router.get("", response_model=List[AuctionResponse])
def list_auctions(
    status: Optional[str] = None,
    category_id: Optional[int] = None,
    subcategory_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,   # "ending_soon" | "most_bids" | "newest" | "price_asc" | "price_desc"
    db: Session = Depends(get_db),
):
    _sync_statuses(db)
    query = db.query(Auction).join(Auction.product)
    if status:         query = query.filter(Auction.status == status)
    if category_id:    query = query.filter(Product.category_id == category_id)
    if subcategory_id: query = query.filter(Product.subcategory_id == subcategory_id)
    if search:         query = query.filter(Product.title.ilike(f"%{search}%"))
    if min_price:      query = query.filter(Product.current_price >= min_price)
    if max_price:      query = query.filter(Product.current_price <= max_price)

    auctions = query.all()
    enriched = [enrich(a) for a in auctions]

    if sort_by == "ending_soon":
        enriched.sort(key=lambda a: a.end_date)
    elif sort_by == "most_bids":
        enriched.sort(key=lambda a: a.bid_count or 0, reverse=True)
    elif sort_by == "newest":
        enriched.sort(key=lambda a: a.created_at, reverse=True)
    elif sort_by == "price_asc":
        enriched.sort(key=lambda a: a.product.current_price)
    elif sort_by == "price_desc":
        enriched.sort(key=lambda a: a.product.current_price, reverse=True)
    else:
        enriched.sort(key=lambda a: a.start_date, reverse=True)

    return enriched


@router.get("/{auction_id}", response_model=AuctionResponse)
def get_auction(auction_id: int, db: Session = Depends(get_db)):
    _sync_statuses(db)
    auction = db.get(Auction, auction_id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    return enrich(auction)


@router.post("", response_model=AuctionResponse, status_code=201)
def create_auction(
    data: AuctionCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    product = db.get(Product, data.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.seller_id != user.id:
        raise HTTPException(status_code=403, detail="You don't own this product")
    if data.end_date <= data.start_date:
        raise HTTPException(status_code=400, detail="end_date must be after start_date")

    existing = db.query(Auction).filter(
        Auction.product_id == data.product_id,
        Auction.status.in_(["scheduled", "active"])
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="This product already has a running auction")

    product.current_price = product.starting_price
    product.status = "active"
    auction = Auction(product_id=data.product_id, start_date=data.start_date, end_date=data.end_date)
    db.add(auction)
    db.commit()
    db.refresh(auction)
    return enrich(auction)


@router.put("/{auction_id}", response_model=AuctionResponse)
def update_auction(
    auction_id: int,
    data: AuctionUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    auction = db.get(Auction, auction_id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(auction, field, value)
    db.commit()
    db.refresh(auction)
    return enrich(auction)


@router.post("/{auction_id}/close", response_model=AuctionResponse)
def close_auction(
    auction_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    auction = db.get(Auction, auction_id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    if auction.status == "closed":
        raise HTTPException(status_code=400, detail="Auction is already closed")
    _close(auction, db)
    db.commit()
    db.refresh(auction)
    return enrich(auction)


@router.delete("/{auction_id}", status_code=204)
def delete_auction(
    auction_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    auction = db.get(Auction, auction_id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    if auction.status == "active":
        raise HTTPException(status_code=400, detail="Cannot delete an active auction")
    db.delete(auction)
    db.commit()


def _close(auction: Auction, db: Session):
    auction.status = "closed"
    auction.product.status = "closed"
    if auction.bids:
        winning_bid = max(auction.bids, key=lambda b: b.amount)
        auction.winner_id = winning_bid.bidder_id


def _sync_statuses(db: Session):
    now = datetime.utcnow()
    for a in db.query(Auction).filter(Auction.status == "scheduled", Auction.start_date <= now).all():
        a.status = "active"
        a.product.status = "active"
    for a in db.query(Auction).filter(Auction.status == "active", Auction.end_date <= now).all():
        _close(a, db)
    db.commit()