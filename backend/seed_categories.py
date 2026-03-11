from database import SessionLocal, engine, Base
from models import Category, SubCategory

Base.metadata.create_all(bind=engine)

db = SessionLocal()

categories_data = [
    {
        "name": "Modern Art",
        "description": "Contemporary paintings, sculptures, and digital art",
        "subcategories": [
            "Paintings", "Sculptures", "Photography", "Digital Art", "Prints & Editions"
        ]
    },
    {
        "name": "Automotive",
        "description": "Classic and collectible vehicles, parts, and memorabilia",
        "subcategories": [
            "Classic Cars", "Sports Cars", "Motorcycles", "Auto Parts", "Memorabilia"
        ]
    },
    {
        "name": "Horology",
        "description": "Luxury and vintage timepieces from top manufacturers",
        "subcategories": [
            "Luxury Watches", "Vintage Watches", "Pocket Watches", "Watch Parts & Tools"
        ]
    },
    {
        "name": "Jewelry & Gems",
        "description": "Fine jewelry, gemstones, and precious metals",
        "subcategories": [
            "Rings", "Necklaces", "Bracelets", "Loose Gemstones", "Gold & Silver"
        ]
    },
    {
        "name": "Electronics",
        "description": "Consumer electronics, vintage tech, and collectibles",
        "subcategories": [
            "Smartphones", "Laptops & Computers", "Vintage Electronics", "Audio Equipment", "Gaming"
        ]
    },
    {
        "name": "Fashion",
        "description": "Designer clothing, accessories, and footwear",
        "subcategories": [
            "Designer Clothing", "Handbags", "Footwear", "Accessories", "Vintage Fashion"
        ]
    },
    {
        "name": "Collectibles",
        "description": "Rare and limited edition collectible items",
        "subcategories": [
            "Sports Cards", "Comic Books", "Coins & Currency", "Stamps", "Toys & Figures"
        ]
    },
    {
        "name": "Real Estate",
        "description": "Property, land, and real estate assets",
        "subcategories": [
            "Residential", "Commercial", "Land", "Vacation Properties"
        ]
    },
]

added = 0
skipped = 0

for cat_data in categories_data:
    # Skip if category already exists
    existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
    if existing:
        print(f"⏭  Skipping '{cat_data['name']}' — already exists")
        skipped += 1
        continue

    category = Category(name=cat_data["name"], description=cat_data["description"])
    db.add(category)
    db.flush()  # get the ID before commit

    for sub_name in cat_data["subcategories"]:
        db.add(SubCategory(name=sub_name, category_id=category.id))

    print(f"✅ Added '{cat_data['name']}' with {len(cat_data['subcategories'])} subcategories")
    added += 1

db.commit()
db.close()

print(f"\n🎉 Done! {added} categories added, {skipped} skipped.")