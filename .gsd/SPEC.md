# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision

FlowAI is an AI-powered workflow automation platform where users describe workflows in natural language, which are parsed into structured definitions and visualized as interactive node graphs. The backend is **100% complete** with all 28 API endpoints live. The remaining work is wiring the static React frontend to the live FastAPI backend.

## Goals

1. Wire every frontend page to the live backend API (auth, workflows, logs, settings, integrations)
2. Implement real authentication flow (login, signup, Google OAuth, logout, session persistence)
3. Enable end-to-end workflow creation: NL input → parse → visualize → save → execute → view logs
4. Add UX polish (loading skeletons, toasts, error boundaries, form validation)
5. Improve NLP parser accuracy for complex workflow descriptions

## Non-Goals (Out of Scope)

- Backend API changes (already complete)
- Database schema changes (already complete)
- Mobile app
- Multi-tenant or team features
- Payment/billing integration
- Email action implementation (SMTP)

## Users

Individual users who want to automate repetitive tasks by describing them in plain English. Primary persona: non-technical users who prefer natural language over code.

## Constraints

- Frontend: React 19 + TypeScript + Tailwind CSS v4 + React Flow
- Backend: FastAPI on Python 3.14 (already deployed at localhost:8000)
- Database: Supabase Postgres (all 5 tables exist)
- Must not break existing styling
- Must pass `tsc --noEmit` after every frontend file change

## Success Criteria

- [ ] All 9 frontend pages call real backend APIs (zero mock data)
- [ ] Auth flow works end-to-end (signup → login → dashboard → logout)
- [ ] Workflows can be created via NL input, saved, activated, and run
- [ ] Execution logs display real data with filters and pagination
- [ ] Settings page updates profile, password, and notification preferences
- [ ] Zero TypeScript errors (`tsc --noEmit` passes)
- [ ] Loading and error states handled gracefully on all pages
