from datetime import datetime, timedelta
from database import SessionLocal
from models import Auction, Product

db = SessionLocal()
now = datetime.utcnow()

auctions = db.query(Auction).all()
active_i = scheduled_i = closed_i = 0

for a in auctions:
    # Decide type based on original status label
    # Closed ones stay closed, others get refreshed
    if a.status == "closed" and closed_i < 5:
        a.start_date = now - timedelta(days=7 + closed_i)
        a.end_date   = now - timedelta(days=1 + closed_i)
        a.product.status = "closed"
        closed_i += 1
    else:
        # Reset to active
        a.start_date = now - timedelta(hours=3 + active_i * 2)
        a.end_date   = now + timedelta(hours=24 + active_i * 8)
        a.status     = "active"
        a.product.status = "active"
        active_i += 1

    print(f"✅ [{a.status.upper():9}] '{a.product.title}'  → ends {a.end_date.strftime('%Y-%m-%d %H:%M')}")

db.commit()
db.close()
print(f"\n🎉 Done! {active_i} active, {closed_i} closed.")