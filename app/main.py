from fastapi import FastAPI
from app.routes.auth_routes import auth_router
from app.routes.token_routes import token_router
from app.routes.coding_challenge_routes import challenge_routes
from app.routes.collaboration_routes import collaboration_router 

app = FastAPI(
    title="Smart College Hub API",
    description="API for Smart College Hub application",
    version="1.0.0"
)
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(token_router, prefix="/token", tags=["Token"])
app.include_router(challenge_routes, prefix="/challenges", tags=["Challenges"])
app.include_router(collaboration_router, prefix="/collaborations", tags=["Collaborations"])