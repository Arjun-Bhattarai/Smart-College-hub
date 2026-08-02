from uuid import UUID

from fastapi import HTTPException, status

from app.models.collaboration_join_request import CollaborationJoinRequest
from app.models.collaboration_membership import CollaborationMembership
from app.repositories.collaboration_join_request_repository import (
    CollaborationJoinRequestRepository,
)
from app.repositories.collaboration_membership_repository import (
    CollaborationMembershipRepository,
)
from app.repositories.collaboration_repository import (
    CollaborationRepository,
)


class CollaborationJoinRequestService:
    def __init__(
        self,
        join_request_repository: CollaborationJoinRequestRepository,
        membership_repository: CollaborationMembershipRepository,
        collaboration_repository: CollaborationRepository,
    ):
        self.join_request_repository = join_request_repository
        self.membership_repository = membership_repository
        self.collaboration_repository = collaboration_repository

    async def request_to_join(
        self,
        collaboration_id: UUID,
        current_user,
    ):
        collaboration = await self.collaboration_repository.get_by_id(
            collaboration_id
        )

        if not collaboration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaboration not found.",
            )

        if collaboration.created_by == current_user.uid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Owner is already a member.",
            )

        existing_member = await self.membership_repository.get_member(
            collaboration_id,
            current_user.uid,
        )

        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already a member.",
            )

        existing_request = await self.join_request_repository.get_request(
            collaboration_id,
            current_user.uid,
        )

        if existing_request and existing_request.status == "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Join request already exists.",
            )

        request = CollaborationJoinRequest(
            collaboration_id=collaboration_id,
            user_id=current_user.uid,
            status="pending",
        )

        return await self.join_request_repository.create_request(request)

    async def get_join_requests(
        self,
        collaboration_id: UUID,
        current_user,
    ):
        collaboration = await self.collaboration_repository.get_by_id(
            collaboration_id
        )

        if not collaboration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaboration not found.",
            )

        if collaboration.created_by != current_user.uid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the owner can view join requests.",
            )

        return await self.join_request_repository.get_requests(
            collaboration_id
        )

    async def approve_request(
        self,
        request_id: UUID,
        current_user,
    ):
        request = await self.join_request_repository.get_request_by_id(
            request_id
        )

        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Join request not found.",
            )

        if request.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This request has already been processed.",
            )

        collaboration = await self.collaboration_repository.get_by_id(
            request.collaboration_id
        )

        if collaboration.created_by != current_user.uid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the owner can approve requests.",
            )

        existing_member = await self.membership_repository.get_member(
            request.collaboration_id,
            request.user_id,
        )

        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member.",
            )

        membership = CollaborationMembership(
            collaboration_id=request.collaboration_id,
            user_id=request.user_id,
            role="member",
        )

        await self.membership_repository.add_member(
            membership
        )

        request.status = "approved"

        return await self.join_request_repository.update_request(
            request
        )

    async def reject_request(
        self,
        request_id: UUID,
        current_user,
    ):
        request = await self.join_request_repository.get_request_by_id(
            request_id
        )

        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Join request not found.",
            )

        if request.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This request has already been processed.",
            )

        collaboration = await self.collaboration_repository.get_by_id(
            request.collaboration_id
        )

        if collaboration.created_by != current_user.uid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the owner can reject requests.",
            )

        request.status = "rejected"

        return await self.join_request_repository.update_request(
            request
        )