"""Pydantic v2 schemas for StationImage."""

from datetime import datetime
from pydantic import BaseModel


class ImageOut(BaseModel):
    id: int
    station_id: int
    file_name: str
    file_path: str
    file_size: int | None
    mime_type: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_stations: int
    total_spaces: int
    active_listings: int
    uploaded_layouts: int
