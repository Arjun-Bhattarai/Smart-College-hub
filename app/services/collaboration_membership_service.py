from fastapi import HTTPException, status
from uuid import UUID

from app.models.collaboration_membership import CollaborationMembership
from app.repositories.collaboration_membership_repository import (
    CollaborationMembershipRepository,
)
from app.repositories.collaboration_repository import CollaborationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.collaboration_membership_schema import (
    CollaborationMemberCreate,
)


class CollaborationMembershipService:
    def __init__(
        self,
        membership_repository: CollaborationMembershipRepository,
        collaboration_repository: CollaborationRepository,
        user_repository: UserRepository,
    ):
        self.membership_repository = membership_repository
        self.collaboration_repository = collaboration_repository
        self.user_repository = user_repository

    async def request_to_join(
        self,
        collaboration_id: UUID,
        data: CollaborationMemberCreate,
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
                detail="Only the owner can add members.",
            )

        user = await self.user_repository.get_user_by_id(data.user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        existing_member = await self.membership_repository.get_member(
            collaboration_id,
            data.user_id,
        )

        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member.",
            )

        membership = CollaborationMembership(
            collaboration_id=collaboration_id,
            user_id=data.user_id,
            role=data.role,
        )

        return await self.membership_repository.add_member(membership)

    async def get_join_requests(self, collaboration_id: UUID):
        return await self.membership_repository.get_members(
            collaboration_id
        )

    async def remove_member(
        self,
        collaboration_id: UUID,
        user_id: UUID,
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
                detail="Only the owner can remove members.",
            )

        membership = await self.membership_repository.get_member(
            collaboration_id,
            user_id,
        )

        if not membership:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found.",
            )

        await self.membership_repository.remove_member(membership)

        return {
            "message": "Member removed successfully."
        }