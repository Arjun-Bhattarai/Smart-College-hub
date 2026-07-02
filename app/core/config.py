from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    DATABASE_URL: str
    ALEMBIC_DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent.parent / ".env",
        extra="ignore"
    )


config = Settings()