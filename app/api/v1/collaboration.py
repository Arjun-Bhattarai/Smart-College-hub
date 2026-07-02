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

collaboration_router = APIRouter()



# Collaboration CRUD wala route


@collaboration_router.post("")
async def create_collaboration(
    collaboration: CollaborationCreate,
    current_user: User = Depends(get_current_user),
    service: CollaborationService = Depends(get_collaboration_service),
):
    return await service.create_collaboration(
        collaboration,
        current_user,
    )


@collaboration_router.get("")
async def get_collaborations(
    service: CollaborationService = Depends(get_collaboration_service),
):
    return await service.get_collaborations()


@collaboration_router.get("/{collaboration_id}")
async def get_collaboration(
    collaboration_id: UUID,
    service: CollaborationService = Depends(get_collaboration_service),
):
    return await service.get_collaboration(
        collaboration_id,
    )


@collaboration_router.patch("/{collaboration_id}")
async def update_collaboration(
    collaboration_id: UUID,
    data: CollaborationUpdate,
    current_user: User = Depends(get_current_user),
    service: CollaborationService = Depends(get_collaboration_service),
):
    return await service.update_collaboration(
        collaboration_id,
        data,
        current_user,
    )


@collaboration_router.delete("/{collaboration_id}")
async def delete_collaboration(
    collaboration_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CollaborationService = Depends(get_collaboration_service),
):
    return await service.delete_collaboration(
        collaboration_id,
        current_user,
    )



# Join Requests wala route


@collaboration_router.post("/{collaboration_id}/join")
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


@collaboration_router.get("/{collaboration_id}/join-requests")
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


@collaboration_router.patch("/join-requests/{request_id}/approve")
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


@collaboration_router.patch("/join-requests/{request_id}/reject")
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


# Membership ko route 


@collaboration_router.get("/{collaboration_id}/members")
async def get_members(
    collaboration_id: UUID,
    service: CollaborationMembershipService = Depends(
        get_collaboration_membership_service,
    ),
):
    return await service.get_members(
        collaboration_id,
    )


@collaboration_router.delete("/{collaboration_id}/members/{user_id}")
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


@collaboration_router.delete("/{collaboration_id}/leave")
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