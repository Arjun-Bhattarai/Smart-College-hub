from uuid import UUID
from fastapi import APIRouter

challenge_routes = APIRouter()


@challenge_routes.post("/challenges")
async def create_challenge():
    pass


@challenge_routes.get("/challenges")
async def get_challenges():
    pass


@challenge_routes.get("/challenges/{challenge_id}")
async def get_challenge(
    challenge_id: UUID
):
    pass


@challenge_routes.post(
    "/challenges/{challenge_id}/submit"
)
async def submit_challenge(
    challenge_id: UUID
):
    pass


@challenge_routes.get("/leaderboard")
async def leaderboard():
    pass


@challenge_routes.get(
    "/users/{user_id}/submissions"
)
async def get_user_submissions(
    user_id: UUID
):
    pass