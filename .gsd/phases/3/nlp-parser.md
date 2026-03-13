---
phase: 3
plan: nlp-parser
wave: 1
gap_closure: false
---

# Plan 3: NLP Parser Improvements

## Problem
The current NLP parser occasionally fails to correctly identify dependencies and parameters in complex, multi-step (chained) action requests.

## Tasks

<task type="auto">
  <name>Enhance NLP Parser Depth</name>
  <files>
    backend/app/nlp/parser.py
  </files>
  <action>
    Update the prompt and parsing logic to improve accuracy for chained workflows.
    
    Steps:
    1. Refine the system prompt in `parser.py` to provide better examples of chained actions.
    2. Improve dependency graph generation logic.
    3. Add test cases to `backend/test_parser.py` for complex chains.
  </action>
  <verify>
    Run `pytest backend/test_parser.py` and verify all chained action tests pass.
  </verify>
</task>
