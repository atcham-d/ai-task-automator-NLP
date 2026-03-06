# Debug Session: Phase 4 Live Check Router & Auth

## Symptom
Phase 4 `/live-check` fails because the test script attempts to navigate to `/workflows/new` (which is a 404 since it's nested under `/dashboard/workflows/new`) and the Email/Password Auth Provider is disabled in Supabase, preventing the automation subagent from creating a test user.

**When:** During automated browser UI verification.
**Expected:** The browser test script should point to the correct route and be able to authenticate.
**Actual:** Navigation hits a blank screen due to missing route, and Supabase blocks test account creation.

## Evidence
From previous `browser_subagent` execution:
1. Route `http://localhost:5173/workflows/new` gave console warning "No routes matched location".
2. Attempting to create user returned 400: `Unsupported provider: provider is not enabled`.

## Hypotheses
| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | `live-check.md` workflow has the wrong URL for Phase 4. | 100% | UNTESTED |
| 2 | Supabase project does not have Email Provider enabled. | 100% | CONFIRMED |

## Attempts

### Attempt 1
**Testing:** H1 — `live-check.md` workflow has the wrong URL.
**Action:** Edit `.agent/workflows/live-check.md` to point to `/dashboard/workflows/new`.
**Result:** URL mismatch fixed in test scripts.
**Conclusion:** CONFIRMED.

### Attempt 2
**Testing:** H2 — Supabase does not have Email Provider enabled.
**Action:** Verified from 400 error response `Unsupported provider`.
**Result:** Cannot automate auth via API without valid active provider or JWT.
**Conclusion:** CONFIRMED.

## Resolution
**Root Cause:** Deprecated route in test script & missing Email auth provider configuration.
**Fix:** Updated `.agent/workflows/live-check.md` to match app routing (`/dashboard/..`).
**Verified:** Code inspection confirms routing fix. Auth verification blocked by external configuration.
**Action Required:** User must manually enable Email Auth Provider in Supabase settings or perform manual testing via Google OAuth.

