"""Integration request and response schemas."""

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel


class IntegrationCreate(BaseModel):
    """Request body for creating a new integration."""

    type: str  # slack | discord | smtp | webhook
    name: str
    config: Dict[str, Any]


class IntegrationUpdate(BaseModel):
    """Request body for updating an existing integration. All fields optional."""

    name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class IntegrationResponse(BaseModel):
    """Integration data returned from the API."""

    id: UUID
    user_id: UUID
    type: str
    name: str
    config: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class TestResult(BaseModel):
    """Result of testing an integration connection."""

    success: bool
    message: str
