"""Workflow domain models — enums and Pydantic structures for workflow definitions."""

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class TriggerType(str, Enum):
    """Supported workflow trigger types."""

    SCHEDULE = "schedule"
    WEBHOOK = "webhook"
    EMAIL = "email"


class ActionType(str, Enum):
    """Supported workflow action types."""

    HTTP = "http"
    SLACK = "slack"
    DISCORD = "discord"
    EMAIL = "email"


class WorkflowStatus(str, Enum):
    """Workflow lifecycle status."""

    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"


class Trigger(BaseModel):
    """A workflow trigger definition."""

    type: TriggerType
    config: Dict[str, Any] = {}


class Condition(BaseModel):
    """A workflow condition for branching logic."""

    field: str
    operator: str
    value: str


class Action(BaseModel):
    """A workflow action to execute."""

    type: ActionType
    config: Dict[str, Any] = {}


class WorkflowDefinition(BaseModel):
    """Complete parsed workflow structure with trigger, conditions, and actions."""

    trigger: Trigger
    conditions: List[Condition] = []
    actions: List[Action]
