import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    username: str = Field(max_length=100)
    email: str = Field(max_length=100)
    password: str = Field(min_length=5)

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    title: Optional[str] = None


class UserResponse(BaseModel):
    uid: uuid.UUID
    title: Optional[str] = None

    username: str
    email: str

    first_name: Optional[str] = None
    last_name: Optional[str] = None

    role: str
    is_verified: bool

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
class UserLogin(BaseModel):
    email: str = Field(max_length=100)
    password: str = Field(min_length=5)     