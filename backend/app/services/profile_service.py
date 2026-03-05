"""Service layer for profile and notification preference operations."""

from typing import Any, Dict

from fastapi import HTTPException, status

from app.core.supabase import supabase
from app.schemas.profile import NotificationPrefsUpdate, ProfileUpdate


class ProfileService:
    """Handles profile, password, and notification preferences via Supabase."""

    def get_profile(self, user_id: str) -> dict:
        """Retrieve the profile for a user."""
        try:
            result = (
                supabase.table("profiles")
                .select("*")
                .eq("id", user_id)
                .execute()
            )
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Profile not found",
                )
            return result.data[0]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch profile: {str(e)}",
            )

    def update_profile(self, user_id: str, data: ProfileUpdate) -> dict:
        """Update profile fields (full_name, avatar_url)."""
        update_data: Dict[str, Any] = {}
        if data.full_name is not None:
            update_data["full_name"] = data.full_name
        if data.avatar_url is not None:
            update_data["avatar_url"] = data.avatar_url

        if not update_data:
            return self.get_profile(user_id)

        try:
            result = (
                supabase.table("profiles")
                .update(update_data)
                .eq("id", user_id)
                .execute()
            )
            return result.data[0]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update profile: {str(e)}",
            )

    def change_password(
        self, user_id: str, current_password: str, new_password: str
    ) -> None:
        """Change the user's password.

        Verifies the current password via Supabase auth, then updates to the new one.
        """
        try:
            # Get user email from profile
            profile = self.get_profile(user_id)
            email = profile["email"]

            # Verify current password by attempting sign-in
            supabase.auth.sign_in_with_password(
                {"email": email, "password": current_password}
            )

            # Update to new password
            supabase.auth.admin.update_user_by_id(
                user_id, {"password": new_password}
            )
        except HTTPException:
            raise
        except Exception as e:
            error_msg = str(e).lower()
            if "invalid" in error_msg or "credentials" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is incorrect",
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to change password: {str(e)}",
            )

    def get_notifications(self, user_id: str) -> dict:
        """Retrieve notification preferences for a user."""
        try:
            result = (
                supabase.table("notification_preferences")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )
            if not result.data:
                # Auto-create default preferences if missing
                insert_result = (
                    supabase.table("notification_preferences")
                    .insert({"user_id": user_id})
                    .execute()
                )
                return insert_result.data[0]
            return result.data[0]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch notification preferences: {str(e)}",
            )

    def update_notifications(
        self, user_id: str, data: NotificationPrefsUpdate
    ) -> dict:
        """Update notification preference toggles."""
        update_data: Dict[str, Any] = {}
        if data.notify_on_failure is not None:
            update_data["notify_on_failure"] = data.notify_on_failure
        if data.notify_on_success is not None:
            update_data["notify_on_success"] = data.notify_on_success
        if data.weekly_digest is not None:
            update_data["weekly_digest"] = data.weekly_digest
        if data.notification_email is not None:
            update_data["notification_email"] = data.notification_email

        if not update_data:
            return self.get_notifications(user_id)

        try:
            result = (
                supabase.table("notification_preferences")
                .update(update_data)
                .eq("user_id", user_id)
                .execute()
            )
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Notification preferences not found",
                )
            return result.data[0]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update notification preferences: {str(e)}",
            )

    def delete_account(self, user_id: str) -> None:
        """Delete the user's account. Cascade deletes all related data."""
        try:
            supabase.auth.admin.delete_user(user_id)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete account: {str(e)}",
            )


profile_service = ProfileService()
