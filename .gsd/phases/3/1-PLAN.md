---
phase: 3
plan: 1
wave: 2
---

# Plan 3.1: Wire DashboardHome to Real Workflow Data

## Objective
Replace `mockWorkflows` in DashboardHome.tsx with real API calls to fetch the user's workflows. Display real stats (total workflows, active count, total runs).

## Context
- `.gsd/ARCHITECTURE.md` — API route: GET `/api/workflows/`
- `src/lib/api.ts` — apiGet, apiPost helpers
- `src/pages/DashboardHome.tsx` — currently uses mockWorkflows array
- `backend/app/api/routes/workflows.py` — returns WorkflowResponse[]
- `backend/app/schemas/workflow.py` — WorkflowResponse schema

## Tasks

<task type="auto">
  <name>Read existing DashboardHome.tsx and backend WorkflowResponse schema</name>
  <files>src/pages/DashboardHome.tsx, backend/app/schemas/workflow.py</files>
  <action>
    Read both files completely to understand:
    - Current mockWorkflows type shape
    - WorkflowResponse fields from backend
    - How the UI renders workflows (card layout, status badges, etc.)
  </action>
  <verify>File contents reviewed</verify>
  <done>Full understanding of current mock shape vs API response shape</done>
</task>

<task type="auto">
  <name>Replace mock data with API calls</name>
  <files>src/pages/DashboardHome.tsx</files>
  <action>
    1. Import apiGet from '../lib/api'
    2. Define a TypeScript interface matching WorkflowResponse
    3. Remove mockWorkflows array
    4. Add useEffect to fetch workflows on mount: apiGet('/api/workflows/')
    5. Add useState for workflows, loading, and error states
    6. Show loading spinner while fetching
    7. Show error message if fetch fails
    8. Compute real stats from API data (total, active, sum of run_count)
    - Do NOT change any Tailwind CSS classes or visual layout
    - Do NOT change component structure — only data source
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>DashboardHome renders real workflow data from API, zero TypeScript errors</done>
</task>

<task type="checkpoint:human-verify">
  <name>Visual verification</name>
  <files>n/a</files>
  <action>Open http://localhost:5173/dashboard in browser, verify workflows load from API</action>
  <verify>Browser shows real data or empty state (no mock data visible)</verify>
  <done>Dashboard displays live data from backend</done>
</task>

## Success Criteria
- [ ] No mockWorkflows array in DashboardHome.tsx
- [ ] Workflows fetched from GET /api/workflows/
- [ ] Loading state shown while fetching
- [ ] Error state shown on failure
- [ ] Stats computed from real data
- [ ] `tsc --noEmit` passes
