"""Dealer repository — DB access layer."""

from sqlalchemy.orm import Session

from app.models.dealer import Dealer
from app.schemas.dealer import DealerRegister, DealerUpdate
from app.core.security import hash_password


class DealerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, dealer_id: int) -> Dealer | None:
        return self.db.get(Dealer, dealer_id)

    def get_by_email(self, email: str) -> Dealer | None:
        return self.db.query(Dealer).filter(Dealer.email == email.lower()).first()

    def create(self, data: DealerRegister) -> Dealer:
        dealer = Dealer(
            full_name=data.full_name,
            email=data.email.lower(),
            phone=data.phone,
            company_name=data.company_name,
            hashed_password=hash_password(data.password),
        )
        self.db.add(dealer)
        self.db.commit()
        self.db.refresh(dealer)
        return dealer

    def update(self, dealer: Dealer, data: DealerUpdate) -> Dealer:
        update_data = data.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(dealer, field, value)
        self.db.commit()
        self.db.refresh(dealer)
        return dealer

    def update_password(self, dealer: Dealer, new_password: str) -> None:
        dealer.hashed_password = hash_password(new_password)
        self.db.commit()
