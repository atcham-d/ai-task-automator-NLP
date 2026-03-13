---
phase: 1
plan: security-management
wave: 1
gap_closure: false
---

# Plan 1: Security Hardening (Secret Management)

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
    5. Update `app/core/security.py` with:
       ```python
       from cryptography.fernet import Fernet
       from app.core.config import settings

       def encrypt_secret(plaintext: str) -> str:
           f = Fernet(settings.encryption_key.encode())
           return f.encrypt(plaintext.encode()).decode()

       def decrypt_secret(ciphertext: str) -> str:
           f = Fernet(settings.encryption_key.encode())
           return f.decrypt(ciphertext.encode()).decode()
       ```
    6. Update `integration_service.py` to use `encrypt_secret` on write and `decrypt_secret` on read, using:
       ```python
       def is_secret_field(key: str) -> bool:
           return any(s in key.lower() for s in ['password', 'token', 'key', 'secret'])
       ```
    7. Wipe `integrations` table rows.
  </action>
  <verify>
    Check database to ensure secrets are stored encrypted:
    `SELECT id, type, config FROM integrations LIMIT 1;` 
    (Expected: "gAAAAABl..." values for secrets, not plaintext).
  </verify>
  <done>
    All integration secrets are securely encrypted at rest, and the backend can successfully decrypt them in memory when executing integrations.
  </done>
</task>
