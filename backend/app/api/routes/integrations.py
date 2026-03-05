"""Integration CRUD routes + connection testing."""

from typing import List

from fastapi import APIRouter, Depends, status

from app.core.deps import get_current_user
from app.schemas.integration import (
    IntegrationCreate,
    IntegrationResponse,
    IntegrationUpdate,
    TestResult,
)
from app.services.integration_service import integration_service

router = APIRouter(prefix="/api/integrations", tags=["integrations"])


@router.get("/", response_model=List[IntegrationResponse])
async def list_integrations(user: dict = Depends(get_current_user)):
    """Retrieve all integrations for the authenticated user."""
    return integration_service.get_all(user["id"])


@router.post(
    "/", response_model=IntegrationResponse, status_code=status.HTTP_201_CREATED
)
async def create_integration(
    body: IntegrationCreate, user: dict = Depends(get_current_user)
):
    """Create a new integration (Slack, Discord, SMTP, or Webhook)."""
    return integration_service.create(user["id"], body)


@router.patch("/{integration_id}", response_model=IntegrationResponse)
async def update_integration(
    integration_id: str,
    body: IntegrationUpdate,
    user: dict = Depends(get_current_user),
):
    """Update an existing integration."""
    return integration_service.update(integration_id, user["id"], body)


@router.delete("/{integration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_integration(
    integration_id: str, user: dict = Depends(get_current_user)
):
    """Delete an integration by ID."""
    integration_service.delete(integration_id, user["id"])


@router.post("/{integration_id}/test", response_model=TestResult)
async def test_integration(
    integration_id: str, user: dict = Depends(get_current_user)
):
    """Test the connection of an integration.

    Sends a test message to Slack/Discord webhooks or verifies SMTP config.
    """
    return await integration_service.test_integration(integration_id, user["id"])
