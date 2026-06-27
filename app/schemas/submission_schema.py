from datetime import datetime

from uuid import UUID
from pydantic import BaseModel


class SubmissionCreate(BaseModel):
    challenge_id: UUID
    code: str
    language: str


class SubmissionResponse(BaseModel):
    id: UUID
    status: str
    score: int
    submitted_at: datetime
