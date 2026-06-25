from fastapi import Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.exceptions import HTTPException
from typing import Any, List

from app.core.security import decode_access_token
from app.db.redis import token_in_blocklist
from app.db.main import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from app.services.auth_service import AuthService
from app.models.user import User

from uuid import UUID
from fastapi import Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession


user_service = AuthService()


class AccessToken(HTTPBearer):
    async def __call__(self, request: Request) -> dict:
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)

        token_data = decode_access_token(credentials.credentials)

        if await token_in_blocklist(token_data.get("jti")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is blacklisted",
            )

        self.verify_token_data(token_data)  
        return token_data

    def verify_token_data(self, token_data: dict) -> None:
        raise NotImplementedError


class AccessTokenBearer(AccessToken):
    def verify_token_data(self, token_data: dict) -> None:
        if token_data.get("refresh"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Please provide an access token",
            )


class RefreshTokenBearer(AccessToken):
    def verify_token_data(self, token_data: dict) -> None:
        if not token_data.get("refresh"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Please provide a refresh token",
            )


async def get_current_user(
    token_data: dict = Depends(AccessTokenBearer()),
    db: AsyncSession = Depends(get_session),
) -> User:

    uid = token_data.get("uid")

    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UID missing in token",
        )

    try:
        user_id = UUID(uid)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid UID format",
        )

    user = await user_service.get_user_by_id(user_id, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]) -> None:
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> bool:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission",
            )
        return True