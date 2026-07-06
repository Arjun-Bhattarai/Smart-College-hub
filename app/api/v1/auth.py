from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.schemas.user_schema import UserCreate, UserLogin, UserResponse
from app.services.auth_service import AuthService
from app.db.session import get_session
from app.core.security import create_access_token, verify_password
from app.dependencies.auth import AccessTokenBearer, get_current_user, RoleChecker
from app.db.redis import add_jti_to_blocklist
from app.dependencies.collaboration import get_collaboration_service

auth_router = APIRouter()
auth_service = AuthService()

refresh_token_expires_delta = 3600 * 24 * 7
role_checker = RoleChecker(["admin", "student", "teacher"])



@auth_router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate, session: AsyncSession = Depends(get_session)):

    if await auth_service.user_exists(user.email, user.username, session):
        raise HTTPException(status_code=400, detail="User already exists")

    db_user = await auth_service.create_user(user, session)

    return UserResponse.model_validate(db_user)


@auth_router.post("/login")
async def login_users(user: UserLogin, session: AsyncSession = Depends(get_session)):

    db_user = await auth_service.get_user_by_email(user.email, session)

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={
            "uid": str(db_user.uid),
            "email": db_user.email,
            "username": db_user.username,
            "role": db_user.role,
        }
    )

    refresh_token = create_access_token(
        data={
            "uid": str(db_user.uid),
            "email": db_user.email,
            "username": db_user.username,
            "role": db_user.role,
        },
        expires_delta=refresh_token_expires_delta,
        refresh_token=True,
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "uid": str(db_user.uid),
            "email": db_user.email,
            "username": db_user.username,
            "role": db_user.role,
        },
    }


@auth_router.get("/logout")
async def logout(credentials=Depends(AccessTokenBearer())):
    jti = credentials.get("jti")

    if jti:
        await add_jti_to_blocklist(jti)

    return {"message": "Logout successful"}

@auth_router.get("/profile", response_model=UserResponse)
async def me(
    user=Depends(get_current_user),
):
    return UserResponse.model_validate(user)

