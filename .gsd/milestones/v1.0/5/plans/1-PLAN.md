---
phase: 5
plan: 1
wave: 2
---

# Plan 5.1: Wire LogsPage to Real Execution Logs

## Objective
Replace `mockLogs` in LogsPage.tsx with real API calls to GET `/api/logs`. Wire filters (workflow, status) and pagination.

## Context
- `src/pages/LogsPage.tsx` — currently uses mockLogs array
- `src/lib/api.ts` — apiGet
- `backend/app/api/routes/logs.py` — GET `/api/logs?workflow_id=&status=&limit=&offset=`
- `backend/app/schemas/log.py` — LogResponse schema

## Tasks

<task type="auto">
  <name>Read LogsPage.tsx and backend log schema</name>
  <files>src/pages/LogsPage.tsx, backend/app/schemas/log.py</files>
  <action>
    Read both files to understand:
    - Current mockLogs type shape vs LogResponse fields
    - How filters and pagination work in the UI
    - Backend query params (workflow_id, status, limit, offset)
  </action>
  <verify>File contents reviewed</verify>
  <done>Mock shape matched to API response shape</done>
</task>

<task type="auto">
  <name>Replace mock data with API calls</name>
  <files>src/pages/LogsPage.tsx</files>
  <action>
    1. Import apiGet from '../lib/api'
    2. Remove mockLogs array
    3. Add useEffect to fetch logs: apiGet('/api/logs')
    4. Wire filter dropdowns to refetch with query params
    5. Implement pagination (offset-based)
    6. Add loading spinner and error state
    7. Handle empty state (no logs yet)
    - Do NOT change Tailwind CSS classes
    - Do NOT change table/card layout structure
  </action>
  <verify>npm run lint && npx tsc --noEmit && npm run build</verify>
  <done>LogsPage displays real execution logs, filters work, zero TypeScript errors</done>
</task>

## Success Criteria
- [ ] No mockLogs array in LogsPage.tsx
- [ ] Logs fetched from GET /api/logs
- [ ] Status and workflow filters trigger refetch
- [ ] Pagination works
- [ ] `tsc --noEmit` passes
