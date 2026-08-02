from fastapi import Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.repositories.collaboration_membership_repository import (
    CollaborationMembershipRepository,
)
from app.repositories.collaboration_repository import CollaborationRepository
from app.services.collaboration_membership_service import (
    CollaborationMembershipService,
)


def get_collaboration_membership_service(
    session: AsyncSession = Depends(get_session),
):
    membership_repository = CollaborationMembershipRepository(session)
    collaboration_repository = CollaborationRepository(session)

    return CollaborationMembershipService(
        membership_repository,
        collaboration_repository,
    )