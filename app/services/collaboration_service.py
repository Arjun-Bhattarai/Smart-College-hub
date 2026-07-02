from uuid import UUID

from fastapi import HTTPException, status

from app.models.collaboration import Collaboration
from app.models.collaboration_membership import CollaborationMembership
from app.repositories.collaboration_membership_repository import (
    CollaborationMembershipRepository,
)
from app.repositories.collaboration_repository import (
    CollaborationRepository,
)


class CollaborationService:
    def __init__(
        self,
        collaboration_repository: CollaborationRepository,
        membership_repository: CollaborationMembershipRepository,
    ):
        self.collaboration_repository = collaboration_repository
        self.membership_repository = membership_repository

    async def create_collaboration(
        self,
        data,
        current_user,
    ):
        collaboration = Collaboration(
            title=data.title,
            description=data.description,
            created_by=current_user.uid,
        )

        collaboration = await self.collaboration_repository.create(
            collaboration
        )

        membership = CollaborationMembership(
            collaboration_id=collaboration.id,
            user_id=current_user.uid,
        )

        await self.membership_repository.add_member(
            membership
        )

        return collaboration

    async def get_collaborations(self):
        return await self.collaboration_repository.get_all()

    async def get_collaboration(
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

        return collaboration

    async def update_collaboration(
        self,
        collaboration_id: UUID,
        data,
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
                detail="Only the owner can update this collaboration.",
            )

        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(collaboration, key, value)

        return await self.collaboration_repository.update(
            collaboration
        )

    async def delete_collaboration(
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
                detail="Only the owner can delete this collaboration.",
            )

        await self.collaboration_repository.delete(
            collaboration
        )

        return {
            "message": "Collaboration deleted successfully."
        }