from app.repositories.challenge_repository import ChallengeRepository
from app.repositories.submission_repository import SubmissionRepository


class ChallengeService:

    def __init__(self):
        self.challenge_repo = ChallengeRepository()
        self.submission_repo = SubmissionRepository()

    async def create_challenge(
        self,
        session,
        challenge,
    ):
        return await self.challenge_repo.create(
            session,
            challenge,
        )

    async def get_all_challenges(
        self,
        session,
    ):
        return await self.challenge_repo.get_all(
            session,
        )

    async def get_challenge(
        self,
        session,
        challenge_id,
    ):
        return await self.challenge_repo.get_by_id(
            session,
            challenge_id,
        )

    async def submit_challenge(
        self,
        session,
        challenge_id,
        submission,
    ):
        return await self.submission_repo.create(
            session,
            submission,
        )

    async def get_user_submissions(
        self,
        session,
        user_id,
    ):
        return await self.submission_repo.get_by_user(
            session,
            user_id,
        )

    async def get_leaderboard(
        self,
        session,
    ):
        return await self.submission_repo.get_leaderboard(
            session
        )