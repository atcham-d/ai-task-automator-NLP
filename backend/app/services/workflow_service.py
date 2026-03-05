"""Service layer for workflow CRUD operations against Supabase."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import HTTPException, status

from app.core.supabase import supabase
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate


class WorkflowService:
    """Handles all workflow-related Supabase operations."""

    def create(self, user_id: str, data: WorkflowCreate) -> dict:
        """Create a new workflow for the given user."""
        try:
            result = (
                supabase.table("workflows")
                .insert(
                    {
                        "user_id": user_id,
                        "name": data.name,
                        "description": data.description,
                        "definition": data.definition.model_dump(),
                        "status": "draft",
                        "run_count": 0,
                    }
                )
                .execute()
            )
            return result.data[0]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create workflow: {str(e)}",
            )

    def get_all(self, user_id: str) -> List[dict]:
        """Retrieve all workflows for a user, ordered by most recently updated."""
        try:
            result = (
                supabase.table("workflows")
                .select("*")
                .eq("user_id", user_id)
                .order("updated_at", desc=True)
                .execute()
            )
            return result.data
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch workflows: {str(e)}",
            )

    def get_by_id(self, workflow_id: str, user_id: str) -> dict:
        """Retrieve a single workflow by ID. Raises 404 if not found or not owned by user."""
        try:
            result = (
                supabase.table("workflows")
                .select("*")
                .eq("id", workflow_id)
                .eq("user_id", user_id)
                .execute()
            )
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Workflow not found",
                )
            return result.data[0]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch workflow: {str(e)}",
            )

    def update(self, workflow_id: str, user_id: str, data: WorkflowUpdate) -> dict:
        """Update a workflow with only the provided (non-None) fields."""
        # Verify ownership first
        self.get_by_id(workflow_id, user_id)

        update_data: Dict[str, Any] = {}
        if data.name is not None:
            update_data["name"] = data.name
        if data.description is not None:
            update_data["description"] = data.description
        if data.definition is not None:
            update_data["definition"] = data.definition.model_dump()
        if data.status is not None:
            update_data["status"] = data.status

        if not update_data:
            return self.get_by_id(workflow_id, user_id)

        try:
            result = (
                supabase.table("workflows")
                .update(update_data)
                .eq("id", workflow_id)
                .eq("user_id", user_id)
                .execute()
            )
            return result.data[0]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update workflow: {str(e)}",
            )

    def delete(self, workflow_id: str, user_id: str) -> None:
        """Delete a workflow by ID. Raises 404 if not found."""
        self.get_by_id(workflow_id, user_id)
        try:
            supabase.table("workflows").delete().eq("id", workflow_id).eq(
                "user_id", user_id
            ).execute()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete workflow: {str(e)}",
            )

    def activate(self, workflow_id: str, user_id: str) -> dict:
        """Set a workflow's status to 'active'."""
        self.get_by_id(workflow_id, user_id)
        try:
            result = (
                supabase.table("workflows")
                .update({"status": "active"})
                .eq("id", workflow_id)
                .eq("user_id", user_id)
                .execute()
            )
            return result.data[0]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to activate workflow: {str(e)}",
            )

    def pause(self, workflow_id: str, user_id: str) -> dict:
        """Set a workflow's status to 'paused'."""
        self.get_by_id(workflow_id, user_id)
        try:
            result = (
                supabase.table("workflows")
                .update({"status": "paused"})
                .eq("id", workflow_id)
                .eq("user_id", user_id)
                .execute()
            )
            return result.data[0]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to pause workflow: {str(e)}",
            )

    def increment_run_count(self, workflow_id: str) -> None:
        """Increment the run count and update last_run_at timestamp."""
        try:
            # Fetch current count
            result = (
                supabase.table("workflows")
                .select("run_count")
                .eq("id", workflow_id)
                .execute()
            )
            if result.data:
                current_count = result.data[0].get("run_count", 0)
                supabase.table("workflows").update(
                    {
                        "run_count": current_count + 1,
                        "last_run_at": datetime.now(timezone.utc).isoformat(),
                    }
                ).eq("id", workflow_id).execute()
        except Exception:
            pass  # Non-critical — don't fail the run if count update fails


workflow_service = WorkflowService()
