"""Rule-based NLP parser — converts natural language to a WorkflowDefinition."""

import re
from typing import List

from app.models.workflow import (  # type: ignore
    Action,
    ActionType,
    Condition,
    Trigger,
    TriggerType,
    WorkflowDefinition,
)


# ── Day-of-week mapping for cron ──
DAY_MAP = {
    "monday": "1", "mon": "1",
    "tuesday": "2", "tue": "2", "tues": "2",
    "wednesday": "3", "wed": "3",
    "thursday": "4", "thu": "4", "thur": "4", "thurs": "4",
    "friday": "5", "fri": "5",
    "saturday": "6", "sat": "6",
    "sunday": "0", "sun": "0",
    "weekday": "1-5", "weekdays": "1-5",
    "weekend": "0,6", "weekends": "0,6",
}


def parse_nl_to_workflow(text: str) -> WorkflowDefinition:
    """Parse a natural language description into a structured WorkflowDefinition.

    Uses regex pattern matching to detect trigger type and action types from
    the input text. This is a rule-based MVP — future versions will use a
    fine-tuned T5/BART model.

    Args:
        text: Natural language workflow description.

    Returns:
        A WorkflowDefinition with the detected trigger, conditions, and actions.
    """
    lower_text = text.lower()

    trigger = _detect_trigger(lower_text, text)
    conditions = _detect_conditions(lower_text, text)
    actions = _detect_actions(lower_text, text)

    return WorkflowDefinition(
        trigger=trigger,
        conditions=conditions,
        actions=actions,
    )


