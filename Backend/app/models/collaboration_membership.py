from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Column, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlmodel import Field, SQLModel


class CollaborationMembership(SQLModel, table=True):
    __tablename__ = "collaboration_memberships"

    __table_args__ = (
        UniqueConstraint(
            "collaboration_id",
            "user_id",
            name="uq_collaboration_user",
        ),
    )

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
    )

    collaboration_id: UUID = Field(
        sa_column=Column(
            PGUUID(as_uuid=True),
            ForeignKey(
                "collaborations.id",
                ondelete="CASCADE",
            ),
            nullable=False,
            index=True,
        )
    )

    user_id: UUID = Field(
        sa_column=Column(
            PGUUID(as_uuid=True),
            ForeignKey("users.uid"),
            nullable=False,
            index=True,
        )
    )

    role: str = Field(
        default="member",
        max_length=20,
    )

    joined_at: datetime = Field(
        default_factory=datetime.utcnow,
    )