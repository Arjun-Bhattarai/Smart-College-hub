from fastapi import Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.repositories.collaboration_repository import CollaborationRepository
from app.repositories.collaboration_membership_repository import (
    CollaborationMembershipRepository,
)
from app.services.collaboration_service import CollaborationService


def get_collaboration_service(
    session: AsyncSession = Depends(get_session),
):
    collaboration_repository = CollaborationRepository(session)
    membership_repository = CollaborationMembershipRepository(session)

    return CollaborationService(
        collaboration_repository,
        membership_repository,
    )