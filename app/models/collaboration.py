from sqlmodel import SQLModel, Field
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from uuid import uuid4, UUID
from datetime import datetime


class Collaboration(SQLModel, table=True):
    __tablename__ = "collaborations"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True),
    )

    title: str
    description: str | None = None

    max_members: int | None = None

    required_skills: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB, nullable=False),
    )

    created_by: UUID = Field(
        sa_column=Column(
            PGUUID(as_uuid=True),
            ForeignKey("users.uid"),
            nullable=False
        )
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(nullable=False)
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(nullable=False)
    )