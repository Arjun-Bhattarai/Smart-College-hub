from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ChallengeResourceRequestCreate(BaseModel):
    message: str


class ChallengeResourceRequestResponse(BaseModel):
    id: UUID
    challenge_id: UUID
    requester_id: UUID
    message: str
    created_at: datetime


class ChallengeResourceResponse(BaseModel):
    id: UUID
    challenge_id: UUID
    uploader_id: UUID
    title: str
    description: str | None
    file_name: str
    file_url: str
    created_at: datetime
