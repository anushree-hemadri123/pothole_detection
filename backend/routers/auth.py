from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin
from passlib.context import CryptContext
from jose import jwt
import os

router = APIRouter()
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    password = user.password[:72]
    hashed_password = pwd_context.hash(password)

    new_user = User(
    name=user.name,
    email=user.email,
    password=hashed_password,   # ✅ FIXED
    role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Registered!", "user_id": new_user.id}

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    password = data.password[:72]
    if not user or not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    token = jwt.encode(
        {"user_id": user.id, "role": user.role},
        os.getenv("SECRET_KEY", "secret"),
        algorithm="HS256"
    )
    return {
        "token":   token,
        "user_id": user.id,
        "role":    user.role,
        "name":    user.name
    }