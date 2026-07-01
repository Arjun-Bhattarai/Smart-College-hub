from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.collaboration_join_request import (
    CollaborationJoinRequest,
)


class CollaborationJoinRequestRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_request(
        self,
        request: CollaborationJoinRequest,
    ):
        self.session.add(request)
        await self.session.commit()
        await self.session.refresh(request)
        return request

    async def get_request(
        self,
        collaboration_id: UUID,
        user_id: UUID,
    ):
        statement = select(CollaborationJoinRequest).where(
            CollaborationJoinRequest.collaboration_id == collaboration_id,
            CollaborationJoinRequest.user_id == user_id,
        )

        result = await self.session.exec(statement)
        return result.first()

    async def get_request_by_id(self, request_id: UUID):
        statement = select(CollaborationJoinRequest).where(
            CollaborationJoinRequest.id == request_id
        )

        result = await self.session.exec(statement)
        return result.first()

    async def get_requests(
        self,
        collaboration_id: UUID,
    ):
        statement = select(CollaborationJoinRequest).where(
            CollaborationJoinRequest.collaboration_id == collaboration_id
        )

        result = await self.session.exec(statement)
        return result.all()

    async def update_request(
        self,
        request: CollaborationJoinRequest,
    ):
        self.session.add(request)
        await self.session.commit()
        await self.session.refresh(request)
        return request

    async def delete_request(
        self,
        request: CollaborationJoinRequest,
    ):
        await self.session.delete(request)
        await self.session.commit()