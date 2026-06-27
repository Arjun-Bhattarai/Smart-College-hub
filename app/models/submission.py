from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime


class Submission(SQLModel, table=True):
    __tablename__ = "submissions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    user_id: UUID = Field(foreign_key="users.uid")
    challenge_id: UUID = Field(
        foreign_key="coding_challenges.id"
    )

    code: str
    language: str

    status: str = "Pending"

    score: int = 0

    submitted_at: datetime = Field(
        default_factory=datetime.utcnow
    )