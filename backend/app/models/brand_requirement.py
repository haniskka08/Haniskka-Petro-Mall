"""BrandRequirement ORM model — brand-side search requirements for matching."""

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class BrandRequirement(Base, TimestampMixin):
    __tablename__ = "brand_requirements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # brand_user_id references dealers (brand role) — FK to dealers.id
    brand_user_id: Mapped[int] = mapped_column(
        ForeignKey("dealers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("brand_categories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Geographic matching: max radius from brand's location
    radius_km: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    # Space area filter thresholds
    min_area_sqft: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    max_area_sqft: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    # Requirement pipeline status (active/inactive/fulfilled)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active", index=True)

    # relationships
    category: Mapped["BrandCategory"] = relationship(  # noqa: F821
        "BrandCategory", back_populates="brand_requirements"
    )
    brand_user: Mapped["Dealer"] = relationship(  # noqa: F821
        "Dealer", back_populates="brand_requirements"
    )
    matches: Mapped[list["Match"]] = relationship(  # noqa: F821
        "Match", back_populates="requirement", cascade="all, delete-orphan"
    )
