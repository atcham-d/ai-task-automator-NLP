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
    """Parse a natural language description into a structured WorkflowDefinition."""
    lower_text = text.lower()

    # Isolate trigger part from action part for better precision
    trigger_part = text
    action_part = text
    
    # Split at first comma ONLY (don't split at 'then' yet as it's semantic for actions)
    if any(k in lower_text[:30] for k in ["when", "if", "every", "at ", "each", "daily", "on "]):
        split_match = re.search(r",", lower_text)
        if split_match:
            idx = split_match.start()
            trigger_part = text[:idx].strip()
            action_part = text[idx+1:].strip()

    trigger = _detect_trigger(trigger_part.lower(), trigger_part)
    conditions = _detect_conditions(lower_text, text)
    actions = _detect_actions(action_part.lower(), action_part)

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
    trello_pattern = re.compile(r"trello")

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
            config={"cron": cron, "description": original_text, "source": "nl_parser"},
        )
    elif email_pattern.search(lower_text):
        from_match = re.search(r"from\s+([^\s,]+)", lower_text)
        config = {"filter": "", "source": "nl_parser"}
        if from_match:
            config["filter"] = f"from:{from_match.group(1)}"
        return Trigger(type=TriggerType.EMAIL, config=config)
    elif trello_pattern.search(lower_text):
        return Trigger(
            type=TriggerType.TRELLO,
            config={"description": "Trello card trigger", "source": "nl_parser"},
        )
    elif webhook_pattern.search(lower_text):
        return Trigger(
            type=TriggerType.WEBHOOK,
            config={"path": "/webhook/incoming", "method": "POST", "source": "nl_parser"},
        )
    else:
        # Default to webhook
        return Trigger(
            type=TriggerType.WEBHOOK,
            config={"path": "/webhook/incoming", "method": "POST", "source": "nl_parser"},
        )


def _detect_conditions(lower_text: str, original_text: str) -> List[Condition]:
    """Detect workflow conditions from natural language text."""
    conditions: List[Condition] = []

    condition_patterns = [
        # Stop at 'then', 'else', or end of string for better precision with unquoted values
        (r"if\s+(?:the\s+)?(\w+)\s+(is|equals|contains|matches)\s+[\"']?(.+?)(?=[\"']|\b(?:then|else)\b|$)", None),
        (r"(?:check|verify)\s+(?:that\s+)?(?:the\s+)?(\w+)\s+(is|equals|contains)\s+[\"']?(.+?)(?=[\"']|\b(?:then|else)\b|$)", None),
        (r"from\s+([\w\d@.-]+)", "sender"),
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
    # Check for conditional branching: ... then ... else ...
    if "then " in lower_text:
        # Split by 'then' and 'else'
        parts = re.split(r"\bthen\b|\belse\b", lower_text)
        if len(parts) >= 2:
            # parts[1] is 'then' branch, parts[2] is 'else' branch
            then_text = parts[1].strip()
            else_text = parts[2].strip() if len(parts) > 2 else ""
            
            actions = []
            if then_text:
                branch_actions = _extract_actions_from_snippet(then_text, original_text)
                for a in branch_actions:
                    a.config["condition_branch"] = "yes"
                actions.extend(branch_actions)
            
            if else_text:
                branch_actions = _extract_actions_from_snippet(else_text, original_text)
                for a in branch_actions:
                    a.config["condition_branch"] = "no"
                actions.extend(branch_actions)
            
            if actions:
                return actions

    # Fallback to standard multi-action detection
    return _extract_actions_from_snippet(lower_text, original_text)


def _extract_actions_from_snippet(lower_text: str, original_text: str) -> List[Action]:
    """Internal helper to detect actions from a string snippet."""
    detected = []

    # Patterns
    patterns = {
        ActionType.SLACK: re.compile(r"slack|#\w+|post.*(channel|slack)"),
        ActionType.DISCORD: re.compile(r"discord"),
        ActionType.SMTP: re.compile(r"smtp"),
        ActionType.EMAIL: re.compile(r"send.*(email|mail)|email (me|to)|notify.*email"),
        ActionType.TRELLO: re.compile(r"trello\s+card|create.*trello"),
        ActionType.NOTION: re.compile(r"notion|page|database"),
        ActionType.SHEETS: re.compile(r"sheets|spreadsheet|row"),
        ActionType.AIRTABLE: re.compile(r"airtable|record|base"),
    }

    # Find all matches with their start positions
    for atype, pattern in patterns.items():
        match = pattern.search(lower_text)
        if match:
            # Precedence: if 'smtp' is explicitly matched, skip generic 'email'
            if atype == ActionType.EMAIL and "smtp" in lower_text:
                continue
                
            start_pos = match.start()
            config = {}
            if atype == ActionType.SLACK:
                channel_match = re.search(r"#(\w+)", lower_text)
                config = {
                    "webhook_url": "PASTE_YOUR_SLACK_WEBHOOK_URL",
                    "channel": f"#{channel_match.group(1)}" if channel_match else "#general",
                    "message": _extract_message(original_text, "slack")
                }
            elif atype == ActionType.DISCORD:
                config = {
                    "webhook_url": "PASTE_YOUR_DISCORD_WEBHOOK_URL",
                    "message": _extract_message(original_text, "discord")
                }
            elif atype in [ActionType.EMAIL, ActionType.SMTP]:
                to_match = re.search(r"(?:to\s+)([^\s,]+@[^\s,]+)", lower_text)
                config = {
                    "to": to_match.group(1).rstrip(".,;") if to_match else "recipient@example.com",
                    "subject": "FlowAI Notification",
                    "body": original_text
                }
            elif atype == ActionType.TRELLO:
                config = {"name": _extract_message(original_text, "trello")}
            elif atype == ActionType.NOTION:
                config = {"title": _extract_message(original_text, "notion")}
            elif atype == ActionType.SHEETS:
                config = {"values": [_extract_message(original_text, "sheets")]}
            
            detected.append((start_pos, Action(type=atype, config=config)))

    # Sort by appearance in text
    detected.sort(key=lambda x: x[0])
    actions = [d[1] for d in detected]

    # HTTP Pattern (Explicit URL)
    url_match = re.search(r"https?://[^\s,]+", original_text)
    if url_match and re.search(r"(post|call|request|hit|send).*(api|url|endpoint|http)", lower_text):
        actions.append(
            Action(
                type=ActionType.HTTP,
                config={
                    "url": url_match.group(0).rstrip(".,;)"),
                    "method": "POST",
                    "body": {"text": original_text},
                },
            )
        )

    # Default logic (if strictly zero actions found)
    if not actions and not lower_text.startswith("if ") and "then " not in lower_text:
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
