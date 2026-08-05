from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Resource(SQLModel, table=True):
    __tablename__ = "challenge_resources"

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

    uploader_id: UUID = Field(
        foreign_key="users.uid",
        index=True,
    )

    title: str
    description: str | None = None
    file_name: str
    file_path: str

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
    )
