from database import SessionLocal, engine, Base
from models import Admin
from auth import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

admin = Admin(
    name="Admin",
    email="admin@site.com",
    hashed_password=hash_password("admin123")
)

db.add(admin)
db.commit()
print("✅ Admin created successfully!")
print("   Email:    admin@site.com")
print("   Password: admin123")
db.close()