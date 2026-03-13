"""Service layer for integration CRUD and testing against Supabase."""

from typing import Any, Dict, List

import httpx
from fastapi import HTTPException, status

from app.core.supabase import supabase
from app.schemas.integration import IntegrationCreate, IntegrationUpdate


from app.core.config import settings
from app.core.security import encrypt_secret, decrypt_secret
from supabase import create_client, ClientOptions

def is_secret_field(key: str) -> bool:
    """
    Determine whether a field name likely represents a secret.
    
    Returns:
        True if `key` contains any of the secret-related substrings 'password', 'token', 'key', or 'secret' (case-insensitive), False otherwise.
    """
    return any(s in key.lower() for s in ['password', 'token', 'key', 'secret'])

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
        """
        Create a new integration for the given user.
        
        Encrypts secret-like fields in `data.config` before storing. In development mode (special all-zero user_id) the integration is stored in an in-memory dev store; otherwise the integration row is inserted into the persistent "integrations" table.
        
        Parameters:
            user_id (str): ID of the user owning the integration.
            token (str): Authorization token used to create an authenticated client for persistence.
            data (IntegrationCreate): Integration payload containing `type`, `name`, and `config` keys.
        
        Returns:
            dict: The created integration record.
        
        Raises:
            HTTPException: With status 500 if the integration cannot be created.
        """
        if user_id == "00000000-0000-0000-0000-000000000000":
            from uuid import uuid4
            from datetime import datetime, timezone
            int_id = str(uuid4())
            integration = {
                "id": int_id,
                "user_id": user_id,
                "type": data.type,
                "name": data.name,
                "config": {
                    k: encrypt_secret(v) if is_secret_field(k) else v
                    for k, v in data.config.items()
                },
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
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
                        "config": {
                            k: encrypt_secret(v) if is_secret_field(k) else v
                            for k, v in data.config.items()
                        },
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
        """
        Return all integrations for the given user.
        
        For the development bypass user (all-zero UUID) returns in-memory integrations sorted by created_at descending. For production, queries the integrations table and decrypts values of config fields identified as secrets before returning.
        
        Returns:
            List[dict]: A list of integration records with secret config fields decrypted when applicable.
        
        Raises:
            HTTPException: If fetching integrations fails.
        """
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
            integrations = result.data
            for integration in integrations:
                if "config" in integration and integration["config"]:
                    integration["config"] = {
                        k: decrypt_secret(v) if is_secret_field(k) and isinstance(v, str) else v
                        for k, v in integration["config"].items()
                    }
            return integrations
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch integrations: {str(e)}",
            )

    def get_by_id(self, integration_id: str, user_id: str) -> dict:
        """
        Retrieve a single integration for the given user by integration ID.
        
        If the integration has a `config` mapping, secret-like fields (e.g., keys matched by is_secret_field) are decrypted before being returned. When `user_id` equals "00000000-0000-0000-0000-000000000000" the method reads from the in-memory development store.
        
        Parameters:
            integration_id (str): ID of the integration to retrieve.
            user_id (str): ID of the owner user (special all-zero UUID selects the dev store).
        
        Returns:
            dict: The integration record with secret fields in `config` decrypted.
        
        Raises:
            HTTPException: 404 if the integration is not found; 500 on other retrieval errors.
        """
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
            integration = result.data[0]
            if "config" in integration and integration["config"]:
                integration["config"] = {
                    k: decrypt_secret(v) if is_secret_field(k) and isinstance(v, str) else v
                    for k, v in integration["config"].items()
                }
            return integration
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
            
            from datetime import datetime, timezone
            integration["updated_at"] = datetime.now(timezone.utc).isoformat()
            return integration

        self.get_by_id(integration_id, user_id)

        update_data: Dict[str, Any] = {}
        if data.name is not None:
            update_data["name"] = data.name
        if data.config is not None:
            update_data["config"] = {
                k: encrypt_secret(v) if is_secret_field(k) else v
                for k, v in data.config.items()
            }
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
            integration = result.data[0]
            if "config" in integration and integration["config"]:
                integration["config"] = {
                    k: decrypt_secret(v) if is_secret_field(k) and isinstance(v, str) else v
                    for k, v in integration["config"].items()
                }
            return integration
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
