---
phase: 2
plan: session-persistence
wave: 1
gap_closure: false
---

# Plan 2: Session Persistence

## Problem
While basic auth works, the edge case of session persistence across all pages under real Supabase conditions needs more rigorous verification. Supabase sessions might not persist correctly across different browser pages or after a hard refresh.

## Pre-conditions
- Supabase email rate limit must not be active.
- Use existing test account (stored in `.gsd/test-credentials.md`).
- If rate-limited: wait 1 hour, or manually confirm in Supabase Dashboard → Authentication → Users.
- **Do NOT** create new accounts during live-check.

## Tasks

<task type="auto">
  <name>Verify and Fix Session Persistence</name>
  <files>
    frontend/src/context/AuthContext.tsx
    frontend/src/components/ProtectedRoute.tsx
  </files>
  <action>
    Refine the auth hydration logic.
    
    Steps:
    1. Verify `onAuthStateChange` correctly hydrating session on page load in `AuthContext.tsx`.
    2. Confirm `ProtectedRoute` waits for loading state before redirecting.
    3. Ensure no manual `localStorage` token writes are present (let Supabase handle it).
    4. Confirm loading guard `if (loading) return <Spinner />` in `ProtectedRoute.tsx` comes before session check.
  </action>
  <verify>
    Verify by starting the frontend and logging in. Open a new tab and ensure the user remains logged in.
  </verify>
  <done>
    User session persists seamlessly across tabs, routes, and hard refreshes without unexpected redirects.
  </done>
</task>
