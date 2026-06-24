import uuid
from typing import Optional
from sqlmodel import Field, Column, SQLModel
from datetime import datetime
import sqlalchemy.dialects.postgresql as pg


class User(SQLModel, table=True):
    __tablename__ = "users"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True, default=uuid.uuid4)
    )
    title: Optional[str] = Field(default=None, max_length=100)        
    username: str = Field(max_length=100, unique=True)
    email: str = Field(max_length=100, unique=True)
    first_name: Optional[str] = Field(default=None, max_length=100)   
    last_name: Optional[str] = Field(default=None, max_length=100)   
    role: str = Field(sa_column=Column(pg.VARCHAR,nullable=False, server_default="user"))
    is_verified: bool = Field(default=False)
    create_at: datetime = Field(sa_column=Column(pg.TIMESTAMP, default=datetime.utcnow))
    update_at: datetime = Field(sa_column=Column(pg.TIMESTAMP, default=datetime.utcnow))
    password: str = Field(exclude=True)

    def __repr__(self) -> str:
        return f"User(username={self.username}, email={self.email}, role={self.role})"