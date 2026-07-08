from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ChallengeCreate(BaseModel):
    title: str
    description: str
    difficulty: str
    starter_code: str | None = None


class ChallengeUpdate(BaseModel):
    title: str
    description: str
    difficulty: str
    starter_code: str | None = None


class ChallengeResponse(BaseModel):
    id: UUID
    title: str
    description: str
    difficulty: str
    starter_code: str | None
    created_at: datetime