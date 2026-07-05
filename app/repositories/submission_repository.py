from uuid import UUID

from sqlalchemy import desc, func
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.submission import Submission


class SubmissionRepository:

    async def create(
        self,
        session: AsyncSession,
        submission: Submission,
    ) -> Submission:
        session.add(submission)
        await session.commit()
        await session.refresh(submission)

        return submission

    async def get_by_user(
        self,
        session: AsyncSession,
        user_id: UUID,
    ) -> list[Submission]:
        statement = (
            select(Submission)
            .where(Submission.user_id == user_id)
            .order_by(Submission.submitted_at.desc())
        )

        result = await session.exec(statement)

        return result.all()

    async def get_by_challenge(
        self,
        session: AsyncSession,
        challenge_id: UUID,
    ) -> list[Submission]:
        statement = (
            select(Submission)
            .where(Submission.challenge_id == challenge_id)
            .order_by(Submission.submitted_at.desc())
        )

        result = await session.exec(statement)

        return result.all()

    async def get_by_id(
        self,
        session: AsyncSession,
        submission_id: UUID,
    ) -> Submission | None:
        statement = select(Submission).where(
            Submission.id == submission_id
        )

        result = await session.exec(statement)

        return result.first()

    async def get_leaderboard(
        self,
        session: AsyncSession,
    ) -> list[dict]:
        statement = (
            select(
                Submission.user_id,
                func.sum(Submission.score).label("points"),
            )
            .group_by(Submission.user_id)
            .order_by(desc("points"))
            .limit(10)
        )

        result = await session.exec(statement)
        rows = result.all()

        return [
            {
                "user_id": str(row.user_id),  
                "points": row.points,
            }
            for row in rows
        ]

    async def delete(
        self,
        session: AsyncSession,
        submission: Submission,
    ) -> None:
        await session.delete(submission)
        await session.commit()