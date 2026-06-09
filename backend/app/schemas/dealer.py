"""Pydantic v2 schemas for Dealer auth and profile."""

from pydantic import BaseModel, EmailStr, Field, model_validator


class DealerRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=20)
    company_name: str = Field(..., min_length=2, max_length=200)
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class DealerLogin(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    dealer_id: int
    full_name: str
    email: str


class DealerOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    company_name: str
    address: str | None = None
    is_active: bool

    model_config = {"from_attributes": True}


class DealerUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=120)
    phone: str | None = Field(None, min_length=7, max_length=20)
    company_name: str | None = Field(None, min_length=2, max_length=200)
    address: str | None = Field(None, max_length=500)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self):
        if self.new_password != self.confirm_password:
            raise ValueError("New passwords do not match")
        return self
