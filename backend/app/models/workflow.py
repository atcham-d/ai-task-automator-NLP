"""Workflow domain models — enums and Pydantic structures for workflow definitions."""

from enum import Enum
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, model_validator

from app.models.workflow_graph import (
    ACTION_KIND,
    CONDITION_KIND,
    SCHEMA_VERSION,
    TRIGGER_KIND,
    migrate_definition,
    topological_order,
    validate_graph,
)


class TriggerType(str, Enum):
    """Supported workflow trigger types."""

    SCHEDULE = "schedule"
    WEBHOOK = "webhook"
    EMAIL = "email"
    TRELLO = "trello"


class ActionType(str, Enum):
    """Supported workflow action types."""

    HTTP = "http"
    SLACK = "slack"
    DISCORD = "discord"
    EMAIL = "email"
    SMTP = "smtp"
    NOTION = "notion"
    SHEETS = "sheets"
    AIRTABLE = "airtable"
    TRELLO = "trello"


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


class NodeKind(str, Enum):
    """Kinds of node in a workflow graph."""

    TRIGGER = TRIGGER_KIND
    CONDITION = CONDITION_KIND
    ACTION = ACTION_KIND


class Node(BaseModel):
    """A node in the workflow graph. Trigger and action nodes carry a type; condition nodes carry field/operator/value in config."""

    id: str
    kind: NodeKind
    type: Optional[str] = None
    config: Dict[str, Any] = {}


class Edge(BaseModel):
    """A directed connection from one node to another."""

    source: str
    target: str


def _condition_value(value: Any) -> str:
    """Store a condition value as text, matching the builder: booleans become true/false."""
    if isinstance(value, bool):
        return "true" if value else "false"
    return str(value)


def _check_condition(node: "Node") -> None:
    """A condition needs text field and operator, and a string, number or boolean value."""
    config = node.config
    for key in ("field", "operator"):
        if not isinstance(config.get(key), str) or not config.get(key):
            raise ValueError(f"condition node {node.id} needs a non-empty '{key}'")
    value = config.get("value")
    if isinstance(value, bool) or isinstance(value, (int, float, str)):
        return
    raise ValueError(f"condition node {node.id} needs a string, number or boolean 'value'")


class WorkflowDefinition(BaseModel):
    """Workflow graph (schema v2). Schema v1 input (trigger, conditions, actions) is upgraded on load."""

    schema_version: Literal[2] = SCHEMA_VERSION
    nodes: List[Node]
    edges: List[Edge] = []

    @model_validator(mode="before")
    @classmethod
    def _upgrade_v1(cls, data: Any) -> Any:
        return migrate_definition(data) if isinstance(data, dict) else data

    @model_validator(mode="after")
    def _validate_graph(self) -> "WorkflowDefinition":
        node_dicts = [node.model_dump() for node in self.nodes]
        validate_graph(node_dicts, [edge.model_dump() for edge in self.edges])
        for node in self.nodes:
            if node.kind == NodeKind.TRIGGER:
                TriggerType(node.type)
            elif node.kind == NodeKind.ACTION:
                ActionType(node.type)
            elif node.kind == NodeKind.CONDITION:
                _check_condition(node)
        return self

    @classmethod
    def from_parts(
        cls,
        trigger: Trigger,
        conditions: List[Condition],
        actions: List[Action],
    ) -> "WorkflowDefinition":
        """Build a graph from the flat parts the NLP parser produces, chained in order."""
        return cls(**migrate_definition({
            "trigger": trigger.model_dump(),
            "conditions": [c.model_dump() for c in conditions],
            "actions": [a.model_dump() for a in actions],
        }))

    def _ordered_nodes(self) -> List[Node]:
        by_id = {node.id: node for node in self.nodes}
        order = topological_order(by_id, [(e.source, e.target) for e in self.edges])
        return [by_id[node_id] for node_id in order]

    @property
    def trigger(self) -> Trigger:
        node = next(n for n in self.nodes if n.kind == NodeKind.TRIGGER)
        return Trigger(type=node.type, config=node.config)

    @property
    def conditions(self) -> List[Condition]:
        return [
            Condition(**{**n.config, "value": _condition_value(n.config.get("value"))})
            for n in self._ordered_nodes()
            if n.kind == NodeKind.CONDITION
        ]

    @property
    def actions(self) -> List[Action]:
        return [Action(type=n.type, config=n.config) for n in self._ordered_nodes() if n.kind == NodeKind.ACTION]
