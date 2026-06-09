"""Utilities endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_dealer
from app.db.session import get_db
from app.schemas.utility import UtilityOut, UtilityUpdate
from app.services.utility_service import UtilityService

router = APIRouter(prefix="/stations", tags=["Utilities"])


@router.get("/{station_id}/utilities", response_model=UtilityOut)
def get_utilities(
    station_id: int,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return UtilityService(db).get_utilities(station_id, current_dealer.id)


@router.put("/{station_id}/utilities", response_model=UtilityOut)
def update_utilities(
    station_id: int,
    data: UtilityUpdate,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return UtilityService(db).update_utilities(station_id, current_dealer.id, data)
