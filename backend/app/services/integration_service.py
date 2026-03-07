"""Service layer for integration CRUD and testing against Supabase."""

from typing import Any, Dict, List

import httpx
from fastapi import HTTPException, status

from app.core.supabase import supabase
from app.schemas.integration import IntegrationCreate, IntegrationUpdate


from app.core.config import settings
from supabase import create_client, ClientOptions

class IntegrationService:
    """Handles integration CRUD and connection testing."""

    _dev_integrations: Dict[str, dict] = {}

    def _get_auth_client(self, token: str):
        if token == "DEV_BYPASS_TOKEN":
            return supabase
        return create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY,
            options=ClientOptions(headers={"Authorization": f"Bearer {token}"})
        )

    def create(self, user_id: str, token: str, data: IntegrationCreate) -> dict:
        """Create a new integration for the given user."""
        if user_id == "00000000-0000-0000-0000-000000000000":
            from uuid import uuid4
            from datetime import datetime, timezone
            int_id = str(uuid4())
            integration = {
                "id": int_id,
                "user_id": user_id,
                "type": data.type,
                "name": data.name,
                "config": data.config,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            self._dev_integrations[int_id] = integration
            return integration

        try:
            client = self._get_auth_client(token)
            result = (
                client.table("integrations")
                .insert(
                    {
                        "user_id": user_id,
                        "type": data.type,
                        "name": data.name,
                        "config": data.config,
                    }
                )
                .execute()
            )
            return result.data[0]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create integration: {str(e)}",
            )

    def get_all(self, user_id: str) -> List[dict]:
        """Retrieve all integrations for a user."""
        if user_id == "00000000-0000-0000-0000-000000000000":
            return sorted(self._dev_integrations.values(), key=lambda x: x["created_at"], reverse=True)

        try:
            result = (
                supabase.table("integrations")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            return result.data
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch integrations: {str(e)}",
            )

    def get_by_id(self, integration_id: str, user_id: str) -> dict:
        """Retrieve a single integration by ID. Raises 404 if not found."""
        if user_id == "00000000-0000-0000-0000-000000000000":
            integration = self._dev_integrations.get(integration_id)
            if not integration:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
            return integration

        try:
            result = (
                supabase.table("integrations")
                .select("*")
                .eq("id", integration_id)
                .eq("user_id", user_id)
                .execute()
            )
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Integration not found",
                )
            return result.data[0]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch integration: {str(e)}",
            )

    def update(
        self, integration_id: str, user_id: str, data: IntegrationUpdate
    ) -> dict:
        """Update an integration with only the provided (non-None) fields."""
        if user_id == "00000000-0000-0000-0000-000000000000":
            integration = self.get_by_id(integration_id, user_id)
            if data.name is not None:
                integration["name"] = data.name
            if data.config is not None:
                integration["config"] = data.config
            if data.is_active is not None:
                integration["is_active"] = data.is_active
            return integration

        self.get_by_id(integration_id, user_id)

        update_data: Dict[str, Any] = {}
        if data.name is not None:
            update_data["name"] = data.name
        if data.config is not None:
            update_data["config"] = data.config
        if data.is_active is not None:
            update_data["is_active"] = data.is_active

        if not update_data:
            return self.get_by_id(integration_id, user_id)

        try:
            result = (
                supabase.table("integrations")
                .update(update_data)
                .eq("id", integration_id)
                .eq("user_id", user_id)
                .execute()
            )
            return result.data[0]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update integration: {str(e)}",
            )

    def delete(self, integration_id: str, user_id: str) -> None:
        """Delete an integration by ID."""
        if user_id == "00000000-0000-0000-0000-000000000000":
            if integration_id in self._dev_integrations:
                del self._dev_integrations[integration_id]
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
            return

        self.get_by_id(integration_id, user_id)
        try:
            supabase.table("integrations").delete().eq("id", integration_id).eq(
                "user_id", user_id
            ).execute()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete integration: {str(e)}",
            )

    async def test_integration(self, integration_id: str, user_id: str) -> dict:
        """Test an integration connection and return the result.

        - Slack/Discord: POSTs a test message to the webhook URL.
        - Webhook: POSTs a test payload to the configured URL.
        - SMTP: Connection test (stubbed for MVP).
        """
        integration = self.get_by_id(integration_id, user_id)
        int_type = integration["type"]
        config = integration.get("config", {})

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                if int_type == "slack":
                    webhook_url = config.get("webhook_url", "")
                    if not webhook_url:
                        return {"success": False, "message": "No webhook URL configured"}
                    resp = await client.post(
                        webhook_url,
                        json={"text": "🔔 FlowAI test message — connection successful!"},
                    )
                    if resp.status_code == 200:
                        return {"success": True, "message": "Slack webhook is working"}
                    return {
                        "success": False,
                        "message": f"Slack returned status {resp.status_code}",
                    }

                elif int_type == "discord":
                    webhook_url = config.get("webhook_url", "")
                    if not webhook_url:
                        return {"success": False, "message": "No webhook URL configured"}
                    resp = await client.post(
                        webhook_url,
                        json={
                            "content": "🔔 FlowAI test message — connection successful!"
                        },
                    )
                    if resp.status_code in (200, 204):
                        return {"success": True, "message": "Discord webhook is working"}
                    return {
                        "success": False,
                        "message": f"Discord returned status {resp.status_code}",
                    }

                elif int_type == "webhook":
                    url = config.get("url", "")
                    if not url:
                        return {"success": False, "message": "No URL configured"}
                    resp = await client.post(url, json={"test": True})
                    return {
                        "success": resp.status_code < 400,
                        "message": f"Webhook returned status {resp.status_code}",
                    }

                elif int_type == "smtp":
                    # MVP stub — just verify config fields exist
                    required = ["host", "port", "user"]
                    missing = [k for k in required if k not in config]
                    if missing:
                        return {
                            "success": False,
                            "message": f"Missing SMTP config: {', '.join(missing)}",
                        }
                    return {
                        "success": True,
                        "message": "SMTP configuration looks valid (connection test skipped in MVP)",
                    }

                else:
                    return {
                        "success": False,
                        "message": f"Unknown integration type: {int_type}",
                    }

        except httpx.TimeoutException:
            return {"success": False, "message": "Connection timed out"}
        except Exception as e:
            return {"success": False, "message": f"Test failed: {str(e)}"}


integration_service = IntegrationService()
