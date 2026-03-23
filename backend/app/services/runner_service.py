"""Async workflow execution runner — dispatches actions and logs results."""

import time
from typing import Optional

import httpx

from app.models.workflow import ActionType, WorkflowDefinition
from app.services.log_service import log_service
from app.services.workflow_service import workflow_service


class WorkflowRunner:
    """Executes workflow actions and creates execution log entries."""

    async def run(
        self,
        workflow_id: str,
        workflow_name: str,
        definition: WorkflowDefinition,
        trigger_type: str = "manual",
    ) -> dict:
        """Execute all actions in a workflow definition and log the result.

        Args:
            workflow_id: The workflow's UUID.
            workflow_name: Human-readable name for log entries.
            definition: Parsed WorkflowDefinition with actions to execute.
            trigger_type: How the run was triggered (manual, schedule, webhook).

        Returns:
            The created execution log entry dict.
        """
        start_time = time.time()
        action_results = []
        error_message: Optional[str] = None
        final_status = "success"

        try:
            for i, action in enumerate(definition.actions):
                result = await self._execute_action(action)
                action_results.append(
                    {
                        "step": i + 1,
                        "type": action.type.value,
                        "result": result,
                    }
                )
        except Exception as e:
            final_status = "failed"
            error_message = str(e)

        duration_ms = int((time.time() - start_time) * 1000)

        # Create the log entry
        log_entry = log_service.create_log(
            workflow_id=workflow_id,
            workflow_name=workflow_name,
            trigger_type=trigger_type,
            log_status=final_status,
            duration_ms=duration_ms,
            output={"actions": action_results} if action_results else None,
            error=error_message,
        )

        # Update run count on success
        if final_status == "success":
            workflow_service.increment_run_count(workflow_id)

        return log_entry

    async def _execute_action(self, action) -> str:
        """Execute a single workflow action.

        Args:
            action: An Action model with type and config.

        Returns:
            A string describing the result.

        Raises:
            Exception: If the action fails with an error.
        """
        config = action.config

        async with httpx.AsyncClient(timeout=30.0) as client:
            if action.type == ActionType.HTTP:
                url = config.get("url", "")
                method = config.get("method", "POST").upper()
                body = config.get("body", {})
                headers = config.get("headers", {})

                if method == "GET":
                    resp = await client.get(url, headers=headers)
                else:
                    resp = await client.post(url, json=body, headers=headers)

                if resp.status_code >= 400:
                    raise Exception(
                        f"HTTP action failed with status {resp.status_code}: {resp.text[:200]}"
                    )
                return f"HTTP {method} to {url} — status {resp.status_code}"

            elif action.type == ActionType.SLACK:
                webhook_url = config.get("webhook_url", "")
                message = config.get("message", "Workflow executed by FlowAI")
                resp = await client.post(webhook_url, json={"text": message})
                if resp.status_code != 200:
                    raise Exception(
                        f"Slack webhook failed with status {resp.status_code}"
                    )
                return "Slack message sent successfully"

            elif action.type == ActionType.DISCORD:
                webhook_url = config.get("webhook_url", "")
                message = config.get("message", "Workflow executed by FlowAI")
                resp = await client.post(webhook_url, json={"content": message})
                if resp.status_code not in (200, 204):
                    raise Exception(
                        f"Discord webhook failed with status {resp.status_code}"
                    )
                return "Discord message sent successfully"

            elif action.type == ActionType.EMAIL:
                raise NotImplementedError(
                    "SMTP email action is not yet implemented — "
                    "configure an SMTP integration in Settings for future support"
                )
            elif action.type == ActionType.SMTP:
                raise NotImplementedError(
                    "SMTP action is recognized but not yet implemented"
                )
            elif action.type == ActionType.TRELLO:
                raise NotImplementedError(
                    "Trello action is recognized but not yet implemented"
                )
            else:
                raise Exception(f"Unknown action type: {action.type}")


runner = WorkflowRunner()
