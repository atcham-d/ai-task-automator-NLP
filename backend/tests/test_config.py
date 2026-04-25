import pytest
from pydantic import ValidationError
from app.core.config import Settings

def test_trello_webhook_secret_required():
    """Test that TRELLO_WEBHOOK_SECRET is required and cannot be empty."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(TRELLO_WEBHOOK_SECRET="")
    assert "TRELLO_WEBHOOK_SECRET" in str(exc_info.value)
    assert "must not be empty" in str(exc_info.value)

def test_trello_webhook_secret_cannot_be_whitespace():
    """Test that TRELLO_WEBHOOK_SECRET cannot be only whitespace."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(TRELLO_WEBHOOK_SECRET="   ")
    assert "TRELLO_WEBHOOK_SECRET" in str(exc_info.value)
    assert "must not be empty" in str(exc_info.value)

def test_trello_webhook_secret_cannot_be_placeholder():
    """Test that TRELLO_WEBHOOK_SECRET cannot be the default placeholder."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(TRELLO_WEBHOOK_SECRET="your_trello_webhook_secret")
    assert "TRELLO_WEBHOOK_SECRET" in str(exc_info.value)
    assert "is still set to the default placeholder" in str(exc_info.value)

def test_trello_webhook_secret_valid():
    """Test that a valid TRELLO_WEBHOOK_SECRET is accepted."""
    settings = Settings(TRELLO_WEBHOOK_SECRET="a_real_secret_12345")
    assert settings.TRELLO_WEBHOOK_SECRET == "a_real_secret_12345"
