"""API v1 — all route modules wired together."""

from fastapi import APIRouter

from app.api.v1.endpoints import health
from app.api.v1.endpoints import auth
from app.api.v1.endpoints import dealers
from app.api.v1.endpoints import stations
from app.api.v1.endpoints import spaces
from app.api.v1.endpoints import utilities
from app.api.v1.endpoints import brands
from app.api.v1.endpoints import images
from app.api.v1.endpoints import dashboard

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router)
api_router.include_router(dealers.router)
api_router.include_router(stations.router)
api_router.include_router(spaces.router)
api_router.include_router(utilities.router)
api_router.include_router(brands.router)
api_router.include_router(images.router)
api_router.include_router(dashboard.router)
