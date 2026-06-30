from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CollaborationMemberCreate(BaseModel):
    user_id: UUID
    role: str = "member"


class CollaborationMemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    collaboration_id: UUID
    role: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)