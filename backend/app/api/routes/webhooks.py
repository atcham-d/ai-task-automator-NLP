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

    action_type = action.get("type")
    if not isinstance(action_type, str) or not action_type:
        raise HTTPException(status_code=400, detail="Action must include a type")

    action_data = action.get("data") or {}
    if not isinstance(action_data, dict):
        raise HTTPException(status_code=400, detail="Action data must be an object")

    board_id = _object_id(action_data, "board")
    logger.info(f"Received Trello webhook action: {action_type}")

    event_context = {
        "action_type": action_type,
        "action_id": action.get("id"),
        "board_id": board_id,
        "card_id": _object_id(action_data, "card"),
        "list_id": _object_id(action_data, "listAfter") or _object_id(action_data, "list"),
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


def _object_id(data: dict, key: str) -> str | None:
    """Return the `id` of an optional nested Trello object, or None if it is absent.

    A present value that is not an object is a malformed payload and raises a 400.
    """
    value = data.get(key)
    if value is None:
        return None
    if not isinstance(value, dict):
        raise HTTPException(status_code=400, detail=f"{key} must be an object")
    return value.get("id")


def _trigger_matches(config: dict, action_type: str, board_id: str | None) -> bool:
    """Apply optional trigger filters; a workflow without filters matches every Trello event.

    Supported config keys:
        action_types: a Trello action type (e.g. "updateCard") or list of them.
        board_id: only fire for events on this board.
    """
    allowed_types = config.get("action_types")
    if isinstance(allowed_types, str):
        allowed_types = [allowed_types]
    elif allowed_types is not None and (
        not isinstance(allowed_types, list)
        or not all(isinstance(item, str) for item in allowed_types)
    ):
        logger.warning(f"Ignoring workflow trigger with invalid action_types: {allowed_types!r}")
        return False
    if allowed_types and action_type not in allowed_types:
        return False

    required_board = config.get("board_id")
    if required_board and required_board != board_id:
        return False

    return True
