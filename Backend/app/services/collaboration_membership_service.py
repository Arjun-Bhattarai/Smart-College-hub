from uuid import UUID

from fastapi import HTTPException, status

from app.repositories.collaboration_membership_repository import (
    CollaborationMembershipRepository,
)
from app.repositories.collaboration_repository import (
    CollaborationRepository,
)


class CollaborationMembershipService:
    def __init__(
        self,
        membership_repository: CollaborationMembershipRepository,
        collaboration_repository: CollaborationRepository,
    ):
        self.membership_repository = membership_repository
        self.collaboration_repository = collaboration_repository

    async def get_members(
        self,
        collaboration_id: UUID,
    ):
        collaboration = await self.collaboration_repository.get_by_id(
            collaboration_id
        )

        if not collaboration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaboration not found.",
            )

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
                detail="Only the collaboration owner can remove members.",
            )

        if collaboration.created_by == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The owner cannot be removed from the collaboration.",
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

        await self.membership_repository.remove_member(
            membership
        )

        return {
            "message": "Member removed successfully."
        }

    async def leave_collaboration(
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
                detail="The owner cannot leave the collaboration. Delete it or transfer ownership first.",
            )

        membership = await self.membership_repository.get_member(
            collaboration_id,
            current_user.uid,
        )

        if not membership:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="You are not a member of this collaboration.",
            )

        await self.membership_repository.remove_member(
            membership
        )

        return {
            "message": "You left the collaboration successfully."
        }