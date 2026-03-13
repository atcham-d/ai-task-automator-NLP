# ROADMAP.md

> **Current Phase**: 0 (Planning)
> **Milestone**: v2.0 — Production Hardening + Feature Depth
> **Goal**: Improving NLP accuracy for complex chains, securing platform credentials, and polishing UX for production readiness.

## Must-Haves (Milestone 2.0)

- [ ] AES-256 field-level encryption for secrets (Integrations/SMTP)
- [ ] Verified session persistence under real Supabase credentials
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
**Status**: ⬜ Not Started
**Objective**: Verify Supabase session hydration across tabs and page refresh under real credentials.
**Files**: `frontend/src/context/AuthContext.tsx`, `frontend/src/components/ProtectedRoute.tsx`
**Approach**: Confirm `onAuthStateChange` hydration and `ProtectedRoute` loading guards. No manual localStorage writes.
**Priority**: 🟡 Medium

### Phase 3: NLP Parser Improvements
**Status**: ⬜ Not Started
**Objective**: Improve NLP parser accuracy for multi-step chained workflows.
**Files**: `backend/app/nlp/parser.py`
**Approach**: Update prompt/parsing for better node dependency recognition.

### Phase 4: Performance Optimization
**Status**: ⬜ Not Started
**Objective**: Memoize components and optimize re-renders in React Flow.
**Files**: `frontend/src/pages/WorkflowBuilder.tsx`, `frontend/src/components/FlowNodes/*.tsx`

### Phase 5: Responsive Design Polish
**Status**: ⬜ Not Started
**Objective**: Audit and fix layout breakpoints across all pages for mobile and tablet.
**Files**: `frontend/src/pages/*.tsx`, `frontend/src/components/*.tsx`
**Key targets**: Sidebar collapse, canvas scaling, grid reflow, card stacking.

---

## Completed Milestones

---

## Completed Milestones

- [v1.0 — Full Frontend-Backend Integration](file:///Users/disha/Documents/program files/ai-task-automator-NLP/.gsd/milestones/v1.0-SUMMARY.md)
