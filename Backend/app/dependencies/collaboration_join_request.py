from fastapi import Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.repositories.collaboration_join_request_repository import (
    CollaborationJoinRequestRepository,
)
from app.repositories.collaboration_membership_repository import (
    CollaborationMembershipRepository,
)
from app.repositories.collaboration_repository import CollaborationRepository
from app.services.collaboration_join_request_service import (
    CollaborationJoinRequestService,
)


def get_collaboration_join_request_service(
    session: AsyncSession = Depends(get_session),
):
    join_request_repository = CollaborationJoinRequestRepository(session)
    membership_repository = CollaborationMembershipRepository(session)
    collaboration_repository = CollaborationRepository(session)

    return CollaborationJoinRequestService(
        join_request_repository,
        membership_repository,
        collaboration_repository,
    )