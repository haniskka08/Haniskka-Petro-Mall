"""Station service."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.station_repo import StationRepository
from app.schemas.station import StationCreate, StationOut, StationUpdate


class StationService:
    def __init__(self, db: Session):
        self.repo = StationRepository(db)

    def _owned_or_404(self, station_id: int, dealer_id: int):
        station = self.repo.get_by_id_and_dealer(station_id, dealer_id)
        if station is None:
            raise HTTPException(status_code=404, detail="Station not found.")
        return station

    def list_stations(self, dealer_id: int) -> list[StationOut]:
        return [StationOut.model_validate(s) for s in self.repo.get_all_by_dealer(dealer_id)]

    def get_station(self, station_id: int, dealer_id: int) -> StationOut:
        return StationOut.model_validate(self._owned_or_404(station_id, dealer_id))

    def create_station(self, dealer_id: int, data: StationCreate) -> StationOut:
        station = self.repo.create(dealer_id, data)
        return StationOut.model_validate(station)

    def update_station(self, station_id: int, dealer_id: int, data: StationUpdate) -> StationOut:
        station = self._owned_or_404(station_id, dealer_id)
        updated = self.repo.update(station, data)
        return StationOut.model_validate(updated)

    def delete_station(self, station_id: int, dealer_id: int) -> dict:
        station = self._owned_or_404(station_id, dealer_id)
        self.repo.delete(station)
        return {"message": "Station deleted successfully."}
