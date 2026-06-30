from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.collaboration import Collaboration


class CollaborationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, collaboration: Collaboration):
        self.session.add(collaboration)
        await self.session.commit()
        await self.session.refresh(collaboration)
        return collaboration

    async def get_all(self):
        result = await self.session.exec(
            select(Collaboration)
        )
        return result.all()

    async def get_by_id(self, collaboration_id: UUID):
        result = await self.session.exec(
            select(Collaboration).where(
                Collaboration.id == collaboration_id
            )
        )
        return result.first()

    async def update(self, collaboration: Collaboration):
        self.session.add(collaboration)
        await self.session.commit()
        await self.session.refresh(collaboration)
        return collaboration

    async def delete(self, collaboration: Collaboration):
        await self.session.delete(collaboration)
        await self.session.commit()