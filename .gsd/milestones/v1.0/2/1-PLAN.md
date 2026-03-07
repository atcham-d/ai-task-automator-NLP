---
phase: 2
plan: 1
wave: 1
status: COMPLETE
---

# Plan 2.1: Wire Auth Pages (Already Complete)

## Objective
Wire LoginPage, SignupPage, and AuthCallback to real backend API.

## Status: ✅ COMPLETE
All auth pages already call `useAuth()` from AuthContext:
- `LoginPage.tsx` — calls `login(email, password)` and `googleSignIn()`
- `SignupPage.tsx` — calls `signup(email, password, name)` and `googleSignIn()`
- `AuthCallback.tsx` — listens for `SIGNED_IN` event, redirects to `/dashboard`

## Verification
- `tsc --noEmit` passes with zero errors ✓
- Login/signup forms call real `/api/auth/login` and `/api/auth/signup` endpoints ✓
