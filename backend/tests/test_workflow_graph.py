"""Schema v2 workflow graph: validation, v1 migration and execution of upgraded workflows."""

import asyncio
import re

import pytest
from pydantic import ValidationError

from app.models.workflow import Action, ActionType, Condition, Trigger, TriggerType, WorkflowDefinition
from app.models.workflow_graph import find_trigger, migrate_definition, topological_order, validate_graph
from app.services import runner_service


def _v2(nodes, edges):
    return {"schema_version": 2, "nodes": nodes, "edges": edges}


TRIGGER = {"id": "t", "kind": "trigger", "type": "trello", "config": {}}
ACTION_A = {"id": "a", "kind": "action", "type": "slack", "config": {"message": "a"}}
ACTION_B = {"id": "b", "kind": "action", "type": "http", "config": {"url": "https://example.com"}}


def test_valid_linear_graph_is_accepted_and_ordered():
    definition = WorkflowDefinition(**_v2(
        [TRIGGER, ACTION_B, ACTION_A],
        [{"source": "t", "target": "a"}, {"source": "a", "target": "b"}],
    ))
    assert [a.type for a in definition.actions] == [ActionType.SLACK, ActionType.HTTP]
    assert definition.trigger.type == TriggerType.TRELLO


def test_valid_fan_out_graph_keeps_topological_order():
    definition = WorkflowDefinition(**_v2(
        [TRIGGER, ACTION_A, ACTION_B],
        [{"source": "t", "target": "a"}, {"source": "t", "target": "b"}],
    ))
    assert [a.config.get("message") or a.config.get("url") for a in definition.actions] == ["a", "https://example.com"]


def test_cycle_between_actions_is_rejected():
    with pytest.raises(ValidationError, match="contains a cycle involving nodes: a, b"):
        WorkflowDefinition(**_v2(
            [TRIGGER, ACTION_A, ACTION_B],
            [{"source": "t", "target": "a"}, {"source": "a", "target": "b"}, {"source": "b", "target": "a"}],
        ))


def test_edge_back_into_trigger_is_rejected_as_cycle():
    with pytest.raises(ValidationError, match="cycle"):
        WorkflowDefinition(**_v2(
            [TRIGGER, ACTION_A],
            [{"source": "t", "target": "a"}, {"source": "a", "target": "t"}],
        ))


def test_disconnected_action_is_rejected_as_orphan():
    with pytest.raises(ValidationError, match="not reachable from the trigger: b"):
        WorkflowDefinition(**_v2(
            [TRIGGER, ACTION_A, ACTION_B],
            [{"source": "t", "target": "a"}],
        ))


@pytest.mark.parametrize(
    "nodes, edges, message",
    [
        ([ACTION_A], [], "exactly one trigger node, found 0"),
        ([TRIGGER, dict(TRIGGER, id="t2"), ACTION_A], [{"source": "t", "target": "a"}], "exactly one trigger node, found 2"),
        ([TRIGGER], [], "at least one action node"),
        ([TRIGGER, ACTION_A], [{"source": "t", "target": "missing"}], "references unknown node(s): missing"),
        ([TRIGGER, ACTION_A, dict(ACTION_A)], [{"source": "t", "target": "a"}], "duplicate node ids: a"),
    ],
)
def test_structural_problems_are_rejected(nodes, edges, message):
    with pytest.raises(ValidationError, match=re.escape(message)):
        WorkflowDefinition(**_v2(nodes, edges))


def test_unknown_trigger_or_action_type_is_rejected():
    with pytest.raises(ValidationError):
        WorkflowDefinition(**_v2([dict(TRIGGER, type="fax")], []))
    with pytest.raises(ValidationError):
        WorkflowDefinition(**_v2([TRIGGER, dict(ACTION_A, type="fax")], [{"source": "t", "target": "a"}]))


