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
        from fastapi import Response
        return Response(status_code=200)
        
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
    except ValueError as exc:
        logger.error("Malformed JSON in Trello webhook")
        raise HTTPException(status_code=400, detail="Malformed JSON") from exc

    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="JSON body must be an object")

    action = payload.get("action")
    if not isinstance(action, dict):
        raise HTTPException(status_code=400, detail="Payload must include an action object")

    action_type = action.get("type", "unknown")
    action_data = action.get("data") if isinstance(action.get("data"), dict) else {}
    board_id = (action_data.get("board") or {}).get("id")
    logger.info(f"Received Trello webhook action: {action_type}")

    event_context = {
        "action_type": action_type,
        "action_id": action.get("id"),
        "board_id": board_id,
        "card_id": (action_data.get("card") or {}).get("id"),
        "list_id": ((action_data.get("listAfter") or action_data.get("list")) or {}).get("id"),
    }

    # 3. Route to Workflows
    try:
        result = (
            supabase.table("workflows")
            .select("id, name, definition")
            .eq("status", "active")
            .execute()
        )
    except Exception as e:
        logger.exception("Failed to look up workflows for Trello webhook")
        # Non-2xx makes Trello retry, so a transient outage doesn't drop the event
        raise HTTPException(status_code=503, detail="Failed to accept webhook") from e

    for wf in result.data:
        try:
            definition_dict = wf.get("definition") or {}
            trigger = definition_dict.get("trigger") or {}
            if trigger.get("type") != "trello":
                continue
            if not _trigger_matches(trigger.get("config") or {}, action_type, board_id):
                continue

            # Dispatch execution via BackgroundTasks (robust persistence)
            definition = WorkflowDefinition(**definition_dict)
            background_tasks.add_task(
                runner.run,
                workflow_id=wf["id"],
                workflow_name=wf["name"],
                definition=definition,
                trigger_type="trello",
                trigger_payload=event_context,
            )
            logger.info(f"Queued Trello event for workflow {wf['id']}")
        except Exception:
            logger.exception(f"Error processing workflow {wf.get('id')}")

    return {"status": "received"}


def _trigger_matches(config: dict, action_type: str, board_id: str | None) -> bool:
    """Apply optional trigger filters; a workflow without filters matches every Trello event.

    Supported config keys:
        action_types: a Trello action type (e.g. "updateCard") or list of them.
        board_id: only fire for events on this board.
    """
    allowed_types = config.get("action_types")
    if isinstance(allowed_types, str):
        allowed_types = [allowed_types]
    if allowed_types and action_type not in allowed_types:
        return False

    required_board = config.get("board_id")
    if required_board and required_board != board_id:
        return False

    return True
