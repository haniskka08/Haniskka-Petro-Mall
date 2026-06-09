"""Auth endpoints — register, login, me."""

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import get_current_dealer
from app.db.session import get_db
from app.schemas.dealer import DealerRegister, DealerOut, TokenOut
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=DealerOut, status_code=201)
def register(data: DealerRegister, db: Session = Depends(get_db)):
    """Register a new dealer account."""
    return AuthService(db).register(data)


@router.post("/login", response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login with email + password. Returns JWT access token."""
    from app.schemas.dealer import DealerLogin
    return AuthService(db).login(DealerLogin(email=form.username, password=form.password))


@router.get("/me", response_model=DealerOut)
def get_me(current_dealer=Depends(get_current_dealer)):
    """Return the currently authenticated dealer's profile."""
    return DealerOut.model_validate(current_dealer)
