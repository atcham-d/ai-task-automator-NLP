---
phase: 8
level: 2
researched_at: 2026-03-07
---

# Phase 8 Research: Expanded Integrations & Advanced Parser

## Questions Investigated
1. How to map Google Sheets, Notion, Airtable, and Trello into our integration schemas?
2. How does the NLP parser currently interpret tools, and how can we hook it up to interpret single-prompt creations mapping to these new integrations?

## Findings

### Topic: Integration Data Requirements
- **Google Sheets**: Requires `spreadsheet_id` and an OAuth token or Service Account credential. MVP: a generic `api_key` or `credentials_json` token field.
- **Notion**: Requires `database_id` and an `internal_integration_token`.
- **Airtable**: Requires `base_id`, `table_name`, and a `personal_access_token`.
- **Trello**: Requires `api_key` and `api_token` along with `board_id` and `list_id`.

**Recommendation**: Add these keys strictly to the backend `IntegrationType` enum and process them in `integration_service.py` exactly as we do Slack/Discord. 

### Topic: NLP Parser Upgrades
Currently, the NLP Parser (`app/nlp/parser.py`) maps phrases like "send an email" to SMTP nodes, and "post to slack" to Slack nodes. To support "Make a Trello card when a Notion page is created", the parser needs to map distinct verbs (Create, Read, Update) to distinct nodes.

**Recommendation**: We will expand `TOOL_MAPPING` in `parser.py` to include:
- `trello`: "trello", "card", "board"
- `notion`: "notion", "page", "database"
- `sheets`: "sheets", "spreadsheet", "row"
- `airtable`: "airtable", "record", "base"

## Decisions Made
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | 4 new tools | Provides sufficient complexity for the single-prompt requirement. |
| NLP Matching | Keyword heuristic | Stick to the existing keyword heuristic mapping instead of adding an LLM dependency to keep the system deterministic and fast for now. |

## Ready for Planning
- [x] Questions answered
- [x] Approach selected
- [x] Dependencies identified
