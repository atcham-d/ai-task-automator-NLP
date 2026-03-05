# ROADMAP.md

> **Current Phase**: 3 (Dashboard Home)
> **Milestone**: v1.0 — Full frontend-backend integration

## Must-Haves (from SPEC)

- [ ] Auth flow works end-to-end
- [ ] All pages wired to real API
- [ ] Zero TypeScript errors
- [ ] Loading/error states on all pages

## Phases

### Phase 1: Auth Foundation
**Status**: ✅ Complete
**Objective**: Set up Supabase client, api.ts, AuthContext, and ProtectedRoute so all subsequent phases have auth infrastructure.
**Files**: `src/lib/supabase.ts`, `src/lib/api.ts`, `src/context/AuthContext.tsx`, `src/components/ProtectedRoute.tsx`

### Phase 2: Auth Pages
**Status**: ✅ Complete
**Objective**: Wire LoginPage, SignupPage, AuthCallback to real API. Implement logout.
**Depends on**: Phase 1
**Files**: `src/pages/LoginPage.tsx`, `src/pages/SignupPage.tsx`, `src/pages/AuthCallback.tsx`

### Phase 3: Dashboard Home
**Status**: ⬜ Not Started
**Objective**: Wire DashboardHome to real workflow data (list, stats, recent activity).
**Depends on**: Phase 2
**Files**: `src/pages/DashboardHome.tsx`

### Phase 4: Workflow Builder
**Status**: ⬜ Not Started
**Objective**: Wire WorkflowBuilder to NLP parse endpoint, render React Flow nodes from API response, implement workflow CRUD (create, update, delete, activate, pause, run).
**Depends on**: Phase 3
**Files**: `src/pages/WorkflowBuilder.tsx`, `src/components/nodes/`

### Phase 5: Logs Page
**Status**: ⬜ Not Started
**Objective**: Wire LogsPage to real execution log data with filters, pagination, and detail view.
**Depends on**: Phase 3
**Files**: `src/pages/LogsPage.tsx`

### Phase 6: Settings Page
**Status**: ⬜ Not Started
**Objective**: Wire SettingsPage to profile update, password change, and notification preferences endpoints.
**Depends on**: Phase 2
**Files**: `src/pages/SettingsPage.tsx`

### Phase 7: Integrations Page
**Status**: ⬜ Not Started
**Objective**: Create new IntegrationsPage and wire to integrations CRUD + test endpoints.
**Depends on**: Phase 3
**Files**: `src/pages/IntegrationsPage.tsx` [NEW]

### Phase 8: UX Polish
**Status**: ⬜ Not Started
**Objective**: Add loading skeletons, toast notifications, error boundaries, form validation across all pages.
**Depends on**: Phases 3–7

### Phase 9: NLP Parser Improvements
**Status**: ⬜ Not Started
**Objective**: Improve backend NLP parser accuracy for complex multi-step workflow descriptions.
**Depends on**: Phase 4
**Files**: `backend/app/nlp/parser.py`
