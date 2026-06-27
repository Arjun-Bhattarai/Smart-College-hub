from app.repositories.challenge_repository import ChallengeRepository

class ChallengeService:

    def __init__(self):
        self.repo = ChallengeRepository()

    async def get_challenge(
        self,
        challenge_id,
        session
    ):
        return await self.repo.get_by_id(
            challenge_id,
            session
        )