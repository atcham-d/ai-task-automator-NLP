# Phase 8: Expanded Integrations & Advanced Parser

## Objective
Add backend domain support for Notion, Google Sheets, Airtable, and Trello integrations. Upgrade the NLP parser to map single-prompts directly to these new action types.

## Proposed Changes

### [Backend] Domain Models

#### [MODIFY] [workflow.py](file:///Users/disha/Documents/program%20files/ai-task-automator-NLP/backend/app/models/workflow.py)
- Update `ActionType` enum to include:
  - `NOTION`
  - `SHEETS`
  - `AIRTABLE`
  - `TRELLO`

### [Backend] Integration Schemas

#### [MODIFY] [integration.py](file:///Users/disha/Documents/program%20files/ai-task-automator-NLP/backend/app/schemas/integration.py)
- Update `IntegrationCreate` schema comment/validation type to include the new integration types alongside slack | discord | smtp | webhook.

### [Backend] NLP Parser

#### [MODIFY] [parser.py](file:///Users/disha/Documents/program%20files/ai-task-automator-NLP/backend/app/nlp/parser.py)
- Add regex detection blocks in `_detect_actions` for the new platforms:
  - Trello (looks for "trello", "card", "board")
  - Notion (looks for "notion", "page", "database")
  - Sheets (looks for "google sheets", "spreadsheet", "row")
  - Airtable (looks for "airtable", "record", "base")
- Extend `_extract_message` or specific extraction logic if necessary.

## Verification
- Run `pytest` and specific unit tests for `parser.py` if they exist.
- Run `uvicorn` and test parser `/api/workflows/parse` endpoint using cURL for "create a trello card when I get an email".
