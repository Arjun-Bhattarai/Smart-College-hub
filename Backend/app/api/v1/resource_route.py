from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from uuid import UUID
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.resource_schema import ResourceRequestCreate, ResourceRequestResponse, ResourceResponse
from app.services.resource_service import resource_service




route = APIRouter()


@route.get("")
@route.get("/")
async def get_all_resources(
    challenge_id: UUID | None = None,
    session: AsyncSession = Depends(get_session),
):
    resources = await resource_service.list_resources(
        session,
        challenge_id,
    )

    return [
        {
            "id": resource.id,
            "challenge_id": resource.challenge_id,
            "uploader_id": resource.uploader_id,
            "title": resource.title,
            "description": resource.description,
            "file_name": resource.file_name,
            "file_url": f"/uploads/{resource.file_path}",
            "created_at": resource.created_at,
        }
        for resource in resources
    ]


@route.get("/requests")
async def get_all_resource_requests(
    challenge_id: UUID | None = None,
    session: AsyncSession = Depends(get_session),
):
    return await resource_service.list_resource_requests(
        session,
        challenge_id,
    )


@route.post("/requests")
async def create_resource_request(
    payload: ResourceRequestCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await resource_service.create_resource_request(
        session,
        payload.challenge_id,
        current_user.uid,
        payload.message,
    )


@route.post("/upload")
async def upload_resource(
    title: str = Form(...),
    description: str | None = Form(default=None),
    challenge_id: UUID | None = Form(default=None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    resource = await resource_service.upload_resource(
        session,
        challenge_id,
        current_user.uid,
        title,
        description,
        file.filename or "resource",
        content,
    )

    return {
        "id": resource.id,
        "challenge_id": resource.challenge_id,
        "uploader_id": resource.uploader_id,
        "title": resource.title,
        "description": resource.description,
        "file_name": resource.file_name,
        "file_url": f"/uploads/{resource.file_path}",
        "created_at": resource.created_at,
    }


@route.delete("/{resource_id}")
async def delete_resource(
    resource_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await resource_service.delete_resource(
        session,
        resource_id,
        current_user,
    )


@route.delete("/requests/{request_id}")
async def delete_resource_request(
    request_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await resource_service.delete_resource_request(
        session,
        request_id,
        current_user,
    )


# Legacy challenge-scoped endpoints kept for backwards compatibility
@route.get("/{challenge_id}/resources")
async def get_challenge_resources(
    challenge_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    challenge = await resource_service.get_challenge(
        session,
        challenge_id,
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found.",
        )

    resources = await resource_service.list_resources(
        session,
        challenge_id,
    )

    return [
        {
            "id": resource.id,
            "challenge_id": resource.challenge_id,
            "uploader_id": resource.uploader_id,
            "title": resource.title,
            "description": resource.description,
            "file_name": resource.file_name,
            "file_url": f"/uploads/{resource.file_path}",
            "created_at": resource.created_at,
        }
        for resource in resources
    ]


@route.get("/{challenge_id}/resource-requests")
async def get_challenge_resource_requests(
    challenge_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    challenge = await resource_service.get_challenge(
        session,
        challenge_id,
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found.",
        )

    return await resource_service.list_resource_requests(
        session,
        challenge_id,
    )


@route.post("/{challenge_id}/resource-requests")
async def create_challenge_resource_request(
    challenge_id: UUID,
    payload: ResourceRequestCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    challenge = await resource_service.get_challenge(
        session,
        challenge_id,
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found.",
        )

    return await resource_service.create_resource_request(
        session,
        challenge_id,
        current_user.uid,
        payload.message,
    )


@route.post("/{challenge_id}/resources/upload")
async def upload_challenge_resource(
    challenge_id: UUID,
    title: str = Form(...),
    description: str | None = Form(default=None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    challenge = await resource_service.get_challenge(
        session,
        challenge_id,
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found.",
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    resource = await resource_service.upload_resource(
        session,
        challenge_id,
        current_user.uid,
        title,
        description,
        file.filename or "resource",
        content,
    )

    return {
        "id": resource.id,
        "challenge_id": resource.challenge_id,
        "uploader_id": resource.uploader_id,
        "title": resource.title,
        "description": resource.description,
        "file_name": resource.file_name,
        "file_url": f"/uploads/{resource.file_path}",
        "created_at": resource.created_at,
    }
