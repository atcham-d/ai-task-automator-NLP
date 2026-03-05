---
phase: 8
plan: 1
wave: 4
---

# Plan 8.1: UX Polish — Skeletons, Toasts, Error Boundaries, Validation

## Objective
Add loading skeletons, toast notifications for actions, error boundaries, and form validation across all pages.

## Context
- All pages from Phases 3–7 (already wired to API)
- `react-hot-toast` already installed and configured in App.tsx
- No ErrorBoundary component exists yet

## Tasks

<task type="auto">
  <name>Create ErrorBoundary component</name>
  <files>src/components/ErrorBoundary.tsx [NEW]</files>
  <action>
    1. Create class-based ErrorBoundary with dark theme fallback UI
    2. Show "Something went wrong" with retry button
    3. Match existing Tailwind dark theme
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>ErrorBoundary component exists and handles runtime errors</done>
</task>

<task type="auto">
  <name>Add skeletons and toasts to all pages</name>
  <files>src/pages/DashboardHome.tsx, src/pages/WorkflowBuilder.tsx, src/pages/LogsPage.tsx, src/pages/SettingsPage.tsx, src/pages/IntegrationsPage.tsx</files>
  <action>
    For each page:
    1. Replace simple loading spinners with animated skeleton placeholders
    2. Add toast.success() for successful actions (save, delete, activate, etc.)
    3. Add toast.error() for failed actions
    4. Add form validation (required fields, email format, password length)
    - Do NOT change existing layout or Tailwind classes
    - Use react-hot-toast which is already configured
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>All pages have polish: skeletons, toasts, validation</done>
</task>

<task type="auto">
  <name>Wrap app in ErrorBoundary</name>
  <files>src/App.tsx</files>
  <action>
    Wrap the Routes element in ErrorBoundary
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>App catches and displays runtime errors gracefully</done>
</task>

## Success Criteria
- [ ] ErrorBoundary component exists
- [ ] All pages show animated skeletons during loading
- [ ] Toast notifications on all CRUD actions
- [ ] Form validation prevents invalid submissions
- [ ] `tsc --noEmit` passes
