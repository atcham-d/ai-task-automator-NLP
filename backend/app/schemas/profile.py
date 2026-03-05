"""Profile and notification preference schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ProfileResponse(BaseModel):
    """User profile data returned from the API."""

    id: UUID
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    email: str
    created_at: datetime
    updated_at: datetime


class ProfileUpdate(BaseModel):
    """Request body for updating profile. All fields optional."""

    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    """Request body for changing account password."""

    current_password: str
    new_password: str


class NotificationPrefs(BaseModel):
    """Current notification preference settings."""

    user_id: UUID
    notify_on_failure: bool
    notify_on_success: bool
    weekly_digest: bool
    notification_email: Optional[str] = None


class NotificationPrefsUpdate(BaseModel):
    """Request body for updating notification preferences. All fields optional."""

    notify_on_failure: Optional[bool] = None
    notify_on_success: Optional[bool] = None
    weekly_digest: Optional[bool] = None
    notification_email: Optional[str] = None
