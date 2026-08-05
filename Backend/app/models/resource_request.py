from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class ResourceRequest(SQLModel, table=True):
    __tablename__ = "challenge_resource_requests"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
    )

    challenge_id: UUID | None = Field(
        default=None,
        foreign_key="coding_challenges.id",
        index=True,
        nullable=True,
    )

    requester_id: UUID = Field(
        foreign_key="users.uid",
        index=True,
    )

    message: str

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
    )
