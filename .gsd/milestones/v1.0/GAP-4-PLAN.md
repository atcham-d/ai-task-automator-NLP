---
phase: 11
plan: fix-gap-4
wave: 1
gap_closure: true
---

# Fix: [Gap-4] Verify Supabase Session Persistence

## Problem
With the implementation of the development auth bypass, we need to ensure that the session (both real and mock) persists correctly when navigating between pages or refreshing the browser, and that ProtectedRoutes behave predictably.

## Root Cause
Auth systems are inherently stateful and edge cases in persistence often arise after adding bypass logic.

## Tasks

<task type="browser">
  <name>Verify Session Persistence</name>
  <files>
    - frontend/src/context/AuthContext.tsx
    - frontend/src/lib/api.ts
  </files>
  <action>Perform a browser test logging in via bypass, refreshing the page, navigating from Dashboard to Settings and back, and verifying the user remains authenticated with the correct token.</action>
  <verify>Capture browser success recording or logs showing session survival after refresh.</verify>
  <done>Persistence confirmed across refresh and navigation.</done>
</task>
