# ROADMAP.md

> **Current Phase**: 6 (Settings Page)
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
**Status**: ✅ Complete
**Objective**: Wire DashboardHome to real workflow data (list, stats, recent activity).
**Depends on**: Phase 2
**Files**: `src/pages/DashboardHome.tsx`

### Phase 4: Workflow Builder
**Status**: ✅ Complete
**Objective**: Wire WorkflowBuilder to NLP parse endpoint, render React Flow nodes from API response, implement workflow CRUD (create, update, delete, activate, pause, run).
**Depends on**: Phase 3
**Files**: `src/pages/WorkflowBuilder.tsx`, `src/components/nodes/`

### Phase 5: Logs Page
**Status**: ✅ Complete
**Objective**: Wire LogsPage to real execution log data with filters, pagination, and detail view.
**Depends on**: Phase 3
**Files**: `src/pages/LogsPage.tsx`

### Phase 6: Settings Page
**Status**: ✅ Complete
**Objective**: Wire SettingsPage to profile update, password change, and notification preferences endpoints.
**Depends on**: Phase 2
**Files**: `src/pages/SettingsPage.tsx`

### Phase 7: Phase 6 Verification (Settings UI)
**Status**: ✅ Complete
**Objective**: Complete browser-based UI verification for Profile updates and Notification toggles.
**Depends on**: Phase 6
**Files**: `src/pages/SettingsPage.tsx`

### Phase 8: Expanded Integrations & Advanced Parser
**Status**: ✅ Complete
**Objective**: Develop backend support for additional integrations (e.g., Notion, Google Sheets, Trello, Airtable) and upgrade the NLP Parser to map single-prompts directly to these workflows.
**Depends on**: Phase 4
**Files**: `backend/app/services/integration_service.py`, `backend/app/nlp/parser.py`

### Phase 9: Integrations Page
**Status**: ⬜ Not Started
**Objective**: Create Integrations page for the expanded set of integrations (Option B: Dynamic modal component where fields change per type) and wire to backend REST endpoints. Using `react-hook-form` for state management.
**Depends on**: Phase 8
**Files**: `src/pages/IntegrationsPage.tsx` [NEW], `src/pages/integrations/*` [NEW]

### Phase 10: UX Polish
**Status**: ⬜ Not Started
**Objective**: Add loading skeletons, toast notifications, error boundaries, form validation across all pages.
**Depends on**: Phases 3–9

### Phase 11: NLP Parser Improvements (Future)
**Status**: ⬜ Not Started
**Objective**: Continue improving NLP parser accuracy for multi-step chained workflows.
**Depends on**: Phase 8
**Files**: `backend/app/nlp/parser.py`

### Phase 12: Milestone 1.0 Gap Closure
**Status**: ⬜ Not Started
**Objective**: Address verification and documentation gaps from Milestone 1.0 Audit.

**Gaps to Close:**
- [x] [Gap-1] Formalize Phase 4 Gap Verification (nlInput loading)
- [x] [Gap-2] Complete Phase 6 browser verification (Settings UI interactions)
- [ ] [Gap-3] Document recent React Flow component fixes
- [ ] [Gap-4] Verify Supabase session persistence across different browser pages
