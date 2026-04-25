import hmac
import hashlib
import base64
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

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
