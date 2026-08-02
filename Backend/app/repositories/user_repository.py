from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.user import User


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: UUID):
        statement = select(User).where(User.uid == user_id)
        result = await self.session.exec(statement)
        return result.first()

    async def get_by_email(self, email: str):
        statement = select(User).where(User.email == email)
        result = await self.session.exec(statement)
        return result.first()

    async def get_all(self):
        statement = select(User)
        result = await self.session.exec(statement)
        return result.all()

    async def create(self, user: User):
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def update(self, user: User):
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def delete(self, user: User):
        await self.session.delete(user)
        await self.session.commit()