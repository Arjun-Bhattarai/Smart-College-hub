from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.coding_challenge import CodingChallenge


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
        await session.delete(challenge)
        await session.commit()