---
phase: 4
plan: 1
wave: 2
---

# Plan 4.1: Wire WorkflowBuilder — NLP Parse + React Flow + CRUD

## Objective
Replace the static `sampleJSON` in WorkflowBuilder.tsx with real NLP parsing via POST `/api/parse`, render React Flow nodes from the parsed WorkflowDefinition, and wire up workflow create/update/delete/activate/pause/run actions.

## Context
- `src/pages/WorkflowBuilder.tsx` — currently uses sampleJSON
- `src/lib/api.ts` — apiGet, apiPost, apiPatch, apiDelete
- `src/components/nodes/` — TriggerNode, ConditionNode, ActionNode, AnimatedEdge
- `backend/app/api/routes/parse.py` — POST `/api/parse` (text → WorkflowDefinition)
- `backend/app/api/routes/workflows.py` — full CRUD + activate/pause/run
- `backend/app/schemas/workflow.py` — WorkflowCreate, WorkflowResponse

## Tasks

<task type="auto">
  <name>Read all target files</name>
  <files>src/pages/WorkflowBuilder.tsx, backend/app/api/routes/parse.py, backend/app/schemas/workflow.py</files>
  <action>
    Read each file to understand:
    - Current sampleJSON structure and how React Flow nodes are built
    - Parse endpoint request/response format
    - WorkflowCreate/WorkflowResponse fields
  </action>
  <verify>File contents reviewed</verify>
  <done>Full understanding of current vs target state</done>
</task>

<task type="auto">
  <name>Wire NLP parse and CRUD</name>
  <files>src/pages/WorkflowBuilder.tsx</files>
  <action>
    1. Import apiGet, apiPost, apiPatch, apiDelete from '../lib/api'
    2. Remove sampleJSON
    3. Add "Parse" button handler: POST /api/parse with { text: userInput }
    4. Convert WorkflowDefinition response to React Flow nodes/edges
    5. Add save button: POST /api/workflows/ (create) or PATCH /api/workflows/:id (update)
    6. If editing existing workflow (route param :id), load with GET /api/workflows/:id
    7. Add activate/pause/run buttons wired to respective endpoints
    8. Add loading and error states
    - Do NOT change React Flow node components
    - Do NOT change Tailwind CSS classes
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>WorkflowBuilder creates/edits real workflows via API, zero TypeScript errors</done>
</task>

## Success Criteria
- [ ] NL text input calls POST /api/parse and renders result as React Flow nodes
- [ ] Workflows can be saved (create new or update existing)
- [ ] Workflow activate/pause/run buttons work
- [ ] Editing existing workflow loads from API via route param
- [ ] `tsc --noEmit` passes
