"""Webhook receiver routes for external integrations."""

import asyncio
import logging

from fastapi import APIRouter, Request, status

from app.core.supabase import supabase
from app.models.workflow import WorkflowDefinition
from app.services.runner_service import runner

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)

@router.post("/trello", status_code=status.HTTP_200_OK)
async def trello_webhook(request: Request):
    """Receive and route Trello webhooks."""
    # In a real implementation, we would validate the X-Trello-Webhook signature here.
    try:
        payload = await request.json()
    except Exception:
        payload = {}
        
    action_type = payload.get("action", {}).get("type", "unknown")
    logger.info(f"Received Trello webhook action: {action_type}")
    
    # Fetch all active workflows
    try:
        result = (
            supabase.table("workflows")
            .select("id, name, definition")
            .eq("status", "active")
            .execute()
        )
        
        for wf in result.data:
            definition_dict = wf.get("definition", {})
            trigger = definition_dict.get("trigger", {})
            
            if trigger.get("type") == "trello":
                # Dispatch execution asynchronously
                definition = WorkflowDefinition(**definition_dict)
                asyncio.create_task(
                    runner.run(
                        workflow_id=wf["id"],
                        workflow_name=wf["name"],
                        definition=definition,
                        trigger_type="webhook",
                    )
                )
                logger.info(f"Dispatched Trello event to workflow {wf['id']}")
                
    except Exception as e:
        logger.error(f"Failed to process Trello webhook: {str(e)}")

    return {"status": "received"}
