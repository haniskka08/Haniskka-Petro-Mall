"""Image service — file upload, storage and metadata persistence."""

import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.repositories.image_repo import ImageRepository
from app.repositories.station_repo import StationRepository
from app.schemas.image import ImageOut

settings = get_settings()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_SIZE_BYTES = settings.max_upload_size_mb * 1024 * 1024


class ImageService:
    def __init__(self, db: Session):
        self.repo = ImageRepository(db)
        self.station_repo = StationRepository(db)

    def _assert_owned(self, station_id: int, dealer_id: int):
        if self.station_repo.get_by_id_and_dealer(station_id, dealer_id) is None:
            raise HTTPException(status_code=404, detail="Station not found.")

    def list_images(self, station_id: int, dealer_id: int) -> list[ImageOut]:
        self._assert_owned(station_id, dealer_id)
        return [ImageOut.model_validate(img) for img in self.repo.get_by_station(station_id)]

    async def upload_image(self, station_id: int, dealer_id: int, file: UploadFile) -> ImageOut:
        self._assert_owned(station_id, dealer_id)

        # Validate extension
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type '{suffix}' not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}",
            )

        # Read and validate size
        content = await file.read()
        if len(content) > MAX_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {settings.max_upload_size_mb} MB.",
            )

        # Save to disk
        upload_dir = Path(settings.upload_dir) / str(station_id)
        upload_dir.mkdir(parents=True, exist_ok=True)
        unique_name = f"{uuid.uuid4().hex}{suffix}"
        file_path = upload_dir / unique_name
        file_path.write_bytes(content)

        # Persist metadata
        image = self.repo.create(
            station_id=station_id,
            file_name=file.filename or unique_name,
            file_path=str(file_path),
            file_size=len(content),
            mime_type=file.content_type or "application/octet-stream",
        )
        return ImageOut.model_validate(image)

    def delete_image(self, image_id: int, dealer_id: int) -> dict:
        image = self.repo.get_by_id(image_id)
        if image is None:
            raise HTTPException(status_code=404, detail="Image not found.")
        self._assert_owned(image.station_id, dealer_id)

        # Remove file from disk (best-effort)
        try:
            Path(image.file_path).unlink(missing_ok=True)
        except Exception:
            pass

        self.repo.delete(image)
        return {"message": "Image deleted."}
