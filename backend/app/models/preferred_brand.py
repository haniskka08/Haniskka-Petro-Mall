"""PreferredBrand ORM model."""

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class PreferredBrand(Base, TimestampMixin):
    __tablename__ = "preferred_brands"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    station_id: Mapped[int] = mapped_column(
        ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    brand_name: Mapped[str] = mapped_column(String(200), nullable=False)
    brand_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # FK to structured brand_categories lookup table (optional for backwards compat)
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("brand_categories.id", ondelete="SET NULL"), nullable=True, index=True
    )

    station: Mapped["Station"] = relationship("Station", back_populates="preferred_brands")  # noqa: F821
    category: Mapped["BrandCategory | None"] = relationship(  # noqa: F821
        "BrandCategory", back_populates="dealer_preferences"
    )
