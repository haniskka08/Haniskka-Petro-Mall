"""Image upload endpoints."""

from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path

from app.core.security import get_current_dealer
from app.db.session import get_db
from app.schemas.image import ImageOut
from app.services.image_service import ImageService

router = APIRouter(prefix="/stations", tags=["Layout Images"])


@router.get("/{station_id}/images", response_model=list[ImageOut])
def list_images(
    station_id: int,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return ImageService(db).list_images(station_id, current_dealer.id)


@router.post("/{station_id}/images", response_model=ImageOut, status_code=201)
async def upload_image(
    station_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return await ImageService(db).upload_image(station_id, current_dealer.id, file)


@router.delete("/images/{image_id}")
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return ImageService(db).delete_image(image_id, current_dealer.id)


@router.get("/images/{image_id}/file")
def serve_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    """Serve the raw image file."""
    from app.repositories.image_repo import ImageRepository
    from fastapi import HTTPException
    img = ImageRepository(db).get_by_id(image_id)
    if img is None or not Path(img.file_path).exists():
        raise HTTPException(status_code=404, detail="Image file not found.")
    return FileResponse(img.file_path, media_type=img.mime_type or "image/jpeg")
