"""Authentication request and response schemas."""

from typing import Optional

from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    """Request body for user registration."""

    email: EmailStr
    password: str
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    """Request body for user login."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"
