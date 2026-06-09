"""Image repository."""

from sqlalchemy.orm import Session

from app.models.station_image import StationImage


class ImageRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_station(self, station_id: int) -> list[StationImage]:
        return self.db.query(StationImage).filter(StationImage.station_id == station_id).all()

    def get_by_id(self, image_id: int) -> StationImage | None:
        return self.db.get(StationImage, image_id)

    def create(self, station_id: int, file_name: str, file_path: str, file_size: int, mime_type: str) -> StationImage:
        image = StationImage(
            station_id=station_id,
            file_name=file_name,
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
        )
        self.db.add(image)
        self.db.commit()
        self.db.refresh(image)
        return image

    def delete(self, image: StationImage) -> None:
        self.db.delete(image)
        self.db.commit()

    def count_by_dealer(self, dealer_id: int) -> int:
        from app.models.station import Station
        return (
            self.db.query(StationImage)
            .join(Station, StationImage.station_id == Station.id)
            .filter(Station.dealer_id == dealer_id)
            .count()
        )
