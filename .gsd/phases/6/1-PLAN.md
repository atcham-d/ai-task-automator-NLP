---
phase: 6
plan: 1
wave: 2
---

# Plan 6.1: Wire SettingsPage to Profile, Password, and Notifications APIs

## Objective
Wire the static SettingsPage.tsx to real backend endpoints for profile update, password change, and notification preferences.

## Context
- `src/pages/SettingsPage.tsx` — static UI shell (no API calls)
- `src/lib/api.ts` — apiGet, apiPost, apiPatch
- `backend/app/api/routes/profile.py` — GET/PATCH /api/profile/me, POST change-password, GET/PATCH notifications, DELETE account
- `backend/app/schemas/profile.py` — ProfileUpdate, NotificationPrefsUpdate

## Tasks

<task type="auto">
  <name>Read SettingsPage.tsx and profile schemas</name>
  <files>src/pages/SettingsPage.tsx, backend/app/schemas/profile.py, backend/app/api/routes/profile.py</files>
  <action>
    Read files to understand:
    - Current UI form fields (profile, password, notification toggles)
    - API endpoints and request/response shapes
    - What the settings page sections are
  </action>
  <verify>File contents reviewed</verify>
  <done>Mapped UI fields to API endpoints</done>
</task>

<task type="auto">
  <name>Wire settings to API</name>
  <files>src/pages/SettingsPage.tsx</files>
  <action>
    1. Import apiGet, apiPatch, apiPost, apiDelete from '../lib/api'
    2. On mount: fetch profile (GET /api/profile/me) and notifications (GET /api/profile/notifications)
    3. Wire "Save Profile" to PATCH /api/profile/me
    4. Wire "Change Password" to POST /api/profile/change-password
    5. Wire notification toggles to PATCH /api/profile/notifications
    6. Wire "Delete Account" to DELETE /api/profile/account (with confirmation dialog)
    7. Add loading states, success/error toasts
    - Do NOT change Tailwind CSS classes or layout
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>All settings sections save to real API, zero TypeScript errors</done>
</task>

## Success Criteria
- [ ] Profile loads on mount from API
- [ ] Profile updates persist
- [ ] Password change works
- [ ] Notification toggles save
- [ ] Delete account with confirmation
- [ ] `tsc --noEmit` passes
