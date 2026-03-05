"""Workflow CRUD routes + activate, pause, and manual run."""

from typing import List

from fastapi import APIRouter, Depends, status

from app.core.deps import get_current_user
from app.models.workflow import WorkflowDefinition
from app.schemas.workflow import WorkflowCreate, WorkflowResponse, WorkflowUpdate
from app.services.runner_service import runner
from app.services.workflow_service import workflow_service
from app.scheduler.scheduler import add_workflow_job, remove_workflow_job
from app.schemas.log import LogResponse

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


@router.get("/", response_model=List[WorkflowResponse])
async def list_workflows(user: dict = Depends(get_current_user)):
    """Retrieve all workflows for the authenticated user."""
    return workflow_service.get_all(user["id"])


@router.post("/", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    body: WorkflowCreate, user: dict = Depends(get_current_user)
):
    """Create a new workflow."""
    return workflow_service.create(user["id"], body)


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: str, user: dict = Depends(get_current_user)
):
    """Retrieve a single workflow by ID."""
    return workflow_service.get_by_id(workflow_id, user["id"])


@router.patch("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: str,
    body: WorkflowUpdate,
    user: dict = Depends(get_current_user),
):
    """Update an existing workflow."""
    return workflow_service.update(workflow_id, user["id"], body)


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: str, user: dict = Depends(get_current_user)
):
    """Delete a workflow and remove any associated scheduler job."""
    workflow_service.delete(workflow_id, user["id"])
    remove_workflow_job(workflow_id)


@router.post("/{workflow_id}/activate", response_model=WorkflowResponse)
async def activate_workflow(
    workflow_id: str, user: dict = Depends(get_current_user)
):
    """Set a workflow's status to 'active'. Adds scheduler job if trigger is schedule."""
    result = workflow_service.activate(workflow_id, user["id"])

    # Add scheduler job if it's a scheduled trigger
    definition = result.get("definition", {})
    trigger = definition.get("trigger", {})
    if trigger.get("type") == "schedule":
        cron = trigger.get("config", {}).get("cron", "0 9 * * *")
        add_workflow_job(workflow_id, result["name"], cron, definition)

    return result


@router.post("/{workflow_id}/pause", response_model=WorkflowResponse)
async def pause_workflow(
    workflow_id: str, user: dict = Depends(get_current_user)
):
    """Set a workflow's status to 'paused'. Removes scheduler job if present."""
    result = workflow_service.pause(workflow_id, user["id"])
    remove_workflow_job(workflow_id)
    return result


@router.post("/{workflow_id}/run", response_model=LogResponse)
async def run_workflow(
    workflow_id: str, user: dict = Depends(get_current_user)
):
    """Manually trigger a single run of a workflow."""
    workflow = workflow_service.get_by_id(workflow_id, user["id"])
    definition = WorkflowDefinition(**workflow["definition"])
    log_entry = await runner.run(
        workflow_id=workflow_id,
        workflow_name=workflow["name"],
        definition=definition,
        trigger_type="manual",
    )
    return log_entry
