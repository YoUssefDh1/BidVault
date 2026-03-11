import os
import uuid
import requests
from database import SessionLocal, engine, Base
from models import Product, Image

Base.metadata.create_all(bind=engine)

UPLOAD_DIR = "uploads/products"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Map each product title to a specific Unsplash image search ──
# Using picsum.photos/seed/<word> gives consistent, themed images
product_images = {
    "Abstract Cityscape No. 7":             "https://picsum.photos/seed/cityart/800/600",
    "Chrome Reflection Sculpture":          "https://picsum.photos/seed/sculpture/800/600",
    "Urban Decay Photography Series":       "https://picsum.photos/seed/urbandecay/800/600",
    "1972 Porsche 911 T Coupe":             "https://picsum.photos/seed/porsche911/800/600",
    "1965 Ford Mustang Fastback":           "https://picsum.photos/seed/mustang65/800/600",
    "Ducati Panigale V4 S 2023":            "https://picsum.photos/seed/ducati/800/600",
    "Rolex Submariner Date Ref. 116610LN":  "https://picsum.photos/seed/rolexsub/800/600",
    "Patek Philippe Nautilus 5711/1A":      "https://picsum.photos/seed/patek/800/600",
    "Omega Speedmaster Moonwatch 1969":     "https://picsum.photos/seed/omega/800/600",
    "3.2ct Emerald Cut Diamond Ring":       "https://picsum.photos/seed/diamond/800/600",
    "Vintage Cartier Panthère Necklace":    "https://picsum.photos/seed/cartier/800/600",
    "Apple Mac Pro Tower 2023":             "https://picsum.photos/seed/macpro/800/600",
    "Vintage Sony Walkman TPS-L2 (1979)":  "https://picsum.photos/seed/walkman/800/600",
    "Hermès Birkin 35 — Togo Leather":     "https://picsum.photos/seed/hermes/800/600",
    "Nike Air Jordan 1 Retro High OG 'Chicago' 1985": "https://picsum.photos/seed/jordan/800/600",
    "1952 Topps Mickey Mantle Rookie Card PSA 7":     "https://picsum.photos/seed/baseball/800/600",
    "Amazing Fantasy #15 CGC 6.0 (1962)":  "https://picsum.photos/seed/comicbook/800/600",
}

db = SessionLocal()
added = 0
skipped = 0
failed = 0

products = db.query(Product).all()

for product in products:
    # Skip if already has images
    if product.images:
        print(f"⏭  '{product.title}' already has images — skipping")
        skipped += 1
        continue

    url = product_images.get(product.title)
    if not url:
        print(f"⚠️  No image URL mapped for '{product.title}' — skipping")
        skipped += 1
        continue

    try:
        print(f"⬇️  Downloading image for '{product.title}'...")
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(response.content)

        image = Image(
            url=f"/uploads/products/{filename}",
            product_id=product.id,
        )
        db.add(image)
        db.commit()
        print(f"✅ Image saved for '{product.title}'")
        added += 1

    except Exception as e:
        print(f"❌ Failed for '{product.title}': {e}")
        failed += 1

db.close()
print(f"\n🎉 Done! {added} images added, {skipped} skipped, {failed} failed.")