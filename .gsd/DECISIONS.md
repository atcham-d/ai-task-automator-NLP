# DECISIONS.md — Architecture Decision Records

> Started: 2026-03-05

## Phase 9 Decisions

**Date:** 2026-03-07

### Scope
- Implementing UI for 6 integration types: Trello, Notion, Sheets, Airtable, Webhook, and SMTP.
- The Integrations Page will feature a hybrid layout: a grid to add new integrations and a list displaying currently active ones.

### Approach
- Chose: Option B (Dynamic Modal)
- Reason: User prefers a single page where the configuration fields change dynamically inside a modal based on the selected integration type.
- Form Management: Using `react-hook-form` for cleaner state management and built-in validation of the dynamic schema.

### Constraints
- Must securely manage sensitive form state on the client side before submission.
