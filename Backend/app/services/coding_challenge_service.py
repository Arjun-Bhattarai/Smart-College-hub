from fastapi import HTTPException
from pathlib import Path
import re

from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID, uuid4

from app.models.coding_challenge import CodingChallenge
from app.models.challenge_resource import ChallengeResource
from app.models.challenge_resource_request import ChallengeResourceRequest
from app.models.submission import Submission
from app.repositories.coding_challenge_repository import ChallengeRepository
from app.repositories.submission_repository import SubmissionRepository
from app.schemas.submission_schema import SubmissionReview


class ChallengeService:

    def __init__(self):
        self.challenge_repo = ChallengeRepository()
        self.submission_repo = SubmissionRepository()
        self.upload_root = Path(__file__).resolve().parent.parent.parent / "uploads" / "resources"

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

    async def get_challenge_submissions(
        self,
        session: AsyncSession,
        challenge_id: UUID,
    ):
        return await self.submission_repo.get_by_challenge(
            session,
            challenge_id,
        )

    async def get_submission(
        self,
        session: AsyncSession,
        submission_id: UUID,
    ):
        return await self.submission_repo.get_by_id(
            session,
            submission_id,
        )

    async def get_leaderboard(
        self,
        session: AsyncSession,
    ):
        return await self.submission_repo.get_leaderboard(
            session,
        )

    async def review_submission(
        self,
        session: AsyncSession,
        submission_id: UUID,
        review_data: SubmissionReview,
    ):
        submission = await self.submission_repo.get_by_id(
            session,
            submission_id,
        )

        if not submission:
            raise HTTPException(
                status_code=404,
                detail="Submission not found.",
            )

        submission.score = review_data.score
        submission.status = review_data.status
        submission.feedback = review_data.feedback

        return await self.submission_repo.review_submission(
            session,
            submission,
        )

    async def delete_challenge(
        self,
        session: AsyncSession,
        challenge_id: UUID,
    ):
        challenge = await self.challenge_repo.get_by_id(
            session,
            challenge_id,
        )

        if not challenge:
            raise HTTPException(
                status_code=404,
                detail="Challenge not found",
            )

        return await self.challenge_repo.delete(
            session,
            challenge,
        )

    async def create_resource_request(
        self,
        session: AsyncSession,
        challenge_id: UUID,
        requester_id: UUID,
        message: str,
    ):
        db_request = ChallengeResourceRequest(
            challenge_id=challenge_id,
            requester_id=requester_id,
            message=message,
        )

        return await self.challenge_repo.create_resource_request(
            session,
            db_request,
        )

    async def list_resource_requests(
        self,
        session: AsyncSession,
        challenge_id: UUID,
    ):
        return await self.challenge_repo.list_resource_requests_by_challenge(
            session,
            challenge_id,
        )

    async def upload_resource(
        self,
        session: AsyncSession,
        challenge_id: UUID,
        uploader_id: UUID,
        title: str,
        description: str | None,
        original_file_name: str,
        content: bytes,
    ):
        safe_name = Path(original_file_name or "resource").name
        safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", safe_name)
        stored_file_name = f"{uuid4()}_{safe_name}"

        destination_dir = self.upload_root / str(challenge_id)
        destination_dir.mkdir(parents=True, exist_ok=True)

        destination_file = destination_dir / stored_file_name
        destination_file.write_bytes(content)

        file_path = f"resources/{challenge_id}/{stored_file_name}"

        db_resource = ChallengeResource(
            challenge_id=challenge_id,
            uploader_id=uploader_id,
            title=title,
            description=description,
            file_name=safe_name,
            file_path=file_path,
        )

        return await self.challenge_repo.create_resource(
            session,
            db_resource,
        )

    async def list_resources(
        self,
        session: AsyncSession,
        challenge_id: UUID,
    ):
        return await self.challenge_repo.list_resources_by_challenge(
            session,
            challenge_id,
        )
