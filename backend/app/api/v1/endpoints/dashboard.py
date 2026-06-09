"""Dashboard stats endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_dealer
from app.db.session import get_db
from app.schemas.image import DashboardStats
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db), current_dealer=Depends(get_current_dealer)):
    """Return aggregate stats for the authenticated dealer's dashboard."""
    return DashboardService(db).get_stats(current_dealer.id)
