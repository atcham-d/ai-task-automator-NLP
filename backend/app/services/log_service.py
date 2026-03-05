"""Service layer for execution log operations against Supabase."""

from typing import List, Optional

from fastapi import HTTPException, status

from app.core.supabase import supabase


class LogService:
    """Handles execution log read and write operations."""

    def create_log(
        self,
        workflow_id: str,
        workflow_name: str,
        trigger_type: str,
        log_status: str,
        duration_ms: Optional[int] = None,
        output: Optional[dict] = None,
        error: Optional[str] = None,
    ) -> dict:
        """Create a new execution log entry."""
        try:
            result = (
                supabase.table("execution_logs")
                .insert(
                    {
                        "workflow_id": workflow_id,
                        "workflow_name": workflow_name,
                        "trigger_type": trigger_type,
                        "status": log_status,
                        "duration_ms": duration_ms,
                        "output": output,
                        "error": error,
                    }
                )
                .execute()
            )
            return result.data[0]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create log: {str(e)}",
            )

    def get_logs(
        self,
        user_id: str,
        workflow_id: Optional[str] = None,
        log_status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[dict]:
        """Retrieve execution logs for a user's workflows with optional filters.

        Enforces ownership by joining through the workflows table.
        """
        try:
            # First get user's workflow IDs
            wf_result = (
                supabase.table("workflows")
                .select("id")
                .eq("user_id", user_id)
                .execute()
            )
            user_workflow_ids = [w["id"] for w in wf_result.data]

            if not user_workflow_ids:
                return []

            query = supabase.table("execution_logs").select("*")

            if workflow_id:
                if workflow_id not in user_workflow_ids:
                    return []
                query = query.eq("workflow_id", workflow_id)
            else:
                query = query.in_("workflow_id", user_workflow_ids)

            if log_status:
                query = query.eq("status", log_status)

            result = (
                query.order("triggered_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            return result.data
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch logs: {str(e)}",
            )

    def get_by_id(self, log_id: str, user_id: str) -> dict:
        """Retrieve a single log entry by ID. Verifies user ownership via workflow."""
        try:
            result = (
                supabase.table("execution_logs")
                .select("*")
                .eq("id", log_id)
                .execute()
            )
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Log entry not found",
                )

            log_entry = result.data[0]

            # Verify ownership through workflow
            wf_result = (
                supabase.table("workflows")
                .select("id")
                .eq("id", log_entry["workflow_id"])
                .eq("user_id", user_id)
                .execute()
            )
            if not wf_result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Log entry not found",
                )

            return log_entry
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch log: {str(e)}",
            )


log_service = LogService()
