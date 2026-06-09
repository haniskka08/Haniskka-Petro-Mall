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


class SpaceUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    space_type: SPACE_TYPES | None = None
    area_sqft: float | None = Field(None, ge=0)
    monthly_rent: float | None = Field(None, ge=0)
    availability_status: AVAILABILITY | None = None


class SpaceOut(BaseModel):
    id: int
    station_id: int
    name: str
    space_type: str
    area_sqft: float | None
    monthly_rent: float | None
    availability_status: str

    model_config = {"from_attributes": True}
