---
phase: 12
plan: fix-gap-4
wave: 1
gap_closure: true
---

# Fix: Verify Supabase Session Persistence

## Problem
Supabase session persistence needs verification across different browser pages (e.g., opening a new tab after logging in) to ensure users don't have to re-authenticate unexpectedly.

## Root Cause
High reliance on the `dev@example.com` bypass and automated scripts meant multi-tab session behavior wasn't explicitly tested.

## Tasks

<task type="checkpoint:human-verify">
  <name>Verify Session Persistence in Browser</name>
  <action>
    - Ask the user to start the frontend dev server (`npm run dev`).
    - Navigate to `http://localhost:5173/login` and log in (using either real credentials or the `dev@example.com` bypass).
    - Once logged into the dashboard, open a completely new tab in the same browser.
    - Navigate to `http://localhost:5173/dashboard` in the new tab.
    - Verify that the application correctly hydrates the session from `localStorage` (or Supabase auth storage) and displays the dashboard without flashing the login screen or requiring re-authentication.
  </action>
</task>
