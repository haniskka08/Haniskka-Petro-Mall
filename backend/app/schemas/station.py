"""Pydantic v2 schemas for Station."""

from typing import Literal
from pydantic import BaseModel, Field


class StationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    address: str = Field(..., min_length=5, max_length=500)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=4, max_length=20)
    latitude: float | None = None
    longitude: float | None = None
    contact_number: str | None = Field(None, max_length=20)
    description: str | None = Field(None, max_length=2000)
    status: str = Field("pending", max_length=50)


class StationUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    address: str | None = Field(None, min_length=5, max_length=500)
    city: str | None = Field(None, min_length=2, max_length=100)
    state: str | None = Field(None, min_length=2, max_length=100)
    pincode: str | None = Field(None, min_length=4, max_length=20)
    latitude: float | None = None
    longitude: float | None = None
    contact_number: str | None = Field(None, max_length=20)
    description: str | None = Field(None, max_length=2000)
    status: str | None = Field(None, max_length=50)


class StationOut(BaseModel):
    id: int
    dealer_id: int
    name: str
    address: str
    city: str
    state: str
    pincode: str
    latitude: float | None
    longitude: float | None
    contact_number: str | None
    description: str | None
    status: str

    model_config = {"from_attributes": True}
