from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.coding_challenge import CodingChallenge
from app.models.challenge_resource import ChallengeResource
from app.models.challenge_resource_request import ChallengeResourceRequest
from app.models.submission import Submission


class ChallengeRepository:

    async def create(
        self,
        session: AsyncSession,
        challenge: CodingChallenge,
    ) -> CodingChallenge:
        session.add(challenge)
        await session.commit()
        await session.refresh(challenge)

        return challenge

    async def get_all(
        self,
        session: AsyncSession,
    ) -> list[CodingChallenge]:
        statement = select(CodingChallenge)

        result = await session.exec(statement)

        return result.all()

    async def get_by_id(
        self,
        session: AsyncSession,
        challenge_id: UUID,
    ) -> CodingChallenge | None:
        statement = select(CodingChallenge).where(
            CodingChallenge.id == challenge_id
        )

        result = await session.exec(statement)

        return result.first()

    async def delete(
        self,
        session: AsyncSession,
        challenge: CodingChallenge,
    ) -> None:
        statement = select(Submission).where(
            Submission.challenge_id == challenge.id
        )

        result = await session.exec(statement)

        if result.first() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete challenge: submissions exist for it",
            )

        await session.delete(challenge)
        await session.commit()

    async def create_resource(
        self,
        session: AsyncSession,
        resource: ChallengeResource,
    ) -> ChallengeResource:
        session.add(resource)
        await session.commit()
        await session.refresh(resource)

        return resource

    async def list_resources_by_challenge(
        self,
        session: AsyncSession,
        challenge_id: UUID,
    ) -> list[ChallengeResource]:
        statement = (
            select(ChallengeResource)
            .where(ChallengeResource.challenge_id == challenge_id)
            .order_by(ChallengeResource.created_at.desc())
        )

        result = await session.exec(statement)

        return result.all()

    async def create_resource_request(
        self,
        session: AsyncSession,
        resource_request: ChallengeResourceRequest,
    ) -> ChallengeResourceRequest:
        session.add(resource_request)
        await session.commit()
        await session.refresh(resource_request)

        return resource_request

    async def list_resource_requests_by_challenge(
        self,
        session: AsyncSession,
        challenge_id: UUID,
    ) -> list[ChallengeResourceRequest]:
        statement = (
            select(ChallengeResourceRequest)
            .where(ChallengeResourceRequest.challenge_id == challenge_id)
            .order_by(ChallengeResourceRequest.created_at.desc())
        )

        result = await session.exec(statement)

        return result.all()