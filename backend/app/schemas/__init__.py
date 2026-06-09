"""Schemas package."""

from app.schemas.dealer import DealerRegister, DealerLogin, DealerOut, DealerUpdate, PasswordChange, TokenOut
from app.schemas.station import StationCreate, StationUpdate, StationOut
from app.schemas.space import SpaceCreate, SpaceUpdate, SpaceOut
from app.schemas.utility import UtilityUpdate, UtilityOut
from app.schemas.brand import BrandCreate, BrandOut
from app.schemas.image import ImageOut, DashboardStats

__all__ = [
    "DealerRegister", "DealerLogin", "DealerOut", "DealerUpdate", "PasswordChange", "TokenOut",
    "StationCreate", "StationUpdate", "StationOut",
    "SpaceCreate", "SpaceUpdate", "SpaceOut",
    "UtilityUpdate", "UtilityOut",
    "BrandCreate", "BrandOut",
    "ImageOut", "DashboardStats",
]
