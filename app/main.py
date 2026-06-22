from fastapi import FastAPI

from app.routes.auth_routes import auth_router
app = FastAPI(
    title="Smart College Hub API",
    description="API for Smart College Hub application",
    version="1.0.0"
)
app.include_router(auth_router, prefix="/api", tags=["Auth"])