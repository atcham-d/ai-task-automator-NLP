"""Profile, password change, and notification preference routes."""

from fastapi import APIRouter, Depends, status

from app.core.deps import get_current_user
from app.schemas.profile import (
    NotificationPrefs,
    NotificationPrefsUpdate,
    PasswordChangeRequest,
    ProfileResponse,
    ProfileUpdate,
)
from app.services.profile_service import profile_service

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/", response_model=ProfileResponse)
async def get_profile(user: dict = Depends(get_current_user)):
    """Retrieve the authenticated user's profile."""
    return profile_service.get_profile(user["id"])


@router.patch("/", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdate, user: dict = Depends(get_current_user)
):
    """Update the authenticated user's profile (name, avatar)."""
    return profile_service.update_profile(user["id"], body)


@router.patch("/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    body: PasswordChangeRequest, user: dict = Depends(get_current_user)
):
    """Change the authenticated user's password.

    Requires the current password for verification.
    """
    profile_service.change_password(
        user["id"], body.current_password, body.new_password
    )


@router.get("/notifications", response_model=NotificationPrefs)
async def get_notifications(user: dict = Depends(get_current_user)):
    """Retrieve notification preferences for the authenticated user."""
    return profile_service.get_notifications(user["id"])


@router.patch("/notifications", response_model=NotificationPrefs)
async def update_notifications(
    body: NotificationPrefsUpdate, user: dict = Depends(get_current_user)
):
    """Update notification preference toggles."""
    return profile_service.update_notifications(user["id"], body)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(user: dict = Depends(get_current_user)):
    """Permanently delete the authenticated user's account.

    This cascades and removes all workflows, logs, integrations, and preferences.
    """
    profile_service.delete_account(user["id"])
