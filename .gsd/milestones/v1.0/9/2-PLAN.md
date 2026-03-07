---
phase: 9
plan: 2
wave: 1
---

# Plan 9.2: Dynamic Modal Component

## Objective
Build the reusable, dynamically rendering `IntegrationModal` component that consumes the `INTEGRATION_SCHEMAS` to generate form fields specific to the selected integration type.

## Context
- .gsd/ROADMAP.md
- frontend/src/lib/integrationSchemas.ts
- frontend/src/lib/api.ts

## Tasks

<task type="auto">
  <name>Create Integration Modal</name>
  <files>frontend/src/components/IntegrationModal.tsx</files>
  <action>
    - Create `IntegrationModal.tsx`.
    - Accept props: `isOpen`, `onClose`, `type` (IntegrationType), `existingIntegration` (optional), and `onSuccess` callback.
    - Use `react-hook-form` with `zodResolver(INTEGRATION_SCHEMAS[type])`.
    - Dynamically render inputs by mapping over `Object.keys(INTEGRATION_SCHEMAS[type].shape)`.
    - Obfuscate input text (`type="password"`) for any field name containing `token`, `key`, or `password`.
    - Handle Submit: call `createIntegration` or `updateIntegration` via `api.ts`.
    - Show `react-hot-toast` on success/error.
  </action>
  <verify>tsc --noEmit</verify>
  <done>Modal dynamically renders inputs based on type and calls the correct API.</done>
</task>

## Success Criteria
- [ ] Modal correctly loads the specific Zod schema using `react-hook-form`.
- [ ] Secrets (passwords/tokens) are visually obscured in the inputs.
- [ ] Submitting the form successfully queries the backend API.
- [ ] `tsc --noEmit` passes with 0 errors.
