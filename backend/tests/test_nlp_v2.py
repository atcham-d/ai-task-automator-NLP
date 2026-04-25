import sys
from typing import List

import pathlib

# Add backend to path robustly
backend_dir = pathlib.Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from app.nlp.parser import parse_nl_to_workflow
from app.models.workflow import ActionType, TriggerType

@pytest.mark.parametrize("tc", [
    {
        "id": "TC1",
        "input": "If status is error then send slack else send email",
        "expected": {
            "trigger": TriggerType.WEBHOOK, # Default if not specified
            "has_condition": True,
            "actions": [ActionType.SLACK, ActionType.EMAIL],
            "branches": ["yes", "no"]
        }
    },
    {
        "id": "TC2",
        "input": "Notify me on discord and post to notion when form is submitted",
        "expected": {
            "trigger": TriggerType.WEBHOOK,
            "has_condition": False,
            "actions": [ActionType.DISCORD, ActionType.NOTION],
            "branches": [None, None]
        }
    },
    {
        "id": "TC3",
        "input": "When a card is created in Trello, add a row to sheets and notify slack",
        "expected": {
            "trigger": TriggerType.TRELLO,
            "has_condition": False,
            "actions": [ActionType.SHEETS, ActionType.SLACK],
            "branches": [None, None]
        }
    }
])
def test_parser(tc):
    print(f"\n[{tc['id']}] Input: \"{tc['input']}\"")
    result = parse_nl_to_workflow(tc['input'])
    
    # Basic validation
    actual_actions = [a.type for a in result.actions]
    actual_branches = [a.config.get("condition_branch") for a in result.actions]
    actual_has_condition = len(result.conditions) > 0
    
    print(f"  Result Actions: {actual_actions}")
    print(f"  Result Branches: {actual_branches}")
    
    # Assertions for pytest
    assert actual_actions == tc['expected']['actions'], f"TC {tc['id']} Actions mismatch"
    assert actual_has_condition == tc['expected']['has_condition'], f"TC {tc['id']} Condition mismatch"
    assert actual_branches == tc['expected']['branches'], f"TC {tc['id']} Branches mismatch"
    assert result.trigger.type == tc['expected']['trigger'], f"TC {tc['id']} Trigger mismatch"

if __name__ == "__main__":
    pytest.main([__file__])
