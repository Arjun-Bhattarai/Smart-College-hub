from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class JoinRequestResponse(BaseModel):
    id: UUID
    collaboration_id: UUID
    user_id: UUID
    status: str
    requested_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JoinRequestUpdate(BaseModel):
    status: str