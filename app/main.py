from fastapi import FastAPI
from app.api.v1.auth import auth_router
from app.api.v1.token import  token_router
from app.api.v1.coding_challenge import challenge_routes
from app.api.v1.collaboration.collaboration import collaboration_router
from app.api.v1.collaboration.join_request import collaboration_join_request_router
from app.api.v1.collaboration.membership import collaboration_membership_router

app = FastAPI(
    title="Smart College Hub API",
    description="API for Smart College Hub application",
    version="1.0.0",
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(token_router, prefix="/token", tags=["Token"])
app.include_router(challenge_routes, prefix="/challenges", tags=["Challenges"])
app.include_router(collaboration_router, prefix="/collaborations", tags=["Collaborations"])
app.include_router(collaboration_join_request_router, prefix="/collaborations", tags=["Collaboration Join Requests"])
app.include_router(collaboration_membership_router, prefix="/collaborations", tags=["Collaboration Membership"])