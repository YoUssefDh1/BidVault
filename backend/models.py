from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from database import Base


# ---------------------------------------------------------------------------
# USERS  (merged buyer + seller — one account can do everything)
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id               = Column(Integer, primary_key=True, index=True)
    name             = Column(String,  nullable=False)
    email            = Column(String,  unique=True, nullable=False, index=True)
    hashed_password  = Column(String,  nullable=False)
    created_at       = Column(DateTime, default=datetime.utcnow)
    is_active        = Column(Boolean,  default=True)   # admin can block/unblock
    profile_image_id = Column(Integer, ForeignKey("images.id"), nullable=True)
    city             = Column(String,  nullable=True)
    country          = Column(String,  nullable=True)

    # As a seller — products they listed
    products      = relationship("Product",      back_populates="seller",
                                 foreign_keys="Product.seller_id")
    # As a buyer — bids they placed
    bids          = relationship("Bid",          back_populates="bidder")
    # Auctions they won
    won           = relationship("Auction",      back_populates="winner",
                                 foreign_keys="Auction.winner_id")
    notifications = relationship("Notification", back_populates="user")
    profile_image = relationship("Image",        foreign_keys=[profile_image_id],
                                 post_update=True)


# ---------------------------------------------------------------------------
# ADMINS  (standalone — manages the platform)
# ---------------------------------------------------------------------------
class Admin(Base):
    __tablename__ = "admins"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String,  nullable=False)
    email           = Column(String,  unique=True, nullable=False, index=True)
    hashed_password = Column(String,  nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# CATEGORIES
# ---------------------------------------------------------------------------
class Category(Base):
    __tablename__ = "categories"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String,  unique=True, nullable=False)
    description = Column(Text)

    subcategories = relationship("SubCategory", back_populates="category",
                                 cascade="all, delete-orphan")
    products      = relationship("Product",     back_populates="category")


# ---------------------------------------------------------------------------
# SUBCATEGORIES
# ---------------------------------------------------------------------------
class SubCategory(Base):
    __tablename__ = "subcategories"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String,  nullable=False)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    category = relationship("Category",   back_populates="subcategories")
    products = relationship("Product",    back_populates="subcategory")


# ---------------------------------------------------------------------------
# PRODUCTS
# ---------------------------------------------------------------------------
class Product(Base):
    __tablename__ = "products"

    id             = Column(Integer, primary_key=True, index=True)
    title          = Column(String,  nullable=False)
    description    = Column(Text)
    starting_price = Column(Float,   nullable=False)
    current_price  = Column(Float,   nullable=False)
    start_date     = Column(DateTime, nullable=False)
    end_date       = Column(DateTime, nullable=False)
    status         = Column(String,  default="pending")  # pending|active|closed
    created_at     = Column(DateTime, default=datetime.utcnow)

    seller_id      = Column(Integer, ForeignKey("users.id"),         nullable=False)
    category_id    = Column(Integer, ForeignKey("categories.id"),    nullable=True)
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"), nullable=True)

    seller      = relationship("User",        back_populates="products",
                               foreign_keys=[seller_id])
    category    = relationship("Category",    back_populates="products")
    subcategory = relationship("SubCategory", back_populates="products")
    images      = relationship("Image",       back_populates="product",
                               foreign_keys="Image.product_id",
                               cascade="all, delete-orphan")
    auctions    = relationship("Auction",     back_populates="product",
                               cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# IMAGES
# ---------------------------------------------------------------------------
class Image(Base):
    __tablename__ = "images"

    id         = Column(Integer, primary_key=True, index=True)
    url        = Column(String,  nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)

    product = relationship("Product", back_populates="images",
                           foreign_keys=[product_id])


# ---------------------------------------------------------------------------
# AUCTIONS  (one product → many auction runs)
# ---------------------------------------------------------------------------
class Auction(Base):
    __tablename__ = "auctions"

    id         = Column(Integer, primary_key=True, index=True)
    start_date = Column(DateTime, nullable=False)
    end_date   = Column(DateTime, nullable=False)
    status     = Column(String,  default="scheduled")  # scheduled|active|closed
    created_at = Column(DateTime, default=datetime.utcnow)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    winner_id  = Column(Integer, ForeignKey("users.id"),    nullable=True)

    product = relationship("Product", back_populates="auctions")
    winner  = relationship("User",    back_populates="won",
                           foreign_keys=[winner_id])
    bids    = relationship("Bid",     back_populates="auction",
                           cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# BIDS
# ---------------------------------------------------------------------------
class Bid(Base):
    __tablename__ = "bids"

    id         = Column(Integer, primary_key=True, index=True)
    amount     = Column(Float,    nullable=False)
    bid_date   = Column(DateTime, default=datetime.utcnow)
    is_valid   = Column(Boolean,  default=True)

    auction_id = Column(Integer, ForeignKey("auctions.id"), nullable=False)
    bidder_id  = Column(Integer, ForeignKey("users.id"),    nullable=False)

    auction = relationship("Auction", back_populates="bids")
    bidder  = relationship("User",    back_populates="bids")


# ---------------------------------------------------------------------------
# NOTIFICATIONS
# ---------------------------------------------------------------------------
class Notification(Base):
    __tablename__ = "notifications"

    id      = Column(Integer,  primary_key=True, index=True)
    message = Column(Text,     nullable=False)
    date    = Column(DateTime, default=datetime.utcnow)
    status  = Column(String,   default="unread")  # unread|read

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="notifications")