def test_validate_graph_reports_every_problem_at_once():
    with pytest.raises(ValueError) as info:
        validate_graph([ACTION_A], [{"source": "a", "target": "zzz"}])
    message = str(info.value)
    assert "exactly one trigger" in message and "unknown node(s): zzz" in message


def test_topological_order_raises_on_cycle():
    with pytest.raises(ValueError, match="cycle"):
        topological_order(["x", "y"], [("x", "y"), ("y", "x")])


# ── Migration from schema v1 ──

V1 = {
    "trigger": {"type": "trello", "config": {"board": "b1"}},
    "conditions": [{"field": "label", "operator": "equals", "value": "urgent"}],
    "actions": [
        {"type": "slack", "config": {"message": "first"}},
        {"type": "http", "config": {"url": "https://example.com", "method": "POST"}},
    ],
}


def test_v1_definition_upgrades_to_a_chain():
    upgraded = migrate_definition(V1)
    assert upgraded["schema_version"] == 2
    assert [n["id"] for n in upgraded["nodes"]] == ["trigger", "condition-0", "action-0", "action-1"]
    assert upgraded["edges"] == [
        {"source": "trigger", "target": "condition-0"},
        {"source": "condition-0", "target": "action-0"},
        {"source": "action-0", "target": "action-1"},
    ]


def test_v1_definition_loads_with_the_same_trigger_conditions_and_action_order():
    definition = WorkflowDefinition(**V1)
    assert definition.trigger == Trigger(type="trello", config={"board": "b1"})
    assert definition.conditions == [Condition(field="label", operator="equals", value="urgent")]
    assert [a.config.get("message") or a.config.get("url") for a in definition.actions] == ["first", "https://example.com"]


def test_v2_definition_is_left_unchanged_by_migration():
    v2 = _v2([TRIGGER, ACTION_A], [{"source": "t", "target": "a"}])
    assert migrate_definition(v2) == v2


def test_find_trigger_reads_either_version():
    assert find_trigger(V1) == {"type": "trello", "config": {"board": "b1"}}
    assert find_trigger(_v2([TRIGGER, ACTION_A], [{"source": "t", "target": "a"}])) == {"type": "trello", "config": {}}
    assert find_trigger({}) == {}


def test_parts_builder_matches_v1_upgrade():
    built = WorkflowDefinition.from_parts(
        trigger=Trigger(**V1["trigger"]),
        conditions=[Condition(**c) for c in V1["conditions"]],
        actions=[Action(**a) for a in V1["actions"]],
    )
    assert built.model_dump() == WorkflowDefinition(**V1).model_dump()


def test_upgraded_v1_workflow_still_executes_its_actions_in_order(monkeypatch):
    executed = []

    async def fake_execute(self, action):
        executed.append(action.config.get("message") or action.config.get("url"))
        return "ok"

    monkeypatch.setattr(runner_service.WorkflowRunner, "_execute_action", fake_execute)
    monkeypatch.setattr(runner_service.log_service, "create_log", lambda **kwargs: kwargs)
    monkeypatch.setattr(runner_service.workflow_service, "increment_run_count", lambda workflow_id: None)

    asyncio.run(runner_service.runner.run("wf", "name", WorkflowDefinition(**V1)))
    assert executed == ["first", "https://example.com"]


def test_manual_run_blocks_a_stored_invalid_graph(monkeypatch):
    from fastapi.testclient import TestClient

    from app.api.routes import workflows as workflows_route
    from app.core.deps import get_current_user
    from app.main import app

    cyclic = _v2(
        [TRIGGER, ACTION_A, ACTION_B],
        [{"source": "t", "target": "a"}, {"source": "a", "target": "b"}, {"source": "b", "target": "a"}],
    )
    monkeypatch.setattr(
        workflows_route.workflow_service,
        "get_by_id",
        lambda workflow_id, user_id: {"name": "broken", "definition": cyclic},
    )
    app.dependency_overrides[get_current_user] = lambda: {"id": "user-1"}
    try:
        response = TestClient(app).post("/api/workflows/wf-1/run")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422
    assert "cycle" in response.json()["detail"]


