import uuid
from typing import Optional
from datetime import datetime

from sqlmodel import SQLModel, Field, Column
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


class User(SQLModel, table=True):
    __tablename__ = "users"

    uid: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
            nullable=False
        )
    )

    title: Optional[str] = Field(default=None, max_length=100)

    username: str = Field(
        sa_column=Column(sa.String(100), unique=True, index=True, nullable=False)
    )

    email: str = Field(
        sa_column=Column(sa.String(100), unique=True, index=True, nullable=False)
    )

    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)

    role: str = Field(
        sa_column=Column(sa.String, nullable=False, server_default="user")
    )

    is_verified: bool = Field(
        sa_column=Column(sa.Boolean, nullable=False, server_default=sa.false())
    )

    created_at: datetime = Field(
        sa_column=Column(sa.DateTime, server_default=sa.func.now(), nullable=False)
    )

    updated_at: datetime = Field(
        sa_column=Column(
            sa.DateTime,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=False
        )
    )

    password: str = Field(nullable=False)