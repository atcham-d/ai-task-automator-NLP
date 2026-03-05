"""Execution log response schemas."""

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel


class LogResponse(BaseModel):
    """Execution log entry returned from the API."""

    id: UUID
    workflow_id: UUID
    workflow_name: Optional[str] = None
    triggered_at: datetime
    trigger_type: Optional[str] = None
    duration_ms: Optional[int] = None
    status: str
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
