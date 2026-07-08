from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Submission(SQLModel, table=True):
    __tablename__ = "submissions"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
    )

    user_id: UUID = Field(
        foreign_key="users.uid",
        index=True,
    )

    challenge_id: UUID = Field(
        foreign_key="coding_challenges.id",
        index=True,
    )

    code: str
    language: str

    status: str = "pending"
    score: int = 0
    feedback: str | None = None

    submitted_at: datetime = Field(
        default_factory=datetime.utcnow,
    )
