from fastapi import HTTPException
from pathlib import Path
import re
from uuid import UUID, uuid4

from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.resource import Resource
from app.models.resource_request import ResourceRequest
from app.models.user import User
from app.repositories.coding_challenge_repository import ChallengeRepository
from app.repositories.resource_repository import ResourceRepository


class ResourceService:

    def __init__(self):
        self.resource_repo = ResourceRepository()
        self.challenge_repo = ChallengeRepository()
        self.upload_root = (
            Path(__file__).resolve().parent.parent.parent
            / "uploads"
            / "resources"
        )

    async def get_challenge(
        self,
        session: AsyncSession,
        challenge_id: UUID,
    ):
        return await self.challenge_repo.get_by_id(session, challenge_id)

    async def create_resource_request(
        self,
        session: AsyncSession,
        challenge_id: UUID | None,
        requester_id: UUID,
        message: str,
    ):
        db_request = ResourceRequest(
            challenge_id=challenge_id,
            requester_id=requester_id,
            message=message,
        )

        return await self.resource_repo.create_resource_request(
            session,
            db_request,
        )

    async def list_resource_requests(
        self,
        session: AsyncSession,
        challenge_id: UUID | None = None,
    ):
        return await self.resource_repo.list_resource_requests(
            session,
            challenge_id,
        )

    async def delete_resource_request(
        self,
        session: AsyncSession,
        request_id: UUID,
        current_user: User,
    ):
        db_request = await self.resource_repo.get_resource_request_by_id(session, request_id)
        if not db_request:
            raise HTTPException(status_code=404, detail="Resource request not found.")

        is_admin = getattr(current_user, "role", "").lower() == "admin"
        if db_request.requester_id != current_user.uid and not is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to delete this request.")

        await self.resource_repo.delete_resource_request(session, db_request)
        return {"detail": "Resource request deleted successfully."}

    async def upload_resource(
        self,
        session: AsyncSession,
        challenge_id: UUID | None,
        uploader_id: UUID,
        title: str,
        description: str | None,
        original_file_name: str,
        content: bytes,
    ):
        safe_name = Path(original_file_name or "resource").name
        safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", safe_name)
        stored_file_name = f"{uuid4()}_{safe_name}"

        folder_name = str(challenge_id) if challenge_id else "general"
        destination_dir = self.upload_root / folder_name
        destination_dir.mkdir(parents=True, exist_ok=True)

        destination_file = destination_dir / stored_file_name
        destination_file.write_bytes(content)

        file_path = f"resources/{folder_name}/{stored_file_name}"

        db_resource = Resource(
            challenge_id=challenge_id,
            uploader_id=uploader_id,
            title=title,
            description=description,
            file_name=safe_name,
            file_path=file_path,
        )

        return await self.resource_repo.create_resource(
            session,
            db_resource,
        )

    async def list_resources(
        self,
        session: AsyncSession,
        challenge_id: UUID | None = None,
    ):
        return await self.resource_repo.list_resources(
            session,
            challenge_id,
        )

    async def delete_resource(
        self,
        session: AsyncSession,
        resource_id: UUID,
        current_user: User,
    ):
        db_resource = await self.resource_repo.get_resource_by_id(session, resource_id)
        if not db_resource:
            raise HTTPException(status_code=404, detail="Resource not found.")

        is_admin = getattr(current_user, "role", "").lower() == "admin"
        if db_resource.uploader_id != current_user.uid and not is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to delete this resource.")

        # Try removing physical file
        try:
            full_file_path = self.upload_root.parent / db_resource.file_path
            if full_file_path.exists():
                full_file_path.unlink()
        except Exception:
            pass

        await self.resource_repo.delete_resource(session, db_resource)
        return {"detail": "Resource deleted successfully."}


resource_service = ResourceService()
