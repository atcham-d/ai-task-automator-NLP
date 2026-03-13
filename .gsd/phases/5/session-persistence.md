---
phase: 5
plan: session-persistence
wave: 1
gap_closure: false
---

# Plan 5: Session Persistence

## Problem
While basic auth works, the edge case of session persistence across all pages under real Supabase conditions needs more rigorous verification. Supabase sessions might not persist correctly across different browser pages or after a hard refresh.

## Root Cause
Potential missing hydration logic in the `AuthContext` or improper setup of cookies/local storage for session tokens.

## Pre-conditions
- Supabase email rate limit must not be active.
- Use existing test account (stored in `.gsd/test-credentials.md`).
- If rate-limited: wait 1 hour, or use Supabase Dashboard to manually confirm a new account.
- **Do NOT** create new accounts during live-check.

## Tasks

<task type="auto">
  <name>Fix Supabase Session Persistence</name>
  <files>
    frontend/src/context/AuthContext.tsx
    frontend/src/App.tsx
  </files>
  <action>
    Review the `AuthContext` implementation to ensure `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange()` are correctly used to hydrate and maintain the user's session state on initial load. Ensure that the updated session is stored appropriately and persists across hard refreshes.
    
    Steps:
    1. Verify current `AuthContext` logic for session initialization.
    2. Add necessary checks for `onAuthStateChange` to keep context up to date.
    3. Ensure protected routes correctly await session initialization before redirecting.
  </action>
  <verify>
    Verify by starting the frontend and logging in. Open a new tab and ensure the user remains logged in.
  </verify>
  <done>
    User session persists seamlessly across tabs, routes, and hard refreshes without unexpected redirects.
  </done>
</task>
