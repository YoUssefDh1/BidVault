from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# SQLite file will be created automatically in the backend folder
DATABASE_URL = "sqlite:///./bidding.db"

# check_same_thread=False is required for SQLite with FastAPI
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Each request gets its own session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class that all ORM models will inherit from
class Base(DeclarativeBase):
    pass

# Dependency: used in route functions to get a DB session
# FastAPI will automatically close it after the request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
