"""Space ORM model."""

from sqlalchemy import Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.db.base import Base, TimestampMixin


class AvailabilityStatus(str, enum.Enum):
    available = "available"
    occupied = "occupied"
    under_renovation = "under_renovation"


class SpaceType(str, enum.Enum):
    retail = "retail"
    food_court = "food_court"
    atm = "atm"
    pharmacy = "pharmacy"
    office = "office"
    storage = "storage"
    other = "other"


class Space(Base, TimestampMixin):
    __tablename__ = "spaces"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    space_type: Mapped[str] = mapped_column(String(50), nullable=False, default="retail")
    area_sqft: Mapped[float | None] = mapped_column(Float, nullable=True)
    monthly_rent: Mapped[float | None] = mapped_column(Float, nullable=True)
    availability_status: Mapped[str] = mapped_column(String(30), nullable=False, default="available")

    station: Mapped["Station"] = relationship("Station", back_populates="spaces")  # noqa: F821
