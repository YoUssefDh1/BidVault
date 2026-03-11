from datetime import datetime, timedelta
from database import SessionLocal, engine, Base
from models import User, Category, SubCategory, Product, Auction
from auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ── Create users if they don't exist ────────────────────────────
users_data = [
    {"name": "Fathi",     "email": "fathi123@gmail.com",   "password": "azerty123"},
    {"name": "Mourad",    "email": "Mourad007@gmail.com",   "password": "qwerty123"},
    {"name": "YoussefDh", "email": "youssefdh@gmail.com",   "password": "password445"},
]

users = {}
for u in users_data:
    existing = db.query(User).filter(User.email == u["email"]).first()
    if existing:
        print(f"⏭  User '{u['name']}' already exists — using existing account")
        users[u["name"]] = existing
    else:
        new_user = User(name=u["name"], email=u["email"], hashed_password=hash_password(u["password"]))
        db.add(new_user)
        db.flush()
        users[u["name"]] = new_user
        print(f"✅ Created user '{u['name']}'")

db.commit()

# ── Helper to get category/subcategory by name ──────────────────
def get_cat(name):
    return db.query(Category).filter(Category.name == name).first()

def get_sub(name):
    return db.query(SubCategory).filter(SubCategory.name == name).first()

now = datetime.utcnow()

# ── Products data ────────────────────────────────────────────────
# auction_type: "active" | "scheduled" | "closed"
products_data = [
    # ── MODERN ART ──
    {
        "title": "Abstract Cityscape No. 7",
        "description": "A bold expressionist canvas depicting a fragmented urban skyline. Oil on linen, 120x90cm. Signed and dated by the artist.",
        "starting_price": 1200,
        "category": "Modern Art", "subcategory": "Paintings",
        "seller": "Fathi",
        "auction_type": "active",
    },
    {
        "title": "Chrome Reflection Sculpture",
        "description": "Polished stainless steel abstract form, 45cm tall. Limited edition of 10. Certificate of authenticity included.",
        "starting_price": 3500,
        "category": "Modern Art", "subcategory": "Sculptures",
        "seller": "Mourad",
        "auction_type": "scheduled",
    },
    {
        "title": "Urban Decay Photography Series",
        "description": "Set of 5 large format prints documenting abandoned industrial sites. Archival pigment on Hahnemühle paper, framed.",
        "starting_price": 800,
        "category": "Modern Art", "subcategory": "Photography",
        "seller": "YoussefDh",
        "auction_type": "closed",
    },

    # ── AUTOMOTIVE ──
    {
        "title": "1972 Porsche 911 T Coupe",
        "description": "Fully restored, numbers matching. Painted in original Signal Orange. 2.4L flat-six engine, 5-speed manual. A pristine example of German engineering.",
        "starting_price": 95000,
        "category": "Automotive", "subcategory": "Classic Cars",
        "seller": "Fathi",
        "auction_type": "active",
    },
    {
        "title": "1965 Ford Mustang Fastback",
        "description": "K-code 289 High Performance V8. Rare original Wimbledon White with pony interior. Matching numbers, extensively documented history.",
        "starting_price": 72000,
        "category": "Automotive", "subcategory": "Classic Cars",
        "seller": "Mourad",
        "auction_type": "closed",
    },
    {
        "title": "Ducati Panigale V4 S 2023",
        "description": "Only 1,200km on the clock. Termignoni full exhaust system, Öhlins smart EC suspension. Immaculate condition, full service history.",
        "starting_price": 28000,
        "category": "Automotive", "subcategory": "Motorcycles",
        "seller": "YoussefDh",
        "auction_type": "scheduled",
    },

    # ── HOROLOGY ──
    {
        "title": "Rolex Submariner Date Ref. 116610LN",
        "description": "Full set with original box and papers. Circa 2018. Ceramic bezel, 300m water resistance. Unworn condition, still in protective stickers.",
        "starting_price": 14000,
        "category": "Horology", "subcategory": "Luxury Watches",
        "seller": "Fathi",
        "auction_type": "active",
    },
    {
        "title": "Patek Philippe Nautilus 5711/1A",
        "description": "The iconic steel sports watch. Blue dial, integrated bracelet. Complete set with all accessories. Last production year before discontinuation.",
        "starting_price": 120000,
        "category": "Horology", "subcategory": "Luxury Watches",
        "seller": "YoussefDh",
        "auction_type": "scheduled",
    },
    {
        "title": "Omega Speedmaster Moonwatch 1969",
        "description": "Vintage hand-wound chronograph. Cal. 321 movement. Tropical dial with original patina. NASA-issued reference, fully serviced.",
        "starting_price": 18500,
        "category": "Horology", "subcategory": "Vintage Watches",
        "seller": "Mourad",
        "auction_type": "closed",
    },

    # ── JEWELRY ──
    {
        "title": "3.2ct Emerald Cut Diamond Ring",
        "description": "GIA certified D/VS1 emerald cut diamond set in platinum. Custom Tiffany-style cathedral setting. Accompanied by full GIA grading report.",
        "starting_price": 42000,
        "category": "Jewelry & Gems", "subcategory": "Rings",
        "seller": "Mourad",
        "auction_type": "active",
    },
    {
        "title": "Vintage Cartier Panthère Necklace",
        "description": "18k yellow gold with pavé-set diamonds and onyx accents. Circa 1985. Original Cartier box and authenticity documentation.",
        "starting_price": 22000,
        "category": "Jewelry & Gems", "subcategory": "Necklaces",
        "seller": "Fathi",
        "auction_type": "closed",
    },

    # ── ELECTRONICS ──
    {
        "title": "Apple Mac Pro Tower 2023",
        "description": "M2 Ultra chip, 192GB unified memory, 8TB SSD. Apple Afterburner card included. Rack mount kit. Used for 3 months, perfect condition.",
        "starting_price": 8500,
        "category": "Electronics", "subcategory": "Laptops & Computers",
        "seller": "YoussefDh",
        "auction_type": "active",
    },
    {
        "title": "Vintage Sony Walkman TPS-L2 (1979)",
        "description": "The original Walkman. First generation model in original yellow/silver colorway. Working condition with original orange foam headphones.",
        "starting_price": 650,
        "category": "Electronics", "subcategory": "Vintage Electronics",
        "seller": "Mourad",
        "auction_type": "scheduled",
    },

    # ── FASHION ──
    {
        "title": "Hermès Birkin 35 — Togo Leather",
        "description": "Gold hardware, Fauve Barenia Togo leather. Pristine condition, never carried. Full set: box, dustbag, clochette, lock & keys, raincoat.",
        "starting_price": 18000,
        "category": "Fashion", "subcategory": "Handbags",
        "seller": "Fathi",
        "auction_type": "active",
    },
    {
        "title": "Nike Air Jordan 1 Retro High OG 'Chicago' 1985",
        "description": "Original 1985 production. Size US10. Yellowed soles and creasing consistent with age. Extremely rare original pair with original box.",
        "starting_price": 12000,
        "category": "Fashion", "subcategory": "Footwear",
        "seller": "YoussefDh",
        "auction_type": "closed",
    },

    # ── COLLECTIBLES ──
    {
        "title": "1952 Topps Mickey Mantle Rookie Card PSA 7",
        "description": "The holy grail of baseball cards. PSA graded NM 7. Centered, sharp corners, vibrant colors. One of the most coveted cards in the hobby.",
        "starting_price": 55000,
        "category": "Collectibles", "subcategory": "Sports Cards",
        "seller": "Mourad",
        "auction_type": "active",
    },
    {
        "title": "Amazing Fantasy #15 CGC 6.0 (1962)",
        "description": "First appearance of Spider-Man. CGC graded Fine 6.0. Cream to off-white pages. Steve Ditko cover art. A cornerstone of any serious collection.",
        "starting_price": 38000,
        "category": "Collectibles", "subcategory": "Comic Books",
        "seller": "Fathi",
        "auction_type": "scheduled",
    },
]

