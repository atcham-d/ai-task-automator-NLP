# ROADMAP.md

> **Current Phase**: 3 (NLP Parser)
> **Milestone**: v2.0 — Production Hardening + Feature Depth
> **Goal**: Improving NLP accuracy for complex chains, securing platform credentials, and polishing UX for production readiness.

## Must-Haves (Milestone 2.0)

- [ ] AES-256 field-level encryption for secrets (Integrations/SMTP)
- [x] Verified session persistence under real Supabase credentials
- [ ] NLP Parser chained action support
- [ ] Memoization for large graphs (React Flow)
- [ ] Desktop/Mobile/Tablet responsiveness polish

## Phases (Milestone 2.0)

### Phase 1: Security Hardening (Secret Management)
**Status**: ✅ Complete
**Objective**: Design and implement encryption for SMTP passwords and integration API keys.
**Files**: `backend/app/services/integration_service.py`, `backend/app/core/security.py`, `backend/app/core/config.py`
**Approach**: AES-256 field-level encryption on backend before Supabase write. Key management via Fernet.
**Priority**: 🔴 High — blocks real user onboarding (execute first)

### Phase 2: Session Persistence Verification
**Status**: ✅ Complete
**Objective**: Verify Supabase session hydration across tabs and page refresh under real credentials.
**Files**: `frontend/src/context/AuthContext.tsx`, `frontend/src/components/ProtectedRoute.tsx`
**Approach**: Confirm `onAuthStateChange` hydration and `ProtectedRoute` loading guards. No manual localStorage writes.
**Priority**: 🟡 Medium

## Milestone 2.0 — Remaining Phases (Revised Priority)

### Phase 3: NLP Parser Improvements
**Status**: IN PROGRESS
**Priority**: Complete this week

### Phase 4: Responsive Design Polish  
**Status**: Not Started
**Priority**: Must complete before publish
**Scope**: Sidebar collapse mobile, IntegrationsPage grid reflow, DashboardHome card stacking, WorkflowBuilder canvas on tablet
**Breakpoints**: 375px (mobile), 768px (tablet), 1440px (desktop)

### Phase 5: Google OAuth Setup
**Status**: Not Started  
**Priority**: Must complete before publish
**Scope**: Add Client ID + Secret to Supabase Dashboard, test OAuth flow end-to-end, verify redirect back to /dashboard

### Phase 6: Production Deploy
**Status**: Not Started
**Priority**: Hard blocker for open source publication
**Scope**:
  - Frontend → Vercel
  - Backend → Render (env vars: all rotated secrets)
  - Custom domain (optional but recommended)
  - End-to-end smoke test on production URL
  - Verify ENCRYPTION_KEY + SUPABASE keys in Render env

### Phase 7: README + Demo Assets
**Status**: Not Started
**Priority**: Hard blocker for open source publication
**Scope**:
  - README.md: what FlowAI is, self-hosting instructions, stack overview, screenshot, live demo link
  - Demo GIF: NLP prompt → canvas auto-generation
  - Framing: "Open-source visual workflow automation with natural language input. Self-hostable alternative to Zapier/Make."
  - Add CONTRIBUTING.md and LICENSE

---

---

## Completed Milestones

- [v1.0 — Full Frontend-Backend Integration](file:///Users/disha/Documents/program files/ai-task-automator-NLP/.gsd/milestones/v1.0-SUMMARY.md)
