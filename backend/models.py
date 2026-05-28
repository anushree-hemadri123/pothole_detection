from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String)
    email      = Column(String, unique=True, index=True)
    password   = Column(String)
    role       = Column(String, default="citizen")
    complaints = relationship("Complaint", back_populates="user")

class Complaint(Base):
    __tablename__ = "complaints"
    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"))
    image_path     = Column(String)
    annotated_path = Column(String)
    latitude       = Column(Float)
    longitude      = Column(Float)
    description    = Column(String)
    is_fake        = Column(Boolean, default=False)
    confidence     = Column(Float, default=0.0)
    status         = Column(String, default="pending")
    created_at     = Column(DateTime, default=datetime.utcnow)
    user           = relationship("User", back_populates="complaints")