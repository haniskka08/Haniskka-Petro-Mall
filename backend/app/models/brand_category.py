"""BrandCategory ORM model — lookup table for brand/category names."""

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class BrandCategory(Base, TimestampMixin):
    __tablename__ = "brand_categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)

    # relationships
    dealer_preferences: Mapped[list["PreferredBrand"]] = relationship(  # noqa: F821
        "PreferredBrand", back_populates="category", cascade="all, delete-orphan"
    )
    brand_requirements: Mapped[list["BrandRequirement"]] = relationship(  # noqa: F821
        "BrandRequirement", back_populates="category", cascade="all, delete-orphan"
    )
