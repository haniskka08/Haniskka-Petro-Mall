"""Utility service."""

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.utility_repo import UtilityRepository
from app.repositories.station_repo import StationRepository
from app.schemas.utility import UtilityOut, UtilityUpdate


class UtilityService:
    def __init__(self, db: Session):
        self.repo = UtilityRepository(db)
        self.station_repo = StationRepository(db)

    def _assert_owned(self, station_id: int, dealer_id: int):
        if self.station_repo.get_by_id_and_dealer(station_id, dealer_id) is None:
            raise HTTPException(status_code=404, detail="Station not found.")

    def get_utilities(self, station_id: int, dealer_id: int) -> UtilityOut:
        self._assert_owned(station_id, dealer_id)
        utility = self.repo.get_by_station(station_id)
        if utility is None:
            # Return default all-false record without persisting
            return UtilityOut(
                id=0, station_id=station_id,
                electricity=False, water=False, internet=False,
                parking=False, washroom=False, cctv=False,
            )
        return UtilityOut.model_validate(utility)

    def update_utilities(self, station_id: int, dealer_id: int, data: UtilityUpdate) -> UtilityOut:
        self._assert_owned(station_id, dealer_id)
        utility = self.repo.upsert(station_id, data)
        return UtilityOut.model_validate(utility)
