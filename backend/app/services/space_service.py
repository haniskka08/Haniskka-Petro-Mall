"""Space service."""

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.space_repo import SpaceRepository
from app.repositories.station_repo import StationRepository
from app.schemas.space import SpaceCreate, SpaceOut, SpaceUpdate


class SpaceService:
    def __init__(self, db: Session):
        self.repo = SpaceRepository(db)
        self.station_repo = StationRepository(db)

    def _assert_station_owned(self, station_id: int, dealer_id: int):
        station = self.station_repo.get_by_id_and_dealer(station_id, dealer_id)
        if station is None:
            raise HTTPException(status_code=404, detail="Station not found.")
        return station

    def _owned_space_or_404(self, space_id: int, dealer_id: int):
        space = self.repo.get_by_id(space_id)
        if space is None:
            raise HTTPException(status_code=404, detail="Space not found.")
        self._assert_station_owned(space.station_id, dealer_id)
        return space

    def list_spaces(self, dealer_id: int) -> list[SpaceOut]:
        return [SpaceOut.model_validate(s) for s in self.repo.get_all_by_dealer_stations(dealer_id)]

    def list_by_station(self, station_id: int, dealer_id: int) -> list[SpaceOut]:
        self._assert_station_owned(station_id, dealer_id)
        return [SpaceOut.model_validate(s) for s in self.repo.get_by_station(station_id)]

    def create_space(self, dealer_id: int, data: SpaceCreate) -> SpaceOut:
        self._assert_station_owned(data.station_id, dealer_id)
        space = self.repo.create(data)
        return SpaceOut.model_validate(space)

    def update_space(self, space_id: int, dealer_id: int, data: SpaceUpdate) -> SpaceOut:
        space = self._owned_space_or_404(space_id, dealer_id)
        updated = self.repo.update(space, data)
        return SpaceOut.model_validate(updated)

    def delete_space(self, space_id: int, dealer_id: int) -> dict:
        space = self._owned_space_or_404(space_id, dealer_id)
        self.repo.delete(space)
        return {"message": "Space deleted successfully."}
