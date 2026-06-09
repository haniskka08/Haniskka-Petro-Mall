"""Brand service."""

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.brand_repo import BrandRepository
from app.repositories.station_repo import StationRepository
from app.schemas.brand import BrandCreate, BrandOut


class BrandService:
    def __init__(self, db: Session):
        self.repo = BrandRepository(db)
        self.station_repo = StationRepository(db)

    def _assert_owned(self, station_id: int, dealer_id: int):
        if self.station_repo.get_by_id_and_dealer(station_id, dealer_id) is None:
            raise HTTPException(status_code=404, detail="Station not found.")

    def list_brands(self, station_id: int, dealer_id: int) -> list[BrandOut]:
        self._assert_owned(station_id, dealer_id)
        return [BrandOut.model_validate(b) for b in self.repo.get_by_station(station_id)]

    def add_brand(self, station_id: int, dealer_id: int, data: BrandCreate) -> BrandOut:
        self._assert_owned(station_id, dealer_id)
        brand = self.repo.create(station_id, data)
        return BrandOut.model_validate(brand)

    def replace_brands(self, station_id: int, dealer_id: int, brands: list[BrandCreate]) -> list[BrandOut]:
        self._assert_owned(station_id, dealer_id)
        result = self.repo.replace_all(station_id, brands)
        return [BrandOut.model_validate(b) for b in result]

    def delete_brand(self, brand_id: int, dealer_id: int) -> dict:
        brand = self.repo.get_by_id(brand_id)
        if brand is None:
            raise HTTPException(status_code=404, detail="Brand not found.")
        self._assert_owned(brand.station_id, dealer_id)
        self.repo.delete(brand)
        return {"message": "Brand removed."}
