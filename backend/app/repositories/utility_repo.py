"""Utility repository."""

from sqlalchemy.orm import Session

from app.models.utility import StationUtility
from app.schemas.utility import UtilityUpdate


class UtilityRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_station(self, station_id: int) -> StationUtility | None:
        return self.db.query(StationUtility).filter(StationUtility.station_id == station_id).first()

    def upsert(self, station_id: int, data: UtilityUpdate) -> StationUtility:
        utility = self.get_by_station(station_id)
        if utility is None:
            utility = StationUtility(station_id=station_id, **data.model_dump())
            self.db.add(utility)
        else:
            for field, value in data.model_dump().items():
                setattr(utility, field, value)
        self.db.commit()
        self.db.refresh(utility)
        return utility
