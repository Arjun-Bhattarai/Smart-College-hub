from datetime import datetime

from uuid import UUID
from pydantic import BaseModel


class SubmissionCreate(BaseModel):
    code: str
    language: str

class SubmissionResponse(BaseModel):
    id: UUID
    status: str
    score: int
    submitted_at: datetime


class SubmissionReview(BaseModel):
    score: int
    status: str
    feedback: str | None = None