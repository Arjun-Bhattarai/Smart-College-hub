from sqlalchemy import UniqueConstraint
from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID, uuid4

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
        foreign_key="collaborations.id",
        index=True,
    )

    user_id: UUID = Field(
        foreign_key="users.uid",
        index=True,
    )

    role: str = Field(
        default="member",
        max_length=20,
    )

    joined_at: datetime = Field(
        default_factory=datetime.utcnow,
    )