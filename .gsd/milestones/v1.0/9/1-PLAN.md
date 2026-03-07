---
phase: 9
plan: 1
wave: 1
---

# Plan 9.1: Integrations Data Layer & Dependencies

## Objective
Set up the necessary frontend dependencies, API methods, and type-safe Zod schema definitions required for the new Integrations UI, ensuring we have a solid data layer before building the UI components.

## Context
- .gsd/ROADMAP.md
- .gsd/phases/9/RESEARCH.md
- frontend/src/lib/api.ts

## Tasks

<task type="auto">
  <name>Install Form Dependencies</name>
  <files>frontend/package.json</files>
  <action>
    - Run `npm install react-hook-form zod @hookform/resolvers` in the `frontend` directory.
    - These are required for the dynamic Option B form approach mapped out in research.
  </action>
  <verify>cat frontend/package.json | grep react-hook-form</verify>
  <done>Dependencies installed successfully</done>
</task>

<task type="auto">
  <name>Define Integration Schemas</name>
  <files>frontend/src/lib/integrationSchemas.ts</files>
  <action>
    - Create `frontend/src/lib/integrationSchemas.ts`.
    - Import `z` from `zod`.
    - Define a `const INTEGRATION_SCHEMAS` object mapping the 6 integration types (`webhook`, `smtp`, `trello`, `notion`, `sheets`, `airtable`) to their respective dynamic Zod schemas (as defined in `RESEARCH.md`).
    - Export `IntegrationType` and an array of `AVAILABLE_INTEGRATIONS` containing metadata (name, description, icon name) for the UI grid.
  </action>
  <verify>tsc --noEmit</verify>
  <done>Zod schemas and types correspond exactly to the backend required configs.</done>
</task>

<task type="auto">
  <name>Add API Methods</name>
  <files>frontend/src/lib/api.ts</files>
  <action>
    - Export new typings: `Integration` interface matching the backend schema (id, user_id, type, name, config, is_active).
    - Add API methods using the existing `apiFetch` wrapper:
      - `getIntegrations()` -> GET `/api/integrations/`
      - `createIntegration(data)` -> POST `/api/integrations/`
      - `updateIntegration(id, data)` -> PATCH `/api/integrations/{id}`
      - `deleteIntegration(id)` -> DELETE `/api/integrations/{id}`
      - `testIntegration(id)` -> POST `/api/integrations/{id}/test`
  </action>
  <verify>tsc --noEmit</verify>
  <done>API methods are strongly typed and use the central `apiFetch` setup.</done>
</task>

## Success Criteria
- [ ] `react-hook-form` and `zod` are installed in the frontend.
- [ ] `integrationSchemas.ts` provides complete validation logic for all 6 active types.
- [ ] `api.ts` fully supports the `/api/integrations/` CRUD endpoints.
- [ ] `tsc --noEmit` passes with 0 errors.
