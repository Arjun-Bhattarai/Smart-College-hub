from fastapi import HTTPException

from app.models.collaboration import Collaboration
from app.models.collaboration_membership import CollaborationMembership


class CollaborationService:
    def __init__(
        self,
        repository,
        membership_repository,
    ):
        self.repository = repository
        self.membership_repository = membership_repository

    async def create_collaboration(self, data, current_user):
        collaboration = Collaboration(
            **data.model_dump(),
            created_by=current_user.uid,
        )

        collaboration = await self.repository.create(collaboration)

        owner = CollaborationMembership(
            collaboration_id=collaboration.id,
            user_id=current_user.uid,
            role="owner",
        )

        await self.membership_repository.add_member(owner)

        return collaboration

    async def get_collaborations(self):
        return await self.repository.get_all()

    async def get_collaboration(self, collaboration_id):
        collaboration = await self.repository.get_by_id(collaboration_id)

        if not collaboration:
            raise HTTPException(
                status_code=404,
                detail="Collaboration not found",
            )

        return collaboration

    async def update_collaboration(
        self,
        collaboration_id,
        data,
        current_user,
    ):
        collaboration = await self.repository.get_by_id(collaboration_id)

        if not collaboration:
            raise HTTPException(
                status_code=404,
                detail="Collaboration not found",
            )

        if collaboration.created_by != current_user.uid:
            raise HTTPException(
                status_code=403,
                detail="Permission denied",
            )

        if data.title is not None:
            collaboration.title = data.title

        if data.description is not None:
            collaboration.description = data.description

        if data.max_members is not None:
            collaboration.max_members = data.max_members

        if data.required_skills is not None:
            collaboration.required_skills = data.required_skills

        return await self.repository.update(collaboration)

    async def delete_collaboration(
        self,
        collaboration_id,
        current_user,
    ):
        collaboration = await self.repository.get_by_id(collaboration_id)

        if not collaboration:
            raise HTTPException(
                status_code=404,
                detail="Collaboration not found",
            )

        if collaboration.created_by != current_user.uid:
            raise HTTPException(
                status_code=403,
                detail="Permission denied",
            )

        await self.repository.delete(collaboration)

        return {
            "message": "Collaboration deleted successfully"
        }