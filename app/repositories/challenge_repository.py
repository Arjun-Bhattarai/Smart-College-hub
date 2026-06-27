from sqlmodel import select
from app.models.challenge import CodingChallenge
class ChallengeRepository:

    async def get_by_id(
        self,
        challenge_id,
        session
    ):
        statement = select(CodingChallenge).where(
            CodingChallenge.id == challenge_id
        )

        result = await session.exec(statement)

        return result.first()