from redis.asyncio import Redis
from app.config import config

JTI_EXPIRY = 3600

token_blocklist = Redis(
    host=config.REDIS_HOST,
    port=config.REDIS_PORT,
    db=0
)

async def add_jti_to_blocklist(jti: str) -> None:
    await token_blocklist.set(
        name=jti,
        value='blacklisted',
        ex=JTI_EXPIRY
    )

async def token_in_blocklist(jti: str) -> bool:
    result = await token_blocklist.get(jti)
    return result is not None
