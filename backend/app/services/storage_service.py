from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config import get_settings

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_BYTES = 5 * 1024 * 1024


async def save_property_image(property_id: uuid.UUID, file: UploadFile) -> tuple[str, str]:
    settings = get_settings()
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large (max 5MB)")
    ext = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }[content_type]
    name = f"{uuid.uuid4().hex}{ext}"
    folder = settings.uploads_path / str(property_id)
    folder.mkdir(parents=True, exist_ok=True)
    dest = folder / name
    dest.write_bytes(data)
    storage_path = f"{property_id}/{name}"
    public_url = f"/uploads/{storage_path}"
    return public_url, storage_path
