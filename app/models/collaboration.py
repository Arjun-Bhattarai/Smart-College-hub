from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import SQLModel, Field


class Collaboration(SQLModel, table=True):
    __tablename__ = "collaborations"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
    )

    title: str = Field(
        max_length=100,
    )

    description: str | None = Field(
        default=None,
        max_length=500,
    )

    max_members: int | None = Field(
        default=None,
        ge=1,
    )

    required_skills: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB, nullable=False),
    )

    created_by: UUID = Field(
        foreign_key="users.uid",
        index=True,
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
    )