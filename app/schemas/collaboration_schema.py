from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class CollaborationBase(BaseModel):
    title: str
    description: str | None = None
    max_members: int | None = None
    required_skills: list[str] = Field(default_factory=list)


class CollaborationCreate(CollaborationBase):
    pass


class CollaborationUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    max_members: int | None = None
    required_skills: list[str] | None = None


class CollaborationResponse(CollaborationBase):
    id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)