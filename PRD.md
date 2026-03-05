# FlowAI — PRD for Ralph Loop

## Project
AI Workflow Automation Builder — ai-task-automator-NLP

## Stack
- Frontend: React + TypeScript + Tailwind + React Flow (STATIC — fully built)
- Backend: FastAPI at http://localhost:8000 (ALL 28 endpoints live)
- Database: Supabase (connected via MCP, all 5 tables exist)

## Current State
Backend is 100% complete. Frontend is static UI shells.
Goal: wire every frontend page to the live backend API.

## Remaining Work (in order)
Phase 1: Auth foundation (supabase client, api.ts, AuthContext, ProtectedRoute)
Phase 2: Wire LoginPage, SignupPage, AuthCallback, logout
Phase 3: Wire DashboardHome to real workflow data
Phase 4: Wire WorkflowBuilder (NLP parse, React Flow nodes, CRUD)
Phase 5: Wire LogsPage (real data, filters, pagination)
Phase 6: Wire SettingsPage (profile, password, notifications)
Phase 7: Create IntegrationsPage + wire to API
Phase 8: UX Polish (skeletons, toasts, error boundaries, validation)
Phase 9: NLP Parser improvements (backend only)

## Rules Ralph Must Follow
- Read every file before editing it
- Never break existing styling
- Run tsc --noEmit after every frontend file change
- Confirm zero TypeScript errors before moving to next task
- One atomic task at a time
