from uuid import UUID

from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.collaboration_repository import CollaborationRepository
from app.services.collaboration_service import CollaborationService
from app.schemas.collaboration_schema import (
    CollaborationCreate,
    CollaborationUpdate,
)

collaboration_router = APIRouter()


def get_collaboration_service(session: AsyncSession = Depends(get_session),):
    repository = CollaborationRepository(session)
    return CollaborationService(repository)


@collaboration_router.post("")
async def create_collaboration(collaboration: CollaborationCreate,current_user: User = Depends(get_current_user),
    service: CollaborationService = Depends(get_collaboration_service),
):
    return await service.create_collaboration(
        data=collaboration,
        current_user=current_user,
    )


@collaboration_router.get("")
async def get_collaborations(service: CollaborationService = Depends(get_collaboration_service),):
    return await service.get_collaborations()


@collaboration_router.get("/{collaboration_id}")
async def get_collaboration(collaboration_id: UUID,service: CollaborationService = Depends(get_collaboration_service),
):
    return await service.get_collaboration(collaboration_id)


@collaboration_router.patch("/{collaboration_id}")
async def update_collaboration(collaboration_id: UUID, data: CollaborationUpdate,
    current_user: User = Depends(get_current_user),
    service: CollaborationService = Depends(get_collaboration_service),
):
    return await service.update_collaboration(
        collaboration_id,
        data,
        current_user,
    )


@collaboration_router.delete("/{collaboration_id}")
async def delete_collaboration( collaboration_id: UUID, current_user: User = Depends(get_current_user),
    service: CollaborationService = Depends(get_collaboration_service),
):
    return await service.delete_collaboration(
        collaboration_id,
        current_user,
    )
