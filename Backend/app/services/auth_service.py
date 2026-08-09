
from uuid import UUID

from fastapi import HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db import session
from app.core.security import generate_password_hash
from app.models.user import User
from app.schemas.user_schema import UserCreate


class AuthService:

    async def get_user_by_email(
        self,
        email: str,
        session: AsyncSession,
    ):
        statement = select(User).where(User.email == email)
        result = await session.exec(statement)
        return result.first()

    async def get_user_by_id(
        self,
        user_id: UUID,
        session: AsyncSession,
    ):
        statement = select(User).where(User.uid == user_id)
        result = await session.exec(statement)
        return result.first()

    async def get_user(
        self,
        email: str,
        username: str,
        session: AsyncSession,
    ):
        statement = select(User).where(
            (User.email == email) | (User.username == username)
        )
        result = await session.exec(statement)
        return result.first()

    async def user_exists(
        self,
        email: str,
        username: str,
        session: AsyncSession,
    ):
        user = await self.get_user(
            email,
            username,
            session,
        )
        return user is not None

    async def create_user(
        self,
        user_data: UserCreate,
        session: AsyncSession,
    ):
        user_data_dict = user_data.model_dump()

        user_data_dict["password"] = generate_password_hash(
            user_data_dict["password"]
        )

        new_user = User(**user_data_dict)
        new_user.role = "user"

        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)

        return new_user

    async def get_all_users(
        self,
        session: AsyncSession,
    ):
        statement = select(User)
        result = await session.exec(statement)
        return result.all()

    async def disable_user(
        self,
        user_id: UUID,
        session: AsyncSession,
    ):
        user = await self.get_user_by_id(user_id, session)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        if user.role.lower() == "admin":
            raise HTTPException(
                status_code=403,
                detail="Admins cannot disable another admin",
            )

        user.is_active = False

        session.add(user)
        await session.commit()
        await session.refresh(user)

        return {"message": "User disabled successfully"}

    async def enable_user(
        self,
        user_id: UUID,
        session: AsyncSession,
    ):
        user = await self.get_user_by_id(user_id, session)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        if user.role.lower() == "admin":
            raise HTTPException(
                status_code=403,
                detail="Admins cannot modify another admin",
            )

        user.is_active = True

        session.add(user)
        await session.commit()
        await session.refresh(user)

        return {"message": "User enabled successfully"}

