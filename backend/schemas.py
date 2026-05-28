from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "citizen"

class UserLogin(BaseModel):
    email: str
    password: str

class ComplaintOut(BaseModel):
    id: int
    image_path: str
    annotated_path: Optional[str]
    latitude: float
    longitude: float
    description: Optional[str]
    is_fake: bool
    confidence: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True