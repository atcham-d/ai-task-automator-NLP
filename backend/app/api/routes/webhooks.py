"""Webhook receiver routes for external integrations."""

import hmac
import hashlib
import base64
import logging

from fastapi import APIRouter, Request, status, BackgroundTasks, HTTPException

from app.core.config import settings
from app.core.supabase import supabase
from app.models.workflow import WorkflowDefinition
from app.services.runner_service import runner

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)

@router.api_route("/trello", methods=["POST", "HEAD"], status_code=status.HTTP_200_OK)
async def trello_webhook(request: Request, background_tasks: BackgroundTasks):
    """Receive and route Trello webhooks with HMAC-SHA1 validation."""
    if request.method == "HEAD":
        return status.HTTP_200_OK
        
    raw_body = await request.body()
    trello_signature = request.headers.get("X-Trello-Webhook")
    
    # 1. Validation Bypass (Development Only)
    if not settings.ENABLE_AUTH_BYPASS:
        if not trello_signature:
            logger.warning("Missing X-Trello-Webhook header")
            raise HTTPException(status_code=401, detail="Missing signature")
            
        # Trello HMAC-SHA1 signature base is: body + callbackURL
        signature_base = raw_body + settings.TRELLO_WEBHOOK_CALLBACK_URL.encode('utf-8')
        expected_signature = base64.b64encode(
            hmac.new(
                settings.TRELLO_WEBHOOK_SECRET.encode('utf-8'),
                signature_base,
                hashlib.sha1
            ).digest()
        ).decode('utf-8')
        
        if not hmac.compare_digest(trello_signature, expected_signature):
            logger.warning("Invalid Trello webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")

    # 2. Parse Payload
    try:
        payload = await request.json()
    except Exception:
        logger.error("Malformed JSON in Trello webhook")
        raise HTTPException(status_code=400, detail="Malformed JSON")
        
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="JSON body must be an object")
        
    action_type = payload.get("action", {}).get("type", "unknown")
    logger.info(f"Received Trello webhook action: {action_type}")
    
    # 3. Route to Workflows
    try:
        result = (
            supabase.table("workflows")
            .select("id, name, definition")
            .eq("status", "active")
            .execute()
        )
        
        for wf in result.data:
            try:
                definition_dict = wf.get("definition", {})
                trigger = definition_dict.get("trigger", {})
                
                if trigger.get("type") == "trello":
                    # Dispatch execution via BackgroundTasks (robust persistence)
                    definition = WorkflowDefinition(**definition_dict)
                    background_tasks.add_task(
                        runner.run,
                        workflow_id=wf["id"],
                        workflow_name=wf["name"],
                        definition=definition,
                        trigger_type="trello",
                    )
                    logger.info(f"Queued Trello event for workflow {wf['id']}")
            except Exception as loop_e:
                logger.error(f"Error processing workflow {wf.get('id')}: {str(loop_e)}")
                
    except Exception as e:
        logger.error(f"Failed to route Trello webhook: {str(e)}")
        # We return 200 to Trello even on internal routing errors to avoid retries 
        # for non-transient logic errors, but logs will capture the issue.
    return {"status": "received"}
