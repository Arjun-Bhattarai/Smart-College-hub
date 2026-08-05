from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID
from app.models.resource import Resource
from app.models.resource_request import ResourceRequest




class ResourceRepository:

    async def create_resource(
        self,
        session: AsyncSession,
        resource: Resource,
    ) -> Resource:
        session.add(resource)
        await session.commit()
        await session.refresh(resource)

        return resource

    async def get_resource_by_id(
        self,
        session: AsyncSession,
        resource_id: UUID,
    ) -> Resource | None:
        statement = select(Resource).where(Resource.id == resource_id)
        result = await session.exec(statement)
        return result.first()

    async def delete_resource(
        self,
        session: AsyncSession,
        resource: Resource,
    ) -> None:
        await session.delete(resource)
        await session.commit()

    async def list_resources(
        self,
        session: AsyncSession,
        challenge_id: UUID | None = None,
    ) -> list[Resource]:
        statement = select(Resource)
        if challenge_id is not None:
            statement = statement.where(Resource.challenge_id == challenge_id)
        statement = statement.order_by(Resource.created_at.desc())

        result = await session.exec(statement)
        return result.all()

    async def list_resources_by_challenge(
        self,
        session: AsyncSession,
        challenge_id: UUID,
    ) -> list[Resource]:
        return await self.list_resources(session, challenge_id)

    async def create_resource_request(
        self,
        session: AsyncSession,
        resource_request: ResourceRequest,
    ) -> ResourceRequest:
        session.add(resource_request)
        await session.commit()
        await session.refresh(resource_request)

        return resource_request

    async def get_resource_request_by_id(
        self,
        session: AsyncSession,
        request_id: UUID,
    ) -> ResourceRequest | None:
        statement = select(ResourceRequest).where(ResourceRequest.id == request_id)
        result = await session.exec(statement)
        return result.first()

    async def delete_resource_request(
        self,
        session: AsyncSession,
        resource_request: ResourceRequest,
    ) -> None:
        await session.delete(resource_request)
        await session.commit()

    async def list_resource_requests(
        self,
        session: AsyncSession,
        challenge_id: UUID | None = None,
    ) -> list[ResourceRequest]:
        statement = select(ResourceRequest)
        if challenge_id is not None:
            statement = statement.where(ResourceRequest.challenge_id == challenge_id)
        statement = statement.order_by(ResourceRequest.created_at.desc())

        result = await session.exec(statement)
        return result.all()

    async def list_resource_requests_by_challenge(
        self,
        session: AsyncSession,
        challenge_id: UUID,
    ) -> list[ResourceRequest]:
        return await self.list_resource_requests(session, challenge_id)