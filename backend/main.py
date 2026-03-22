from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base
from routers import auth as auth_router
from routers import categories as categories_router
from routers import products as products_router
from routers import auctions as auctions_router
from routers import bids as bids_router
from routers import admin as admin_router
from routers import users as users_router

# Create all DB tables on startup
Base.metadata.create_all(bind=engine)

# Ensure upload folder exists
os.makedirs("uploads/products", exist_ok=True)

app = FastAPI(
    title="Bidding Site API",
    description="IHM Project — Real-Time Auction Platform",
    version="1.0.0"
)

# Serve uploaded images as static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Allow React dev server to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(auth_router.router,       prefix="/auth",       tags=["Auth"])
app.include_router(categories_router.router, prefix="/categories", tags=["Categories"])
app.include_router(products_router.router,   prefix="/products",   tags=["Products"])
app.include_router(auctions_router.router,   prefix="/auctions",   tags=["Auctions"])
app.include_router(bids_router.router,       prefix="/bids",       tags=["Bids"])
app.include_router(admin_router.router,      prefix="/admin",      tags=["Admin"])
app.include_router(users_router.router,      prefix="/users",      tags=["Users"])


@app.get("/")
def root():
    return {"message": "Bidding Site API is running 🚀"}