"""Station repository."""

from sqlalchemy.orm import Session

from app.models.station import Station
from app.schemas.station import StationCreate, StationUpdate


class StationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_by_dealer(self, dealer_id: int) -> list[Station]:
        return self.db.query(Station).filter(Station.dealer_id == dealer_id).all()

    def get_by_id(self, station_id: int) -> Station | None:
        return self.db.get(Station, station_id)

    def get_by_id_and_dealer(self, station_id: int, dealer_id: int) -> Station | None:
        return (
            self.db.query(Station)
            .filter(Station.id == station_id, Station.dealer_id == dealer_id)
            .first()
        )

    def create(self, dealer_id: int, data: StationCreate) -> Station:
        station = Station(dealer_id=dealer_id, **data.model_dump())
        self.db.add(station)
        self.db.commit()
        self.db.refresh(station)
        return station

    def update(self, station: Station, data: StationUpdate) -> Station:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(station, field, value)
        self.db.commit()
        self.db.refresh(station)
        return station

    def delete(self, station: Station) -> None:
        self.db.delete(station)
        self.db.commit()

    def count_by_dealer(self, dealer_id: int) -> int:
        return self.db.query(Station).filter(Station.dealer_id == dealer_id).count()
