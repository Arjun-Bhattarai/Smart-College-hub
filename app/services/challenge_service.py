from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID

from app.models.challenge import CodingChallenge
from app.models.submission import Submission
from app.repositories.challenge_repository import ChallengeRepository
from app.repositories.submission_repository import SubmissionRepository


class ChallengeService:

    def __init__(self):
        self.challenge_repo = ChallengeRepository()
        self.submission_repo = SubmissionRepository()

    async def create_challenge(
        self,
        session: AsyncSession,
        challenge,
    ):
        db_challenge = CodingChallenge(
            **challenge.model_dump()
        )

        return await self.challenge_repo.create(
            session,
            db_challenge,
        )

    async def get_all_challenges(
        self,
        session: AsyncSession,
    ):
        return await self.challenge_repo.get_all(
            session,
        )

    async def get_challenge(
        self,
        session: AsyncSession,
        challenge_id: UUID,
    ):
        return await self.challenge_repo.get_by_id(
            session,
            challenge_id,
        )

    async def submit_challenge(
        self,
        session: AsyncSession,
        user_id: UUID,
        challenge_id: UUID,
        submission,
    ):
        db_submission = Submission(
            user_id=user_id,
            challenge_id=challenge_id,
            code=submission.code,
            language=submission.language,
        )

        return await self.submission_repo.create(
            session,
            db_submission,
        )

    async def get_user_submissions(
        self,
        session: AsyncSession,
        user_id: UUID,
    ):
        return await self.submission_repo.get_by_user(
            session,
            user_id,
        )

    async def get_leaderboard(
        self,
        session: AsyncSession,
    ):
        return await self.submission_repo.get_leaderboard(
            session,
        )