"""Dealer ORM model."""

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Dealer(Base, TimestampMixin):
    __tablename__ = "dealers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    company_name: Mapped[str] = mapped_column(String(200), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # relationships
    stations: Mapped[list["Station"]] = relationship(  # noqa: F821
        "Station", back_populates="dealer", cascade="all, delete-orphan"
    )
    brand_requirements: Mapped[list["BrandRequirement"]] = relationship(  # noqa: F821
        "BrandRequirement", back_populates="brand_user",
        foreign_keys="BrandRequirement.brand_user_id", cascade="all, delete-orphan"
    )
    reviewed_matches: Mapped[list["Match"]] = relationship(  # noqa: F821
        "Match", back_populates="reviewer",
        foreign_keys="Match.reviewed_by"
    )
