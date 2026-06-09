"""Health and readiness endpoints."""

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.db.session import check_database_connection
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Return application and database connectivity status."""
    db_ok = check_database_connection()
    return HealthResponse(
        status="ok" if db_ok else "degraded",
        app=settings.app_name,
        environment=settings.app_env,
        database="connected" if db_ok else "disconnected",
    )
