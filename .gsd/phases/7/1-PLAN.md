---
phase: 7
plan: 1
wave: 3
---

# Plan 7.1: Create IntegrationsPage and Wire to API

## Objective
Create a new IntegrationsPage.tsx that lets users manage service integrations (Slack, Discord, SMTP, Webhook). Wire to integrations CRUD + test endpoints.

## Context
- `src/pages/` — no IntegrationsPage exists yet (NEW file)
- `src/App.tsx` — needs new route added
- `src/components/Sidebar.tsx` — needs nav link added
- `backend/app/api/routes/integrations.py` — GET list, POST create, GET/:id, PATCH/:id, DELETE/:id, POST/:id/test
- `backend/app/schemas/integration.py` — IntegrationCreate, IntegrationUpdate

## Tasks

<task type="auto">
  <name>Read integration schemas and match existing page patterns</name>
  <files>backend/app/schemas/integration.py, backend/app/api/routes/integrations.py, src/pages/SettingsPage.tsx</files>
  <action>
    Read integration API to understand CRUD shape.
    Read SettingsPage as a reference for consistent page styling patterns.
  </action>
  <verify>File contents reviewed</verify>
  <done>Integration API shape and UI patterns understood</done>
</task>

<task type="auto">
  <name>Create IntegrationsPage.tsx</name>
  <files>src/pages/IntegrationsPage.tsx [NEW]</files>
  <action>
    1. Create IntegrationsPage.tsx following existing page patterns
    2. List integrations with cards (GET /api/integrations/)
    3. Add "New Integration" form (POST /api/integrations/)
    4. Edit/delete individual integrations (PATCH, DELETE)
    5. "Test Connection" button (POST /api/integrations/:id/test)
    6. Support types: slack, discord, webhook, smtp
    7. Use same Tailwind dark theme as other pages
    8. Add loading/error/empty states
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>IntegrationsPage renders, all CRUD operations work</done>
</task>

<task type="auto">
  <name>Add route and sidebar link</name>
  <files>src/App.tsx, src/components/Sidebar.tsx</files>
  <action>
    1. In App.tsx: import IntegrationsPage, add Route path="integrations" under /dashboard
    2. In Sidebar.tsx: add "Integrations" nav link with plug/connection icon
    - Match existing route/sidebar patterns exactly
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>IntegrationsPage accessible from sidebar navigation</done>
</task>

## Success Criteria
- [ ] IntegrationsPage.tsx exists and renders
- [ ] CRUD operations work (create, list, edit, delete)
- [ ] "Test Connection" calls test endpoint
- [ ] Route added to App.tsx
- [ ] Nav link added to Sidebar.tsx
- [ ] `tsc --noEmit` passes
