from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import create_access_token, hash_password, verify_password
from database import get_db
from models import User, Admin
from schemas import UserRegister, UserLogin, UserResponse, Token

router = APIRouter()


# ---------------------------------------------------------------------------
# REGISTER  (users only — admins are created manually)
# ---------------------------------------------------------------------------

@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# LOGIN  — one endpoint, auto-detects user vs admin by email
# ---------------------------------------------------------------------------

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    # 1. Check users table first
    user = db.query(User).filter(User.email == data.email).first()
    if user and verify_password(data.password, user.hashed_password):
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Your account has been blocked")
        token = create_access_token({"sub": str(user.id), "role": "user"})
        return Token(access_token=token, role="user")

    # 2. Check admins table
    admin = db.query(Admin).filter(Admin.email == data.email).first()
    if admin and verify_password(data.password, admin.hashed_password):
        token = create_access_token({"sub": str(admin.id), "role": "admin"})
        return Token(access_token=token, role="admin")

    # 3. Neither matched
    raise HTTPException(status_code=401, detail="Invalid email or password")