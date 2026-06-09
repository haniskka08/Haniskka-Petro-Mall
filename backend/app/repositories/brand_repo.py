"""Brand repository."""

from sqlalchemy.orm import Session

from app.models.preferred_brand import PreferredBrand
from app.schemas.brand import BrandCreate


class BrandRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_station(self, station_id: int) -> list[PreferredBrand]:
        return self.db.query(PreferredBrand).filter(PreferredBrand.station_id == station_id).all()

    def get_by_id(self, brand_id: int) -> PreferredBrand | None:
        return self.db.get(PreferredBrand, brand_id)

    def create(self, station_id: int, data: BrandCreate) -> PreferredBrand:
        brand = PreferredBrand(station_id=station_id, **data.model_dump())
        self.db.add(brand)
        self.db.commit()
        self.db.refresh(brand)
        return brand

    def delete(self, brand: PreferredBrand) -> None:
        self.db.delete(brand)
        self.db.commit()

    def replace_all(self, station_id: int, brands: list[BrandCreate]) -> list[PreferredBrand]:
        self.db.query(PreferredBrand).filter(PreferredBrand.station_id == station_id).delete()
        new_brands = [PreferredBrand(station_id=station_id, **b.model_dump()) for b in brands]
        self.db.add_all(new_brands)
        self.db.commit()
        for b in new_brands:
            self.db.refresh(b)
        return new_brands
