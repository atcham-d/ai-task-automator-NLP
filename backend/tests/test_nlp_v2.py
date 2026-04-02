import sys
import os
from typing import List

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.nlp.parser import parse_nl_to_workflow
from app.models.workflow import ActionType, TriggerType

def test_parser():
    test_cases = [
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
                "trigger": TriggerType.WEBHOOK, # Trello logic to be implemented
                "has_condition": False,
                "actions": [ActionType.SHEETS, ActionType.SLACK],
                "branches": [None, None]
            }
        }
    ]

    print("\n--- NLP PARSER V2 REGRESSION TESTS ---\n")
    
    passed = 0
    for tc in test_cases:
        print(f"[{tc['id']}] Input: \"{tc['input']}\"")
        try:
            result = parse_nl_to_workflow(tc['input'])
            
            # Basic validation
            actual_actions = [a.type for a in result.actions]
            actual_branches = [a.config.get("condition_branch") for a in result.actions]
            actual_has_condition = len(result.conditions) > 0
            
            print(f"  Result Actions: {actual_actions}")
            print(f"  Result Branches: {actual_branches}")
            
            # Check expectations
            match_actions = actual_actions == tc['expected']['actions']
            match_condition = actual_has_condition == tc['expected']['has_condition']
            
            if match_actions and match_condition:
                print("  ✅ PASSED")
                passed += 1
            else:
                print("  ❌ FAILED")
                if not match_actions: print(f"    Expected Actions: {tc['expected']['actions']}")
                if not match_condition: print(f"    Expected Condition: {tc['expected']['has_condition']}")
                
        except Exception as e:
            print(f"  💥 ERROR: {str(e)}")
        print("-" * 40)

    print(f"\nSummary: {passed}/{len(test_cases)} Passed")

if __name__ == "__main__":
    test_parser()
