"""Workflow request and response schemas."""

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.workflow import WorkflowDefinition


class WorkflowCreate(BaseModel):
    """Request body for creating a new workflow."""

    name: str
    description: Optional[str] = None
    definition: WorkflowDefinition


class WorkflowUpdate(BaseModel):
    """Request body for updating an existing workflow. All fields optional."""

    name: Optional[str] = None
    description: Optional[str] = None
    definition: Optional[WorkflowDefinition] = None
    status: Optional[str] = None


class WorkflowResponse(BaseModel):
    """Workflow data returned from the API."""

    id: UUID
    user_id: UUID
    name: str
    description: Optional[str] = None
    status: str
    definition: Dict[str, Any]
    run_count: int
    last_run_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
