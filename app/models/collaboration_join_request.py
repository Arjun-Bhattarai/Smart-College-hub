from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field


class CollaborationJoinRequest(SQLModel, table=True):
    __tablename__ = "collaboration_join_requests"

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

    status: str = Field(default="pending")

    requested_at: datetime = Field(
        default_factory=datetime.utcnow,
    )