def _parse_time_to_hour(time_str: str) -> str:
    """Convert a time string like '9am', '5pm', '14', '2:30pm' to a 24h hour."""
    time_str = time_str.strip().lower()
    # Extract hour and optional am/pm
    match = re.match(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", time_str)
    if not match:
        return "9"  # default

    hour = int(match.group(1))
    period = match.group(3)

    if period == "pm" and hour != 12:
        hour += 12
    elif period == "am" and hour == 12:
        hour = 0

    return str(hour)


def _detect_day_of_week(lower_text: str) -> str:
    """Detect day-of-week from text, returning cron day-of-week field."""
    for day_name, cron_val in DAY_MAP.items():
        if day_name in lower_text:
            return cron_val
    return "*"  # every day


def _detect_trigger(lower_text: str, original_text: str) -> Trigger:
    """Detect the workflow trigger from natural language text."""
    schedule_pattern = re.compile(
        r"every|daily|hourly|at \d+|each (day|hour|week)|schedule|cron|weekly|monthly"
    )
    email_pattern = re.compile(r"(receive|get|when).*(email|mail)")
    webhook_pattern = re.compile(r"webhook|api call|incoming request")

    if schedule_pattern.search(lower_text):
        # Parse time
        time_match = re.search(r"at (\d{1,2}(?::\d{2})?\s*(?:am|pm)?)", lower_text)
        if time_match:
            hour = _parse_time_to_hour(time_match.group(1))
        else:
            hour = "9"  # default 9 AM

        # Parse day-of-week
        dow = _detect_day_of_week(lower_text)

        # Handle special frequencies
        if "hourly" in lower_text or "every hour" in lower_text:
            cron = "0 * * * *"
        elif "monthly" in lower_text:
            cron = f"0 {hour} 1 * *"
        elif "weekly" in lower_text:
            cron = f"0 {hour} * * {dow if dow != '*' else '1'}"
        else:
            cron = f"0 {hour} * * {dow}"

        return Trigger(
            type=TriggerType.SCHEDULE,
            config={"cron": cron, "description": original_text},
        )
    elif email_pattern.search(lower_text):
        from_match = re.search(r"from\s+([^\s,]+)", lower_text)
        config = {"filter": ""}
        if from_match:
            config["filter"] = f"from:{from_match.group(1)}"
        return Trigger(type=TriggerType.EMAIL, config=config)
    elif webhook_pattern.search(lower_text):
        return Trigger(
            type=TriggerType.WEBHOOK,
            config={"path": "/webhook/incoming", "method": "POST"},
        )
    else:
        # Default to webhook
        return Trigger(
            type=TriggerType.WEBHOOK,
            config={"path": "/webhook/incoming", "method": "POST"},
        )


def _detect_conditions(lower_text: str, original_text: str) -> List[Condition]:
    """Detect workflow conditions from natural language text."""
    conditions: List[Condition] = []

    condition_patterns = [
        (r"if\s+(?:the\s+)?(\w+)\s+(is|equals|contains|matches)\s+[\"']?([\"',]+)[\"']?", None),
        (r"(?:check|verify)\s+(?:that\s+)?(?:the\s+)?(\w+)\s+(is|equals|contains)\s+[\"']?([\"',]+)[\"']?", None),
        (r"from\s+(\w+)", "sender"),
    ]

    for pattern, field_override in condition_patterns:
        match = re.search(pattern, lower_text)
        if match:
            if field_override == "sender":
                conditions.append(
                    Condition(
                        field="from",
                        operator="equals",
                        value=match.group(1),
                    )
                )
            else:
                conditions.append(
                    Condition(
                        field=match.group(1),
                        operator=match.group(2),
                        value=match.group(3).strip(),
                    )
                )

    return conditions


def _detect_actions(lower_text: str, original_text: str) -> List[Action]:
    """Detect all workflow actions from natural language text."""
    actions: List[Action] = []

    slack_pattern = re.compile(r"slack|#\w+|post.*(channel|slack)")
    discord_pattern = re.compile(r"discord")
    email_action_pattern = re.compile(r"send.*(email|mail)|email (me|to)|notify.*email")
    http_pattern = re.compile(
        r"(post|call|request|hit|send).*(api|url|endpoint|http)"
    )
    trello_pattern = re.compile(r"trello|card|board")
    notion_pattern = re.compile(r"notion|page|database")
    sheets_pattern = re.compile(r"sheets|spreadsheet|row")
    airtable_pattern = re.compile(r"airtable|record|base")

    if slack_pattern.search(lower_text):
        channel_match = re.search(r"#(\w+)", lower_text)
        channel = channel_match.group(1) if channel_match else "general"
        message = _extract_message(original_text, "slack")
        actions.append(
            Action(
                type=ActionType.SLACK,
                config={
                    "webhook_url": "PASTE_YOUR_SLACK_WEBHOOK_URL",
                    "message": message,
                    "channel": f"#{channel}",
                },
            )
        )

    if discord_pattern.search(lower_text):
        message = _extract_message(original_text, "discord")
        actions.append(
            Action(
                type=ActionType.DISCORD,
                config={
                    "webhook_url": "PASTE_YOUR_DISCORD_WEBHOOK_URL",
                    "message": message,
                },
            )
        )

    if email_action_pattern.search(lower_text):
        to_match = re.search(r"(?:email\s+(?:to\s+)?|to\s+)([^\s,]+@[^\s,]+)", lower_text)
        recipient = to_match.group(1).rstrip(".,;") if to_match else "recipient@example.com"
        actions.append(
            Action(
                type=ActionType.EMAIL,
                config={
                    "to": recipient,
                    "subject": "FlowAI Notification",
                    "body": original_text,
                },
            )
        )

    if trello_pattern.search(lower_text):
        actions.append(
            Action(
                type=ActionType.TRELLO,
                config={
                    "board_id": "",
                    "list_id": "",
                    "name": _extract_message(original_text, "trello"),
                    "desc": ""
                },
            )
        )

    if notion_pattern.search(lower_text):
        actions.append(
            Action(
                type=ActionType.NOTION,
                config={
                    "database_id": "",
                    "title": _extract_message(original_text, "notion"),
                    "content": ""
                },
            )
        )

    if sheets_pattern.search(lower_text):
        actions.append(
            Action(
                type=ActionType.SHEETS,
                config={
                    "spreadsheet_id": "",
                    "range": "Sheet1!A:A",
                    "values": [_extract_message(original_text, "sheets")]
                },
            )
        )

    if airtable_pattern.search(lower_text):
        actions.append(
            Action(
                type=ActionType.AIRTABLE,
                config={
                    "base_id": "",
                    "table_name": "",
                    "fields": {
                        "Name": _extract_message(original_text, "airtable")
                    }
                },
            )
        )

    # Only detect HTTP action for explicit URLs, not for generic "http" in webhook context
    url_match = re.search(r"https?://[^\s,]+", original_text)
    if url_match and http_pattern.search(lower_text):
        url = url_match.group(0).rstrip(".,;)")
        actions.append(
            Action(
                type=ActionType.HTTP,
                config={
                    "url": url,
                    "method": "POST",
                    "body": {"text": original_text},
                },
            )
        )

    # Default: if no action detected, create an HTTP action
    if not actions:
        actions.append(
            Action(
                type=ActionType.HTTP,
                config={
                    "url": "https://example.com/webhook",
                    "method": "POST",
                    "body": {"text": original_text},
                },
            )
        )

    return actions


def _extract_message(text: str, platform: str) -> str:
    """Extract a meaningful message from the workflow description.

    Falls back to the original text if no specific message pattern is found.
    """
    # Look for quoted text
    quoted = re.search(r'["\'"](.+?)["\'"]', text)
    if quoted:
        return quoted.group(1)

    # Look for "with the message..." or "saying..."
    msg_match = re.search(
        r"(?:with (?:the )?message|saying|with text)\s+(.+?)(?:\.|$)",
        text,
        re.IGNORECASE,
    )
    if msg_match:
        return msg_match.group(1).strip()

    return text