# ── Review follow-ups ──

def _condition_graph(config):
    return _v2(
        [TRIGGER, {"id": "c", "kind": "condition", "type": None, "config": config}, ACTION_A],
        [{"source": "t", "target": "c"}, {"source": "c", "target": "a"}],
    )


@pytest.mark.parametrize("config", [
    {"field": "label", "operator": "equals"},
    {"field": "label", "operator": "equals", "value": None},
    {"field": "label", "operator": "equals", "value": ["x"]},
    {"operator": "equals", "value": "x"},
])
def test_condition_without_a_valid_value_or_fields_is_rejected(config):
    with pytest.raises(ValidationError, match="condition node c"):
        WorkflowDefinition(**_condition_graph(config))


def test_condition_with_number_or_boolean_value_is_accepted():
    definition = WorkflowDefinition(**_condition_graph({"field": "count", "operator": "gt", "value": 3}))
    assert definition.conditions[0].value == "3"
    flagged = WorkflowDefinition(**_condition_graph({"field": "done", "operator": "equals", "value": True}))
    assert flagged.conditions[0].value == "true"


def test_non_object_condition_or_action_entry_raises_value_error_on_upgrade():
    with pytest.raises(ValueError, match="condition 0 must be an object"):
        migrate_definition({"trigger": {"type": "trello"}, "conditions": ["x"], "actions": []})
    with pytest.raises(ValueError, match="action 0 must be an object"):
        migrate_definition({"trigger": {"type": "trello"}, "actions": ["x"]})


def test_large_graph_validates_and_reports_duplicates_once():
    count = 3000
    nodes = [TRIGGER] + [{"id": f"a{i}", "kind": "action", "type": "http", "config": {}} for i in range(count)]
    edges = [{"source": "t", "target": "a0"}] + [{"source": f"a{i}", "target": f"a{i + 1}"} for i in range(count - 1)]
    WorkflowDefinition(**_v2(nodes, edges))

    with pytest.raises(ValueError) as info:
        validate_graph(nodes + [dict(nodes[1]), dict(nodes[1])], edges)
    assert str(info.value).count("duplicate node ids: a0") == 1


def test_list_still_returns_other_workflows_when_one_definition_is_malformed():
    from app.services.workflow_service import WorkflowService

    dev_user = "00000000-0000-0000-0000-000000000000"
    good = {"id": "good", "name": "ok", "definition": V1, "updated_at": "2026-01-02"}
    bad = {"id": "bad", "name": "broken", "definition": {"trigger": {"type": "trello"}, "actions": ["x"]}, "updated_at": "2026-01-01"}
    WorkflowService._dev_workflows.update({"good": good, "bad": bad})
    try:
        rows = WorkflowService().get_all(dev_user)
    finally:
        WorkflowService._dev_workflows.clear()

    assert [row["id"] for row in rows] == ["good", "bad"]
    assert rows[0]["definition"]["schema_version"] == 2
    assert rows[1]["definition"] == bad["definition"]


def test_scheduler_startup_enrolls_other_schedules_when_one_row_is_malformed(monkeypatch):
    from unittest.mock import MagicMock

    from app.scheduler import scheduler

    rows = [
        {"id": "bad", "name": "broken", "definition": {"trigger": {"type": "schedule"}, "actions": ["x"]}},
        {"id": "good", "name": "daily", "definition": {
            "trigger": {"type": "schedule", "config": {"cron": "0 9 * * *"}},
            "actions": [{"type": "http", "config": {}}],
        }},
    ]
    fake_supabase = MagicMock()
    fake_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=rows)
    scheduled = []
    monkeypatch.setattr(scheduler, "supabase", fake_supabase)
    monkeypatch.setattr(scheduler, "add_workflow_job", lambda wf_id, name, cron, definition: scheduled.append(wf_id))
    monkeypatch.setattr(scheduler, "_scheduler", MagicMock())

    scheduler.start()
    assert scheduled == ["good"]
