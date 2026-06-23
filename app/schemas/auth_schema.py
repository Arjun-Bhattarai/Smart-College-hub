from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    username: str = Field(max_length=100)
    email: str = Field(max_length=100)
    password: str = Field(min_length=5)
    first_name: Optional[str] = None 
    last_name: Optional[str] = None   


class user_model(BaseModel):
    uid: uuid.UUID
    title: Optional[str] = None       
    username: str = Field(max_length=100)
    email: str = Field(max_length=100)
    first_name: Optional[str] = None 
    last_name: Optional[str] = None 
    is_verified: bool = Field(default=False)
    create_at: datetime
    update_at: datetime
    password: str = Field(exclude=True)

class UserLogin(BaseModel):
    email: str = Field(max_length=100)
    password: str = Field(min_length=5)