# Architecture & Implementation Decisions

## Phase 1: Security Hardening

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
