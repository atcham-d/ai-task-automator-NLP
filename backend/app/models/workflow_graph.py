"""Pure helpers for the schema-v2 workflow graph: upgrade, ordering and validation.

These functions work on plain dicts so they can run on rows read from storage
as well as on validated models, without importing either.
"""

from collections import Counter, deque
from typing import Dict, Iterable, List, Tuple

SCHEMA_VERSION = 2
TRIGGER_KIND = "trigger"
ACTION_KIND = "action"
CONDITION_KIND = "condition"


def migrate_definition(raw: dict) -> dict:
    """Upgrade a schema-v1 definition (trigger, conditions, actions) to schema v2.

    Each v1 list becomes a single chain of edges: trigger, then conditions, then actions.
    Anything that is not a v1 definition is returned unchanged for validation to judge.
    """
    if not isinstance(raw, dict) or "nodes" in raw or "trigger" not in raw:
        return raw

    trigger = raw.get("trigger") or {}
    nodes = [{
        "id": "trigger",
        "kind": TRIGGER_KIND,
        "type": trigger.get("type"),
        "config": dict(trigger.get("config") or {}),
    }]
    edges: List[dict] = []
    previous = "trigger"

    for index, condition in enumerate(raw.get("conditions") or []):
        if not isinstance(condition, dict):
            raise ValueError(f"condition {index} must be an object")
        node_id = f"condition-{index}"
        nodes.append({"id": node_id, "kind": CONDITION_KIND, "type": None, "config": dict(condition)})
        edges.append({"source": previous, "target": node_id})
        previous = node_id

    for index, action in enumerate(raw.get("actions") or []):
        if not isinstance(action, dict):
            raise ValueError(f"action {index} must be an object")
        node_id = f"action-{index}"
        nodes.append({
            "id": node_id,
            "kind": ACTION_KIND,
            "type": action.get("type"),
            "config": dict(action.get("config") or {}),
        })
        edges.append({"source": previous, "target": node_id})
        previous = node_id

    return {"schema_version": SCHEMA_VERSION, "nodes": nodes, "edges": edges}


def find_trigger(raw: dict) -> dict:
    """Return the trigger's {type, config} from a stored definition of either schema version."""
    upgraded = migrate_definition(raw) if isinstance(raw, dict) else {}
    for node in upgraded.get("nodes") or []:
        if node.get("kind") == TRIGGER_KIND:
            return {"type": node.get("type"), "config": node.get("config") or {}}
    return {}


def topological_order(node_ids: Iterable[str], edges: Iterable[Tuple[str, str]]) -> List[str]:
    """Order nodes so every edge goes forward. Ties keep the input order.

    Raises ValueError if the edges form a cycle.
    """
    ids = list(node_ids)
    indegree: Dict[str, int] = {node_id: 0 for node_id in ids}
    children: Dict[str, List[str]] = {node_id: [] for node_id in ids}
    for source, target in edges:
        children[source].append(target)
        indegree[target] += 1

    queue = deque(node_id for node_id in ids if indegree[node_id] == 0)
    order: List[str] = []
    while queue:
        current = queue.popleft()
        order.append(current)
        for child in children[current]:
            indegree[child] -= 1
            if indegree[child] == 0:
                queue.append(child)

    if len(order) != len(ids):
        placed = set(order)
        stuck = sorted(str(node_id) for node_id in ids if node_id not in placed)
        raise ValueError(f"Workflow graph contains a cycle involving nodes: {', '.join(stuck)}")
    return order


def validate_graph(nodes: List[dict], edges: List[dict]) -> None:
    """Check a schema-v2 graph. Raises ValueError with every problem found.

    Rules: unique node ids; edges point at existing nodes; exactly one trigger;
    at least one action; no cycles; every node reachable from the trigger.
    """
    problems: List[str] = []

    ids = [node.get("id") for node in nodes]
    counts = Counter(ids)
    duplicates = sorted(str(node_id) for node_id, count in counts.items() if count > 1)
    if duplicates:
        problems.append(f"duplicate node ids: {', '.join(duplicates)}")

    known = set(ids)
    pairs: List[Tuple[str, str]] = []
    for edge in edges:
        source, target = edge.get("source"), edge.get("target")
        missing = [end for end in (source, target) if end not in known]
        if missing:
            problems.append(f"edge {source} -> {target} references unknown node(s): {', '.join(map(str, missing))}")
        else:
            pairs.append((source, target))

    triggers = [node.get("id") for node in nodes if node.get("kind") == TRIGGER_KIND]
    if len(triggers) != 1:
        problems.append(f"workflow must have exactly one trigger node, found {len(triggers)}")

    if not any(node.get("kind") == ACTION_KIND for node in nodes):
        problems.append("workflow must have at least one action node")

    try:
        topological_order(ids, pairs)
    except ValueError as exc:
        problems.append(str(exc))

    if len(triggers) == 1:
        reachable = _reachable(triggers[0], pairs)
        orphans = sorted(str(node_id) for node_id in known if node_id not in reachable)
        if orphans:
            problems.append(f"nodes not reachable from the trigger: {', '.join(orphans)}")

    if problems:
        raise ValueError("; ".join(problems))


def _reachable(start: str, pairs: List[Tuple[str, str]]) -> set:
    children: Dict[str, List[str]] = {}
    for source, target in pairs:
        children.setdefault(source, []).append(target)
    seen = {start}
    queue = deque([start])
    while queue:
        for child in children.get(queue.popleft(), []):
            if child not in seen:
                seen.add(child)
                queue.append(child)
    return seen
