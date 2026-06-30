from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
import jwt
import uuid
from uuid import UUID
from app.config import config

password_context = CryptContext(schemes=["bcrypt"])

ACCESS_TOKEN_EXPIRE = 3600
REFRESH_TOKEN_EXPIRE = 86400 * 7



def generate_password_hash(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_context.verify(password, hashed_password)



def create_access_token(
    data: dict,
    expires_delta: int = ACCESS_TOKEN_EXPIRE,
    refresh_token: bool = False,
) -> str:

    uid = data.get("uid")

    if not uid:
        raise ValueError("UID is required to create token")

    try:
        uid = str(UUID(uid))  
    except Exception:
        raise ValueError("UID must be a valid UUID")

    payload = {
        "uid": uid,
        "exp": datetime.now(timezone.utc) + timedelta(seconds=expires_delta),
        "jti": str(uuid.uuid4()),
        "refresh": refresh_token,
        "email": data.get("email"),
        "username": data.get("username"),
        "role": data.get("role"),
    }

    return jwt.encode(payload, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)



def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            config.JWT_SECRET,
            algorithms=[config.JWT_ALGORITHM],
        )

        uid = payload.get("uid")

        if not uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="UID missing in token",
            )

        try:
            payload["uid"] = str(UUID(uid))  
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid UID format in token",
            )

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )