from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ResourceRequestCreate(BaseModel):
    message: str
    challenge_id: UUID | None = None


class ResourceRequestResponse(BaseModel):
    id: UUID
    challenge_id: UUID | None = None
    requester_id: UUID
    message: str
    created_at: datetime


class ResourceResponse(BaseModel):
    id: UUID
    challenge_id: UUID | None = None
    uploader_id: UUID
    title: str
    description: str | None
    file_name: str
    file_url: str
    created_at: datetime
