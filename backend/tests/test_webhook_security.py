import hmac
import hashlib
import base64
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def _mock_workflows(rows):
    """Return a patch that makes the Supabase workflows lookup yield the given rows."""
    mock_supabase = MagicMock()
    query = mock_supabase.table.return_value.select.return_value.eq.return_value
    query.execute.return_value = MagicMock(data=rows)
    return patch("app.api.routes.webhooks.supabase", mock_supabase)


@pytest.fixture(autouse=True)
def no_workflows():
    """Default to an empty workflow table so tests never hit the real Supabase."""
    with _mock_workflows([]):
        yield

def test_trello_webhook_no_signature_returns_401():
    """Test that requests without a signature header are rejected when bypass is off."""
    original_bypass = settings.ENABLE_AUTH_BYPASS
    settings.ENABLE_AUTH_BYPASS = False
    try:
        response = client.post("/api/webhooks/trello", json={"action": {"type": "createCard"}})
        assert response.status_code == 401
        assert response.json()["detail"] == "Missing signature"
    finally:
        settings.ENABLE_AUTH_BYPASS = original_bypass

def test_trello_webhook_head_returns_200():
    """Test that HEAD requests (used by Trello for verification) return 200."""
    response = client.head("/api/webhooks/trello")
    assert response.status_code == 200

def test_trello_webhook_invalid_signature_returns_401():
    """Test that requests with an invalid signature are rejected when bypass is off."""
    original_bypass = settings.ENABLE_AUTH_BYPASS
    settings.ENABLE_AUTH_BYPASS = False
    try:
        headers = {"X-Trello-Webhook": "invalid_sig_base64"}
        response = client.post(
            "/api/webhooks/trello", 
            json={"action": {"type": "createCard"}},
            headers=headers
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid signature"
    finally:
        settings.ENABLE_AUTH_BYPASS = original_bypass

def test_trello_webhook_valid_signature_returns_200():
    """Test that requests with a valid HMAC-SHA1 signature are accepted."""
    original_bypass = settings.ENABLE_AUTH_BYPASS
    original_secret = settings.TRELLO_WEBHOOK_SECRET
    original_url = settings.TRELLO_WEBHOOK_CALLBACK_URL
    
    settings.ENABLE_AUTH_BYPASS = False
    settings.TRELLO_WEBHOOK_SECRET = "test_secret"
    settings.TRELLO_WEBHOOK_CALLBACK_URL = "http://testserver/api/webhooks/trello"
    
    try:
        payload = b'{"action": {"type": "createCard"}}'
        # Trello base: body + callbackURL
        sig_base = payload + settings.TRELLO_WEBHOOK_CALLBACK_URL.encode('utf-8')
        expected_sig = base64.b64encode(
            hmac.new(b"test_secret", sig_base, hashlib.sha1).digest()
        ).decode('utf-8')
        
        headers = {"X-Trello-Webhook": expected_sig}
        response = client.post(
            "/api/webhooks/trello", 
            content=payload,
            headers=headers
        )
        assert response.status_code == 200
        assert response.json() == {"status": "received"}
    finally:
        settings.ENABLE_AUTH_BYPASS = original_bypass
        settings.TRELLO_WEBHOOK_SECRET = original_secret
        settings.TRELLO_WEBHOOK_CALLBACK_URL = original_url

def test_trello_webhook_bypass_skips_validation():
    """Test that validation is skipped when ENABLE_AUTH_BYPASS is True."""
    original_bypass = settings.ENABLE_AUTH_BYPASS
    settings.ENABLE_AUTH_BYPASS = True
    try:
        # No header sent, should still pass
        response = client.post("/api/webhooks/trello", json={"action": {"type": "createCard"}})
        assert response.status_code == 200
        assert response.json() == {"status": "received"}
    finally:
        settings.ENABLE_AUTH_BYPASS = original_bypass

def test_trello_webhook_malformed_json_returns_400():
    """Test that malformed JSON payloads return 400 Bad Request."""
    original_bypass = settings.ENABLE_AUTH_BYPASS
    settings.ENABLE_AUTH_BYPASS = True
    try:
        response = client.post(
            "/api/webhooks/trello",
            content='{invalid_json: true',
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 400
        assert "Malformed JSON" in response.json()["detail"]
    finally:
        settings.ENABLE_AUTH_BYPASS = original_bypass

def test_trello_webhook_non_object_json_returns_400():
    """Test that JSON payloads that are not objects return 400 Bad Request."""
    original_bypass = settings.ENABLE_AUTH_BYPASS
    settings.ENABLE_AUTH_BYPASS = True
    try:
        response = client.post(
            "/api/webhooks/trello",
            json=["not", "an", "object"]
        )
        assert response.status_code == 400
        assert "JSON body must be an object" in response.json()["detail"]
    finally:
        settings.ENABLE_AUTH_BYPASS = original_bypass


def test_trello_webhook_missing_action_returns_400():
    """Payloads without an action object are rejected."""
    original_bypass = settings.ENABLE_AUTH_BYPASS
    settings.ENABLE_AUTH_BYPASS = True
    try:
        response = client.post("/api/webhooks/trello", json={"model": {}})
        assert response.status_code == 400
        assert "action object" in response.json()["detail"]
    finally:
        settings.ENABLE_AUTH_BYPASS = original_bypass


def test_trello_webhook_lookup_failure_returns_503():
    """A failed workflow lookup is not acknowledged, so Trello retries."""
    original_bypass = settings.ENABLE_AUTH_BYPASS
    settings.ENABLE_AUTH_BYPASS = True
    failing = MagicMock()
    failing.table.side_effect = RuntimeError("db down")
    try:
        with patch("app.api.routes.webhooks.supabase", failing):
            response = client.post("/api/webhooks/trello", json={"action": {"type": "createCard"}})
        assert response.status_code == 503
    finally:
        settings.ENABLE_AUTH_BYPASS = original_bypass


def test_trello_webhook_applies_trigger_filters():
    """Only workflows whose trigger filters match the event are queued, with event context."""
    def workflow(wf_id, config):
        return {
            "id": wf_id,
            "name": wf_id,
            "definition": {
                "trigger": {"type": "trello", "config": config},
                "actions": [{"type": "http", "config": {}}],
            },
        }

    rows = [
        workflow("any", {}),
        workflow("type-match", {"action_types": ["updateCard"]}),
        workflow("type-miss", {"action_types": "createCard"}),
        workflow("board-match", {"board_id": "b1"}),
        workflow("board-miss", {"board_id": "b2"}),
    ]
    payload = {"action": {"id": "a1", "type": "updateCard", "data": {"board": {"id": "b1"}, "card": {"id": "c1"}}}}

    original_bypass = settings.ENABLE_AUTH_BYPASS
    settings.ENABLE_AUTH_BYPASS = True
    try:
        with _mock_workflows(rows), patch("app.api.routes.webhooks.runner") as mock_runner:
            mock_runner.run = MagicMock(return_value=None)
            response = client.post("/api/webhooks/trello", json=payload)

        assert response.status_code == 200
        queued = {c.kwargs["workflow_id"] for c in mock_runner.run.call_args_list}
        assert queued == {"any", "type-match", "board-match"}
        ctx = mock_runner.run.call_args_list[0].kwargs["trigger_payload"]
        assert ctx["board_id"] == "b1" and ctx["card_id"] == "c1" and ctx["action_type"] == "updateCard"
    finally:
        settings.ENABLE_AUTH_BYPASS = original_bypass
