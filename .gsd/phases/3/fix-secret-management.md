---
phase: 3
plan: fix-secret-management
wave: 1
gap_closure: true
---

# Fix: Secret Management

## Problem
SMTP and Integration secrets are currently handled as plain strings in the config. A structured security approach is needed before moving to multi-user or production scaling.

## Root Cause
Early development focus prioritized functionality over security for service credentials. Secrets are stored in plain text rather than encrypted at rest or fetched from a secure vault.

## Tasks

<task type="auto">
  <name>Implement Secure Secret Management</name>
  <files>
    backend/app/services/integration_service.py
    backend/app/config.py
  </files>
  <action>
    Design and implement a structured security approach for managing integration credentials. Ensure secrets are encrypted at rest or utilize Supabase Vault/KMS equivalent.
    
    Steps:
    1. Research Supabase Vault or Python-based encryption libraries (e.g., `cryptography.fernet`).
    2. Update `integration_service.py` to encrypt credentials before saving to the database and decrypt them when needed in memory.
    3. Remove any hardcoded plain text secrets from configuration files.
  </action>
  <verify>
    Run backend test suite to confirm integrations can still be mock-tested. Check database to ensure secrets are stored encrypted.
  </verify>
  <done>
    All integration secrets are securely encrypted at rest, and the backend can successfully decrypt them in memory when executing integrations.
  </done>
</task>
