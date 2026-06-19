"""Pydantic v2 schemas for Space."""

from typing import Literal
from pydantic import BaseModel, Field


SPACE_TYPES = Literal["retail", "food_court", "atm", "pharmacy", "office", "storage", "other"]
AVAILABILITY = Literal["available", "occupied", "under_renovation"]


class SpaceCreate(BaseModel):
    station_id: int
    name: str = Field(..., min_length=2, max_length=200)
    space_type: SPACE_TYPES = "retail"
    area_sqft: float | None = Field(None, ge=0)
    monthly_rent: float | None = Field(None, ge=0)
    availability_status: AVAILABILITY = "available"
    # DB Design v4 additions
    power_kw: float | None = Field(None, ge=0, description="Available electrical power capacity in kW")
    water_available: bool = False
    drainage_avail: bool = False


class SpaceUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    space_type: SPACE_TYPES | None = None
    area_sqft: float | None = Field(None, ge=0)
    monthly_rent: float | None = Field(None, ge=0)
    availability_status: AVAILABILITY | None = None
    # DB Design v4 additions
    power_kw: float | None = Field(None, ge=0)
    water_available: bool | None = None
    drainage_avail: bool | None = None


class SpaceOut(BaseModel):
    id: int
    station_id: int
    name: str
    space_type: str
    area_sqft: float | None
    monthly_rent: float | None
    availability_status: str
    power_kw: float | None
    water_available: bool
    drainage_avail: bool

    model_config = {"from_attributes": True}
