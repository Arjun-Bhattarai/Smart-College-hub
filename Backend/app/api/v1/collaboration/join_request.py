from uuid import UUID

from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.dependencies.collaboration import get_collaboration_service
from app.dependencies.collaboration_join_request import (
    get_collaboration_join_request_service,
)
from app.dependencies.collaboration_membership import (
    get_collaboration_membership_service,
)
from app.models.user import User
from app.schemas.collaboration_schema import (
    CollaborationCreate,
    CollaborationUpdate,
)
from app.services.collaboration_service import CollaborationService
from app.services.collaboration_join_request_service import (
    CollaborationJoinRequestService,
)
from app.services.collaboration_membership_service import (
    CollaborationMembershipService,
)

collaboration_join_request_router = APIRouter()

@collaboration_join_request_router.post("/{collaboration_id}/join")
async def request_to_join(
    collaboration_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CollaborationJoinRequestService = Depends(
        get_collaboration_join_request_service,
    ),
):
    return await service.request_to_join(
        collaboration_id,
        current_user,
    )


@collaboration_join_request_router.get("/{collaboration_id}/join-requests")
async def get_join_requests(
    collaboration_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CollaborationJoinRequestService = Depends(
        get_collaboration_join_request_service,
    ),
):
    return await service.get_join_requests(
        collaboration_id,
        current_user,
    )


@collaboration_join_request_router.patch("/join-requests/{request_id}/approve")
async def approve_request(
    request_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CollaborationJoinRequestService = Depends(
        get_collaboration_join_request_service,
    ),
):
    return await service.approve_request(
        request_id,
        current_user,
    )


@collaboration_join_request_router.patch("/join-requests/{request_id}/reject")
async def reject_request(
    request_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CollaborationJoinRequestService = Depends(
        get_collaboration_join_request_service,
    ),
):
    return await service.reject_request(
        request_id,
        current_user,
    )

