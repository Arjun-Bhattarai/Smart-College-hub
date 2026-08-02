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


collaboration_membership_router = APIRouter()


@collaboration_membership_router.get("/{collaboration_id}/members")
async def get_members(
    collaboration_id: UUID,
    service: CollaborationMembershipService = Depends(
        get_collaboration_membership_service,
    ),
):
    return await service.get_members(
        collaboration_id,
    )


@collaboration_membership_router.delete("/{collaboration_id}/members/{user_id}")
async def remove_member(
    collaboration_id: UUID,
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CollaborationMembershipService = Depends(
        get_collaboration_membership_service,
    ),
):
    return await service.remove_member(
        collaboration_id,
        user_id,
        current_user,
    )


@collaboration_membership_router.delete("/{collaboration_id}/leave")
async def leave_collaboration(
    collaboration_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CollaborationMembershipService = Depends(
        get_collaboration_membership_service,
    ),
):
    return await service.leave_collaboration(
        collaboration_id,
        current_user,
    )