# ── Auction date helpers ─────────────────────────────────────────
def auction_dates(auction_type, idx):
    if auction_type == "active":
        start = now - timedelta(hours=6 + idx * 3)
        end   = now + timedelta(hours=18 + idx * 5)
    elif auction_type == "scheduled":
        start = now + timedelta(days=1 + idx)
        end   = now + timedelta(days=4 + idx)
    else:  # closed
        start = now - timedelta(days=7 + idx)
        end   = now - timedelta(days=1 + idx)
    return start, end

added = 0
skipped = 0
active_idx = scheduled_idx = closed_idx = 0

for p in products_data:
    if db.query(Product).filter(Product.title == p["title"]).first():
        print(f"⏭  Skipping '{p['title']}' — already exists")
        skipped += 1
        continue

    cat = get_cat(p["category"])
    sub = get_sub(p["subcategory"])
    seller = users[p["seller"]]

    if not cat:
        print(f"⚠️  Category '{p['category']}' not found — run seed_categories.py first!")
        continue

    product = Product(
        title=p["title"],
        description=p["description"],
        starting_price=p["starting_price"],
        current_price=p["starting_price"],
        start_date=now - timedelta(days=1),
        end_date=now + timedelta(days=7),
        status="active" if p["auction_type"] == "active" else ("closed" if p["auction_type"] == "closed" else "pending"),
        seller_id=seller.id,
        category_id=cat.id,
        subcategory_id=sub.id if sub else None,
    )
    db.add(product)
    db.flush()

    # Assign index per type for staggered dates
    atype = p["auction_type"]
    if atype == "active":      idx = active_idx;    active_idx += 1
    elif atype == "scheduled": idx = scheduled_idx; scheduled_idx += 1
    else:                      idx = closed_idx;    closed_idx += 1

    start, end = auction_dates(atype, idx)
    auction = Auction(
        product_id=product.id,
        start_date=start,
        end_date=end,
        status=atype,
    )
    db.add(auction)
    print(f"✅ [{atype.upper():9}] '{p['title']}' → seller: {p['seller']}")
    added += 1

db.commit()
db.close()
print(f"\n🎉 Done! {added} products added, {skipped} skipped.")
print(f"   Active: {active_idx} | Scheduled: {scheduled_idx} | Closed: {closed_idx}")