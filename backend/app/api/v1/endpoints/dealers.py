"""Dealer profile endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_dealer
from app.db.session import get_db
from app.schemas.dealer import DealerOut, DealerUpdate, PasswordChange
from app.services.auth_service import AuthService

router = APIRouter(prefix="/dealers", tags=["Dealer Profile"])


@router.get("/me", response_model=DealerOut)
def get_profile(current_dealer=Depends(get_current_dealer)):
    return DealerOut.model_validate(current_dealer)


@router.put("/me", response_model=DealerOut)
def update_profile(
    data: DealerUpdate,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return AuthService(db).update_profile(current_dealer.id, data)


@router.put("/me/password")
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_dealer=Depends(get_current_dealer),
):
    return AuthService(db).change_password(current_dealer.id, data)
