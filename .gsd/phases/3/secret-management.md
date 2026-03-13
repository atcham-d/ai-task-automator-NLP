---
phase: 3
plan: secret-management
wave: 1
gap_closure: false
---

# Plan 3: Secret Management

## Problem
SMTP and Integration secrets are currently handled as plain strings in the config. A structured security approach is needed before moving to multi-user or production scaling.

## Root Cause
Early development focus prioritized functionality over security for service credentials. Secrets are stored in plain text rather than encrypted at rest or fetched from a secure vault.

## Migration Strategy
**Option A: Wipe and re-save.**
- DELETE all rows from `integrations` table before deploying encryption.
- Simplest and safest for prototype phase.

## Tasks

<task type="auto">
  <name>Implement Secure Secret Management</name>
  <files>
    backend/app/services/integration_service.py
    backend/app/core/config.py
    backend/.env
    .gitignore
  </files>
  <action>
    Implement AES-256 field-level encryption.
    
    Steps:
    1. Generate key: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`.
    2. Store as `ENCRYPTION_KEY` in `backend/.env`.
    3. Update `backend/app/core/config.py` to include `encryption_key: str`.
    4. Ensure `.gitignore` ignores `backend/.env`.
    5. Update `integration_service.py` to encrypt/decrypt using the key.
    6. Wipe `integrations` table rows.
  </action>
  <verify>
    Run backend test suite to confirm integrations can still be mock-tested. Check database to ensure secrets are stored encrypted.
  </verify>
  <done>
    All integration secrets are securely encrypted at rest, and the backend can successfully decrypt them in memory when executing integrations.
  </done>
</task>
