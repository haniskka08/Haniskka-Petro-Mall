"""Authentication service — register, login, profile."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.repositories.dealer_repo import DealerRepository
from app.schemas.dealer import DealerRegister, DealerLogin, DealerOut, DealerUpdate, PasswordChange, TokenOut


class AuthService:
    def __init__(self, db: Session):
        self.repo = DealerRepository(db)

    def register(self, data: DealerRegister) -> DealerOut:
        if self.repo.get_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
        dealer = self.repo.create(data)
        return DealerOut.model_validate(dealer)

    def login(self, data: DealerLogin) -> TokenOut:
        dealer = self.repo.get_by_email(data.email)
        if dealer is None or not verify_password(data.password, dealer.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )
        if not dealer.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is disabled. Contact support.",
            )
        token = create_access_token(subject=dealer.id)
        return TokenOut(
            access_token=token,
            dealer_id=dealer.id,
            full_name=dealer.full_name,
            email=dealer.email,
        )

    def update_profile(self, dealer_id: int, data: DealerUpdate) -> DealerOut:
        dealer = self.repo.get_by_id(dealer_id)
        if dealer is None:
            raise HTTPException(status_code=404, detail="Dealer not found")
        updated = self.repo.update(dealer, data)
        return DealerOut.model_validate(updated)

    def change_password(self, dealer_id: int, data: PasswordChange) -> dict:
        dealer = self.repo.get_by_id(dealer_id)
        if dealer is None:
            raise HTTPException(status_code=404, detail="Dealer not found")
        if not verify_password(data.current_password, dealer.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect.")
        self.repo.update_password(dealer, data.new_password)
        return {"message": "Password updated successfully."}
