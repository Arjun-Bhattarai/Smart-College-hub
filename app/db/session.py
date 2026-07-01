from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import SQLModel
from app.core.config import config
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(config.DATABASE_URL, echo=True)

# Move async_sessionmaker outside get_session — no need to recreate it on every request
Session =sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session() -> AsyncSession:
    async with Session() as session:
        yield session