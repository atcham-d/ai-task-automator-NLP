---
phase: 9
plan: 3
wave: 2
---

# Plan 9.3: Integrations Page & Grid Layout

## Objective
Build the main `IntegrationsPage` which lists actively connected integrations and provides a grid of available integrations that clicking will open the dynamic `IntegrationModal`. Add the route to `App.tsx`.

## Context
- .gsd/ROADMAP.md
- frontend/src/lib/integrationSchemas.ts
- frontend/src/components/IntegrationModal.tsx

## Tasks

<task type="auto">
  <name>Create Integrations Page</name>
  <files>frontend/src/pages/IntegrationsPage.tsx</files>
  <action>
    - Create `IntegrationsPage.tsx`.
    - Fetch active integrations using `api.getIntegrations()`. Handle loading/error states.
    - Render a Top Section: "Configured Integrations" (list of active integrations fetched from backend). Includes an Edit button (opens Modal in update mode) and Delete button.
    - Render a Bottom Section: "Available Integrations" (grid using `AVAILABLE_INTEGRATIONS` from `integrationSchemas.ts`).
    - Clicking an available integration opens `IntegrationModal` in create mode with the selected `IntegrationType`.
    - Upon Modal success, refresh the active integrations list.
  </action>
  <verify>tsc --noEmit</verify>
  <done>IntegrationsPage correctly displays active and available integrations and toggles the Modal state.</done>
</task>

<task type="auto">
  <name>Add Route to App.tsx</name>
  <files>frontend/src/App.tsx</files>
  <action>
    - Import `IntegrationsPage`.
    - Add `<Route path="/dashboard/integrations" element={<IntegrationsPage />} />` under the `<DashboardLayout>` routes.
  </action>
  <verify>tsc --noEmit</verify>
  <done>The route is correctly mapped and accessible inside the authenticated layout.</done>
</task>

<task type="checkpoint:human-verify">
  <name>UI Verification Check</name>
  <action>
    Ask the user to start the frontend server (`npm run dev`) and visit `/dashboard/integrations`.
    Verify that the page renders without errors, the Zod modal opens on clicking a grid item, and the user can successfully "Add" a mock integration (using the DEV BYPASS logic we set up), verifying it appears in the Active list.
  </action>
</task>

## Success Criteria
- [ ] Users can navigate to `/dashboard/integrations`.
- [ ] They see both their active integrations and a grid of available ones.
- [ ] Clicking an available integration opens the right dynamic modal.
- [ ] Completing the form connects the integration to the backend.
