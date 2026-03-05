---
phase: 9
plan: 1
wave: 5
---

# Plan 9.1: NLP Parser Improvements (Backend Only)

## Objective
Improve the rule-based NLP parser to handle more complex multi-step workflow descriptions with better accuracy.

## Context
- `backend/app/nlp/parser.py` — current regex-based parser
- Parser handles: schedule triggers, email triggers, webhook triggers
- Parser detects: Slack, Discord, email, HTTP actions
- Known gaps: multi-action workflows, complex conditions, time parsing edge cases

## Tasks

<task type="auto">
  <name>Analyze current parser limitations</name>
  <files>backend/app/nlp/parser.py</files>
  <action>
    Read parser.py and identify:
    - Edge cases that fail (e.g., "every Tuesday and Thursday at 3pm")
    - Missing patterns (e.g., "if...then...else", conditional branching)
    - Time parsing gaps (e.g., "3:30pm", "noon", "midnight")
    - Multi-action parsing accuracy
  </action>
  <verify>File reviewed</verify>
  <done>List of specific improvements documented</done>
</task>

<task type="auto">
  <name>Improve parser patterns</name>
  <files>backend/app/nlp/parser.py</files>
  <action>
    1. Improve time parsing (_parse_time_to_hour): handle "noon", "midnight", "3:30pm"
    2. Improve day-of-week: handle "Tuesday and Thursday", multi-day lists
    3. Add better multi-action detection (e.g., "...and also send an email")
    4. Improve condition parsing for natural phrasing
    5. Add message extraction for multi-platform (e.g., "send 'X' to Slack and Discord")
    - Do NOT change the function signatures or return types
    - Keep backward compatibility with existing patterns
  </action>
  <verify>cd backend && source venv/bin/activate && python -c "from app.nlp.parser import parse_nl_to_workflow; result = parse_nl_to_workflow('Every Tuesday at 3pm, send a Slack message to #general'); print(result)"</verify>
  <done>Parser handles complex multi-step descriptions more accurately</done>
</task>

## Success Criteria
- [ ] Time strings like "noon", "midnight", "3:30pm" parse correctly
- [ ] Multi-day schedules ("Tuesday and Thursday") work
- [ ] Multi-action workflows detected in single prompt
- [ ] Existing test cases still pass (backward compat)
- [ ] Server starts without errors
