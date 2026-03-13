# ROADMAP.md

> **Current Phase**: 0 (Planning)
> **Milestone**: v2.0 — Production Hardening + Feature Depth
> **Goal**: Improving NLP accuracy for complex chains, securing platform credentials, and polishing UX for production readiness.

## Must-Haves (Milestone 2.0)

- [ ] NLP Parser chained action support
- [ ] Memoization for large graphs (React Flow)
- [ ] AES-256 field-level encryption for secrets (Integrations/SMTP)
- [ ] Desktop/Mobile/Tablet responsiveness polish
- [ ] Verified session persistence under real Supabase credentials

## Phases (Milestone 2.0)

### Phase 1: NLP Parser Improvements
**Status**: ⬜ Not Started
**Objective**: Improve NLP parser accuracy for multi-step chained workflows.
**Files**: `backend/app/nlp/parser.py`

### Phase 2: Performance Optimization
**Status**: ⬜ Not Started
**Objective**: Memoize components and optimize re-renders in React Flow.

### Phase 3: Secret Management
**Status**: ⬜ Not Started
**Objective**: Design and implement encryption for SMTP passwords and integration API keys.
**Files**: `backend/app/services/integration_service.py`, `backend/app/core/security.py`
**Approach**: AES-256 field-level encryption on backend before Supabase write.
**Priority**: 🔴 High — blocks real user onboarding

### Phase 4: Responsive Design Polish
**Status**: ⬜ Not Started
**Objective**: Audit and fix layout breakpoints across all pages for mobile and tablet.
**Files**: `frontend/src/pages/*.tsx`, `frontend/src/components/*.tsx`
**Key targets**:
  - Sidebar collapse on mobile (<768px)
  - WorkflowBuilder canvas on tablet
  - IntegrationsPage grid reflow
  - DashboardHome card stacking

### Phase 5: Session Persistence Verification
**Status**: ⬜ Not Started
**Objective**: Verify Supabase session hydration across tabs and page refresh under real credentials.
**Files**: `frontend/src/context/AuthContext.tsx`, `frontend/src/components/ProtectedRoute.tsx`
**Note**: Previously tested only with dev bypass — needs real Supabase account verification.
**Priority**: 🟡 Medium

---

## Completed Milestones

- [v1.0 — Full Frontend-Backend Integration](file:///Users/disha/Documents/program files/ai-task-automator-NLP/.gsd/milestones/v1.0-SUMMARY.md)
