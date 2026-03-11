from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from auth import get_current_user
from database import get_db, SessionLocal
from models import Bid, Auction, Notification, User
from ws_manager import manager

router = APIRouter()


class BidCreate(BaseModel):
    auction_id: int
    amount: float

class BidResponse(BaseModel):
    id: int
    amount: float
    bid_date: datetime
    auction_id: int
    bidder_id: int
    bidder_name: str
    model_config = {"from_attributes": True}


@router.get("/auction/{auction_id}", response_model=List[BidResponse])
def get_bids(auction_id: int, db: Session = Depends(get_db)):
    auction = db.get(Auction, auction_id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    bids = db.query(Bid).filter(Bid.auction_id == auction_id).order_by(Bid.amount.desc()).all()
    return [
        BidResponse(
            id=b.id, amount=b.amount, bid_date=b.bid_date,
            auction_id=b.auction_id, bidder_id=b.bidder_id,
            bidder_name=b.bidder.name,
        ) for b in bids
    ]


@router.post("", response_model=BidResponse, status_code=201)
async def place_bid(
    data: BidCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    auction = db.get(Auction, data.auction_id)

    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    if auction.status != "active":
        raise HTTPException(status_code=400, detail="This auction is not active")
    if auction.product.seller_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot bid on your own product")
    if data.amount <= auction.product.current_price:
        raise HTTPException(
            status_code=400,
            detail=f"Bid must be higher than current price ({auction.product.current_price})"
        )

    bid = Bid(amount=data.amount, auction_id=data.auction_id, bidder_id=user.id, is_valid=True)
    db.add(bid)
    auction.product.current_price = data.amount

    # Notify previous highest bidder
    previous_bids = db.query(Bid).filter(Bid.auction_id == data.auction_id).order_by(Bid.amount.desc()).all()
    if previous_bids:
        prev_winner = previous_bids[0].bidder
        if prev_winner.id != user.id:
            db.add(Notification(
                message=f"You've been outbid on '{auction.product.title}'! New price: ${data.amount}",
                user_id=prev_winner.id,
                status="unread",
            ))

    db.commit()
    db.refresh(bid)

    await manager.broadcast(data.auction_id, {
        "event": "new_bid",
        "auction_id": data.auction_id,
        "bid_id": bid.id,
        "amount": data.amount,
        "bidder_name": user.name,
        "bidder_id": user.id,
        "bid_date": bid.bid_date.isoformat(),
        "viewer_count": manager.viewer_count(data.auction_id),
    })

    return BidResponse(
        id=bid.id, amount=bid.amount, bid_date=bid.bid_date,
        auction_id=bid.auction_id, bidder_id=bid.bidder_id,
        bidder_name=user.name,
    )


@router.websocket("/ws/{auction_id}")
async def auction_websocket(websocket: WebSocket, auction_id: int):
    db = SessionLocal()
    auction = db.get(Auction, auction_id)
    if not auction:
        db.close()
        await websocket.close(code=4004, reason="Auction not found")
        return

    current_price = auction.product.current_price
    auction_status = auction.status
    db.close()

    await manager.connect(websocket, auction_id)
    await websocket.send_json({
        "event": "connected",
        "auction_id": auction_id,
        "current_price": current_price,
        "status": auction_status,
        "viewer_count": manager.viewer_count(auction_id),
    })

    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"event": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, auction_id)
        await manager.broadcast(auction_id, {
            "event": "viewer_update",
            "viewer_count": manager.viewer_count(auction_id),
        })


@router.get("/mine", response_model=List[BidResponse])
def get_my_bids(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    bids = db.query(Bid).filter(Bid.bidder_id == user.id).order_by(Bid.bid_date.desc()).all()
    return [
        BidResponse(
            id=b.id, amount=b.amount, bid_date=b.bid_date,
            auction_id=b.auction_id, bidder_id=b.bidder_id,
            bidder_name=b.bidder.name,
        ) for b in bids
    ]