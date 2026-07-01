from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.collaboration_membership import CollaborationMembership


class CollaborationMembershipRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_member(
        self,
        collaboration_membership: CollaborationMembership,
    ):
        self.session.add(collaboration_membership)
        await self.session.commit()
        await self.session.refresh(collaboration_membership)
        return collaboration_membership

    async def get_members(self, collaboration_id: UUID):
        statement = select(CollaborationMembership).where(
            CollaborationMembership.collaboration_id == collaboration_id
        )
        result = await self.session.exec(statement)
        return result.all()

    async def get_member(
        self,
        collaboration_id: UUID,
        user_id: UUID,
    ):
        statement = select(CollaborationMembership).where(
            CollaborationMembership.collaboration_id == collaboration_id,
            CollaborationMembership.user_id == user_id,
        )
        result = await self.session.exec(statement)
        return result.first()

    async def remove_member(
        self,
        membership: CollaborationMembership,
    ):
        await self.session.delete(membership)
        await self.session.commit()

    async def update_member(
        self,
        membership: CollaborationMembership,
    ):
        self.session.add(membership)
        await self.session.commit()
        await self.session.refresh(membership)
        return membership