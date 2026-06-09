"""Station CRUD endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_dealer
from app.db.session import get_db
from app.schemas.station import StationCreate, StationOut, StationUpdate
from app.services.station_service import StationService

router = APIRouter(prefix="/stations", tags=["Stations"])


@router.get("/", response_model=list[StationOut])
def list_stations(db: Session = Depends(get_db), current_dealer=Depends(get_current_dealer)):
    return StationService(db).list_stations(current_dealer.id)


@router.post("/", response_model=StationOut, status_code=201)
def create_station(
    data: StationCreate,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return StationService(db).create_station(current_dealer.id, data)


@router.get("/{station_id}", response_model=StationOut)
def get_station(station_id: int, db: Session = Depends(get_db), current_dealer=Depends(get_current_dealer)):
    return StationService(db).get_station(station_id, current_dealer.id)


@router.put("/{station_id}", response_model=StationOut)
def update_station(
    station_id: int,
    data: StationUpdate,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return StationService(db).update_station(station_id, current_dealer.id, data)


@router.delete("/{station_id}")
def delete_station(station_id: int, db: Session = Depends(get_db), current_dealer=Depends(get_current_dealer)):
    return StationService(db).delete_station(station_id, current_dealer.id)
