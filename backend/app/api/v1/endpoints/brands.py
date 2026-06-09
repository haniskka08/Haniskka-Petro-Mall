"""Brands endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_dealer
from app.db.session import get_db
from app.schemas.brand import BrandCreate, BrandOut
from app.services.brand_service import BrandService

router = APIRouter(prefix="/stations", tags=["Preferred Brands"])


@router.get("/{station_id}/brands", response_model=list[BrandOut])
def list_brands(
    station_id: int,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return BrandService(db).list_brands(station_id, current_dealer.id)


@router.post("/{station_id}/brands", response_model=BrandOut, status_code=201)
def add_brand(
    station_id: int,
    data: BrandCreate,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return BrandService(db).add_brand(station_id, current_dealer.id, data)


@router.put("/{station_id}/brands", response_model=list[BrandOut])
def replace_brands(
    station_id: int,
    brands: list[BrandCreate],
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return BrandService(db).replace_brands(station_id, current_dealer.id, brands)


@router.delete("/brands/{brand_id}")
def delete_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return BrandService(db).delete_brand(brand_id, current_dealer.id)
