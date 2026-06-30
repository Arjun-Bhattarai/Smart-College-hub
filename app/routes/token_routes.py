from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException


from app.core.security import create_access_token
from app.dependencies.auth import RefreshTokenBearer, RefreshTokenBearer

token_router = APIRouter()


@token_router.get("/refresh")
async def refresh_token(credentials=Depends(RefreshTokenBearer())):

    if datetime.fromtimestamp(credentials["exp"], tz=timezone.utc) <= datetime.now(
        timezone.utc
    ):
        raise HTTPException(400, "Refresh token expired")

    new_access_token = create_access_token(
        data={
            "uid": credentials.get("uid"),
            "email": credentials.get("email"),
            "username": credentials.get("username"),
            "role": credentials.get("role"),
        }
    )

    return {
        "message": "Token refreshed successfully",
        "access_token": new_access_token,
    }
