"""Dashboard service — aggregate stats for dealer overview."""

from sqlalchemy.orm import Session

from app.repositories.station_repo import StationRepository
from app.repositories.space_repo import SpaceRepository
from app.repositories.image_repo import ImageRepository
from app.schemas.image import DashboardStats


class DashboardService:
    def __init__(self, db: Session):
        self.station_repo = StationRepository(db)
        self.space_repo = SpaceRepository(db)
        self.image_repo = ImageRepository(db)

    def get_stats(self, dealer_id: int) -> DashboardStats:
        return DashboardStats(
            total_stations=self.station_repo.count_by_dealer(dealer_id),
            total_spaces=self.space_repo.count_by_dealer(dealer_id),
            active_listings=self.space_repo.count_active_by_dealer(dealer_id),
            uploaded_layouts=self.image_repo.count_by_dealer(dealer_id),
        )
