"""StationUtility ORM model."""

from sqlalchemy import Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class StationUtility(Base, TimestampMixin):
    __tablename__ = "station_utilities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    station_id: Mapped[int] = mapped_column(
        ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    electricity: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    water: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    internet: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    parking: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    washroom: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    cctv: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    station: Mapped["Station"] = relationship("Station", back_populates="utilities")  # noqa: F821
