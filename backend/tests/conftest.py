import os
import pytest

# Ensure Pydantic Settings parses these defaults during tests without ValidationError
os.environ["TRELLO_WEBHOOK_SECRET"] = "dummy_secret_for_tests"
os.environ["TRELLO_WEBHOOK_CALLBACK_URL"] = "http://testserver/api/webhooks/trello"
