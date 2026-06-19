"""Match ORM model — links a station space to a brand requirement."""

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Match(Base, TimestampMixin):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    space_id: Mapped[int] = mapped_column(
        ForeignKey("spaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requirement_id: Mapped[int] = mapped_column(
        ForeignKey("brand_requirements.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Automated matching lifecycle: pending / accepted / rejected / expired
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending", index=True)
    # Internal admin who reviewed this match (nullable if not yet reviewed)
    reviewed_by: Mapped[int | None] = mapped_column(
        ForeignKey("dealers.id", ondelete="SET NULL"), nullable=True
    )

    # relationships
    space: Mapped["Space"] = relationship("Space", back_populates="matches")  # noqa: F821
    requirement: Mapped["BrandRequirement"] = relationship(  # noqa: F821
        "BrandRequirement", back_populates="matches"
    )
    reviewer: Mapped["Dealer | None"] = relationship(  # noqa: F821
        "Dealer", back_populates="reviewed_matches", foreign_keys=[reviewed_by]
    )
