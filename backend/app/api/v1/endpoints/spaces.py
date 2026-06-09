"""Space CRUD endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_dealer
from app.db.session import get_db
from app.schemas.space import SpaceCreate, SpaceOut, SpaceUpdate
from app.services.space_service import SpaceService

router = APIRouter(prefix="/spaces", tags=["Spaces"])


@router.get("/", response_model=list[SpaceOut])
def list_spaces(db: Session = Depends(get_db), current_dealer=Depends(get_current_dealer)):
    return SpaceService(db).list_spaces(current_dealer.id)


@router.post("/", response_model=SpaceOut, status_code=201)
def create_space(
    data: SpaceCreate,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return SpaceService(db).create_space(current_dealer.id, data)


@router.put("/{space_id}", response_model=SpaceOut)
def update_space(
    space_id: int,
    data: SpaceUpdate,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return SpaceService(db).update_space(space_id, current_dealer.id, data)


@router.delete("/{space_id}")
def delete_space(
    space_id: int,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return SpaceService(db).delete_space(space_id, current_dealer.id)
