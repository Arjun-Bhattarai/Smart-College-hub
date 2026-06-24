from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    #APP_NAME: str
    #APP_ENV: str
    DATABASE_URL: str
    JWT_SECRET: str#yo secret key ho, yo key lai JWT token create garna use garincha, yo key lai secure rakhna parcha, production ma environment variable ma rakhna parcha.
    JWT_ALGORITHM: str
    #ACCESS_TOKEN_EXPIRE_MINUTES: int
    REDIS_HOST: str='localhost'#yo host ho, yo host lai Redis server ko address ho, yo address lai secure rakhna parcha, production ma environment variable ma rakhna parcha.
    REDIS_PORT: int=6379#yo port ho, yo port lai Redis server ko port ho, yo port lai secure rakhna parcha, production ma environment variable ma rakhna parcha.

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent / ".env",  # points to src/.env
        extra="ignore"
    )

config = Settings()