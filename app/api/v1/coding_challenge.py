from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.dependencies.auth import (
    get_current_user,
    RoleChecker,
)
from app.models.user import User
from app.schemas.coding_challenge_schema import ChallengeCreate
from app.schemas.submission_schema import SubmissionCreate
from app.services.coding_challenge_service import ChallengeService


challenge_routes = APIRouter()

challenge_service = ChallengeService()
admin_only = RoleChecker(["admin"])



@challenge_routes.post(
    "/",
    dependencies=[Depends(admin_only)],
)
async def create_challenge(
    challenge: ChallengeCreate,
    session: AsyncSession = Depends(get_session),
):
    return await challenge_service.create_challenge(
        session,
        challenge,
    )


@challenge_routes.get("/")
async def get_challenges(
    session: AsyncSession = Depends(get_session),
):
    return await challenge_service.get_all_challenges(
        session,
    )


@challenge_routes.get("/leaderboard")
async def leaderboard(
    session: AsyncSession = Depends(get_session),
):
    return await challenge_service.get_leaderboard(
        session,
    )


@challenge_routes.get("/my-submissions")
async def my_submissions(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await challenge_service.get_user_submissions(
        session,
        current_user.uid,
    )


@challenge_routes.get(
    "/users/{user_id}/submissions",
    dependencies=[Depends(admin_only)],
)
async def get_user_submissions(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    return await challenge_service.get_user_submissions(
        session,
        user_id,
    )


@challenge_routes.get("/{challenge_id}")
async def get_challenge(
    challenge_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    challenge = await challenge_service.get_challenge(
        session,
        challenge_id,
    )

    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    return challenge


@challenge_routes.post("/{challenge_id}/submit")
async def submit_challenge(
    challenge_id: UUID,
    submission: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    challenge = await challenge_service.get_challenge(
        session,
        challenge_id,
    )

    if challenge is None:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    return await challenge_service.submit_challenge(
        session,
        current_user.uid,
        challenge_id,
        submission,
    )