"""Execution log routes — read-only with filtering."""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_user
from app.schemas.log import LogResponse
from app.services.log_service import log_service

router = APIRouter(prefix="/api/logs", tags=["logs"])


@router.get("/", response_model=List[LogResponse])
async def list_logs(
    workflow_id: Optional[str] = Query(None, description="Filter by workflow ID"),
    status: Optional[str] = Query(None, description="Filter by status (success, failed, running)"),
    limit: int = Query(50, ge=1, le=200, description="Max results per page"),
    offset: int = Query(0, ge=0, description="Result offset for pagination"),
    user: dict = Depends(get_current_user),
):
    """Retrieve execution logs for the authenticated user's workflows.

    Supports optional filtering by workflow_id and status,
    with limit/offset pagination.
    """
    return log_service.get_logs(
        user_id=user["id"],
        workflow_id=workflow_id,
        log_status=status,
        limit=limit,
        offset=offset,
    )


@router.get("/{log_id}", response_model=LogResponse)
async def get_log(log_id: str, user: dict = Depends(get_current_user)):
    """Retrieve a single execution log entry by ID."""
    return log_service.get_by_id(log_id, user["id"])
