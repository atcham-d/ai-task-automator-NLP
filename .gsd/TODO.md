# TODO.md — Pending Items

> Started: 2026-03-05

- [ ] Confirm if React Flow components should be memoized to prevent re-renders on large graphs
- [ ] Determine how to handle SMTP passwords and similar secure configurations (Vault, KMS, or encrypted columns in Supabase)
- [ ] Verify Supabase session persistence across different browser pages `medium` — 2026-03-07
- [ ] Plan milestone 2 `medium` — 2026-03-11
- [ ] Enable and configure Google OAuth in Supabase Dashboard (Client ID & Secret). Status: Verified Blocker (400 Unsupported Provider) `high` — 2026-03-17
- [ ] Resolve merge conflicts in PR #1 (security.py + integration_service.py). Merge PR #1 into main after conflicts resolved. Ensure main branch is clean before production deploy. `high` — 2026-03-23
- [ ] Resolve PR #1 merge conflicts — security.py and integration_service.py conflict with docstrings PR. Fix locally: git checkout milestone-2.0, git merge ralph-loop-ehnb1, resolve conflicts, push. `medium` — 2026-03-23
- [ ] Add ENCRYPTION_KEY, SUPABASE_KEY, SUPABASE_JWT_SECRET, SECRET_KEY to Render environment variables before production deploy. `medium` — 2026-03-23
- [ ] Create .env.example for both backend and frontend with placeholder values before publishing repo. `medium` — 2026-03-23
- [ ] Record demo GIF: type NLP prompt → show canvas auto-generating nodes. Keep under 30 seconds. `medium` — 2026-03-23
