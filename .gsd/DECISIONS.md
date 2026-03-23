# Architecture & Implementation Decisions

## Phase 1: Security Hardening
### Security Incident (2026-03-13)
- `backend/.env` containing real Supabase keys was committed to git history
- All exposed secrets were rotated immediately:
  - Supabase anon key
  - Supabase JWT secret  
  - ENCRYPTION_KEY
  - SECRET_KEY
- `.env` removed from git history via `git filter-repo`
- `.gitignore` updated to exclude all `.env` files
- `.env.example` created with placeholder values
- Render environment variables updated with rotated keys

**Date:** 2026-03-13

### Scope
- Targeted the `integrations` table for field-level encryption of sensitive fields (passwords, tokens, keys, secrets).
- Profiles and workflows currently not in scope for encryption at rest unless requested later.

### Approach
- **Fernet (AES-256)**: Chosen for field-level encryption due to simplicity and high security.
- **Pattern**: Defined centralized `encrypt_secret` and `decrypt_secret` helpers in `backend/app/core/security.py`.
- **Integrations**: Implementation in `integration_service.py` uses `is_secret_field` detection (checking for 'password', 'token', 'key', 'secret' in keys).

### Key Management
- **Key Storage**: `ENCRYPTION_KEY` stored in `backend/.env` (excluded from git).
- **Configuration**: Loaded via Pydantic `Settings` in `app/core/config.py`.

### Migration
- **Strategy**: Option A (Wipe and re-save). All existing integration records will be deleted before deploying the new encryption logic to ensure a clean state.


## Phase 2: Session Persistence Verification
**Date:** 2026-03-17
**Outcome:** ✅ PASS
**Findings:**
- **AuthContext**: `getSession()` + `onAuthStateChange` pattern confirmed correct. Hydration works on mount.
- **ProtectedRoute**: Loading guard confirmed working; no flash-to-login detected.
- **Dev Bypass**: Interference resolved by setting `ENABLE_AUTH_BYPASS=false`.
- **Notes**: Verified under real Supabase credentials. Auth failure (401) resolved via SQL password reset of `testuser@flowai.dev`.

## Phase 3: NLP Parser Improvements

**Date:** 2026-03-17

### Layout Rules (Frontend)
- **Sequential**: Vertical stack, 150px spacing.
- **Conditional**: 
  - Condition node: center.
  - Yes branch: +200px X.
  - No branch: -200px X.
  - Handles: Explicit `yes`/`no` source handles.

### Parser Logic (Backend)
- **Chaining**: Explicit support for `and`, `then`, `also` to detect multi-actions.
- **Conditionals**: Support `if-then-else` structure mapping `condition_branch` to "yes"/"no".
- **Action Matrix**: Verified against 3 core test cases (status error, mixed notifications, multi-system sync).
