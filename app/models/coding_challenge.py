from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID, uuid4


class CodingChallenge(SQLModel, table=True):
    __tablename__ = "coding_challenges"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    title: str
    description: str
    difficulty: str
    starter_code: str | None = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    