"""Station ORM model."""

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class StationStatus(str):
    """Station validation status constants."""
    PENDING = "pending"
    GREEN = "green"
    REJECTED = "rejected"


class Station(Base, TimestampMixin):
    __tablename__ = "stations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    dealer_id: Mapped[int] = mapped_column(ForeignKey("dealers.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    pincode: Mapped[str] = mapped_column(String(20), nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    contact_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending", index=True)

    # relationships
    dealer: Mapped["Dealer"] = relationship("Dealer", back_populates="stations")  # noqa: F821
    spaces: Mapped[list["Space"]] = relationship(  # noqa: F821
        "Space", back_populates="station", cascade="all, delete-orphan"
    )
    utilities: Mapped["StationUtility | None"] = relationship(  # noqa: F821
        "StationUtility", back_populates="station", cascade="all, delete-orphan", uselist=False
    )
    preferred_brands: Mapped[list["PreferredBrand"]] = relationship(  # noqa: F821
        "PreferredBrand", back_populates="station", cascade="all, delete-orphan"
    )
    images: Mapped[list["StationImage"]] = relationship(  # noqa: F821
        "StationImage", back_populates="station", cascade="all, delete-orphan"
    )
