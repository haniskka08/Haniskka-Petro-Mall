"""Space repository."""

from sqlalchemy.orm import Session

from app.models.space import Space
from app.schemas.space import SpaceCreate, SpaceUpdate


class SpaceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_by_dealer_stations(self, dealer_id: int) -> list[Space]:
        from app.models.station import Station
        return (
            self.db.query(Space)
            .join(Station, Space.station_id == Station.id)
            .filter(Station.dealer_id == dealer_id)
            .all()
        )

    def get_by_station(self, station_id: int) -> list[Space]:
        return self.db.query(Space).filter(Space.station_id == station_id).all()

    def get_by_id(self, space_id: int) -> Space | None:
        return self.db.get(Space, space_id)

    def create(self, data: SpaceCreate) -> Space:
        space = Space(**data.model_dump())
        self.db.add(space)
        self.db.commit()
        self.db.refresh(space)
        return space

    def update(self, space: Space, data: SpaceUpdate) -> Space:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(space, field, value)
        self.db.commit()
        self.db.refresh(space)
        return space

    def delete(self, space: Space) -> None:
        self.db.delete(space)
        self.db.commit()

    def count_by_dealer(self, dealer_id: int) -> int:
        from app.models.station import Station
        return (
            self.db.query(Space)
            .join(Station, Space.station_id == Station.id)
            .filter(Station.dealer_id == dealer_id)
            .count()
        )

    def count_active_by_dealer(self, dealer_id: int) -> int:
        from app.models.station import Station
        return (
            self.db.query(Space)
            .join(Station, Space.station_id == Station.id)
            .filter(Station.dealer_id == dealer_id, Space.availability_status == "available")
            .count()
        )
