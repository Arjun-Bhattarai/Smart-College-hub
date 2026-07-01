from fastapi import FastAPI
from app.api.v1.auth import router as auth_router
from app.api.v1.token import router as token_router
from app.api.v1.coding_challenge import router as challenge_router
from app.api.v1.collaboration import router as collaboration_router

app = FastAPI(
    title="Smart College Hub API",
    description="API for Smart College Hub application",
    version="1.0.0",
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(token_router, prefix="/token", tags=["Token"])
app.include_router(challenge_router, prefix="/challenges", tags=["Challenges"])
app.include_router(collaboration_router, prefix="/collaborations", tags=["Collaborations"])