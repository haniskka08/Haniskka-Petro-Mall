"""Security utilities — JWT token handling and password hashing."""

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db

settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    """Return bcrypt hash of a plaintext password."""
    # Ensure plaintext is encoded to bytes, hash, then decode back to string
    return bcrypt.hashpw(plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against its bcrypt hash."""
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def create_access_token(subject: Any, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT access token with an expiry."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    """Decode and verify a JWT; raises HTTPException on failure."""
    try:
        return jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---------------------------------------------------------------------------
# FastAPI dependency — current authenticated dealer
# ---------------------------------------------------------------------------

def get_current_dealer(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Inject the authenticated dealer into route handlers."""
    from app.models.dealer import Dealer  # local import to avoid circular

    payload = decode_token(token)
    dealer_id: str | None = payload.get("sub")
    if dealer_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    dealer = db.get(Dealer, int(dealer_id))
    if dealer is None or not dealer.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Dealer not found or inactive")
    return dealer
