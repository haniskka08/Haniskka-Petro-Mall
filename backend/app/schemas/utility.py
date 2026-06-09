"""Pydantic v2 schemas for StationUtility."""

from pydantic import BaseModel


class UtilityUpdate(BaseModel):
    electricity: bool = False
    water: bool = False
    internet: bool = False
    parking: bool = False
    washroom: bool = False
    cctv: bool = False


class UtilityOut(BaseModel):
    id: int
    station_id: int
    electricity: bool
    water: bool
    internet: bool
    parking: bool
    washroom: bool
    cctv: bool

    model_config = {"from_attributes": True}
