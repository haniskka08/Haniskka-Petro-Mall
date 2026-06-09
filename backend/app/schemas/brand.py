"""Pydantic v2 schemas for PreferredBrand."""

from pydantic import BaseModel, Field


class BrandCreate(BaseModel):
    brand_name: str = Field(..., min_length=1, max_length=200)
    brand_category: str | None = Field(None, max_length=100)


class BrandOut(BaseModel):
    id: int
    station_id: int
    brand_name: str
    brand_category: str | None

    model_config = {"from_attributes": True}
