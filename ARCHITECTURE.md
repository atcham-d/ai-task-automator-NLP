# Architecture: FlowAI (ai-task-automator-NLP)

This document provides a high-level overview of the FlowAI repository structure, technology stack, and component interactions.

## 1. High-Level Architecture

FlowAI is a modern monolithic application with a decoupled frontend and backend. The application parses Natural Language into executable logic flows and provides an interactive UI to monitor, edit, and orchestrate them.

**Core Pillars:**
- **Frontend (Client):** A React SPA built with Vite. It features a drag-and-drop workflow canvas, AI-prompt input panels, and authentication gates.
- **Backend (API):** A FastAPI service handling NLP parsing, webhook ingestion, workflow execution, scheduling, and third-party integrations.
- **Database/Auth:** Supabase serves as the primary authentication provider (JWT) and persistent database.

## 2. Directory Structure

```text
/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/routes/       # API View/Controllers (auth, workflows, parse, webhooks, etc.)
│   │   ├── core/             # Configuration (Pydantic settings) and security
│   │   ├── models/           # Database Models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic (Integrations, Webhook Handling, NLP Parsing)
│   │   ├── nlp/              # AI/NLP specific orchestration and parsing logic
│   │   └── scheduler/        # APScheduler for executing cron-based workflows
│   ├── scripts/              # Infrastructure and webhook sync scripts
│   ├── tests/                # Pytest suites
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React Application
│   ├── src/
│   │   ├── assets/           # Static media
│   │   ├── components/       # Reusable UI (Stitch UI components, ReactFlow Nodes, Modals)
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── lib/              # Utilities and API clients
│   │   ├── pages/            # View components (WorkflowBuilder, LandingPage, Dashboard, etc.)
│   │   └── types/            # TypeScript interfaces
│   ├── package.json          # Node dependencies
│   └── index.css             # Tailwind and global variables
│
├── supabase/                 # Supabase configuration (Edge Functions, migrations, etc.)
├── docs/                     # Project documentation
├── .gsd/                     # Development workflow tracking and phases
└── .agent/                   # Custom agent workflows and skills
```

## 3. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4, Framer Motion
- **UI Components:** "Stitch UI" semantic design system (custom dynamic shadows, floating navs)
- **Canvas / Node Graph:** `xyflow/react` (React Flow)
- **Form Validation:** React Hook Form + Zod
- **API/Data:** `supabase-js`, `lucide-react`

### Backend
- **Framework:** FastAPI + Uvicorn
- **Validation:** Pydantic v2
- **Auth/Security:** `python-jose`, `passlib[bcrypt]`, `cryptography`
- **Background Tasks:** `apscheduler`
- **Client/Requests:** `httpx`

### Infrastructure
- **Database & Identity:** Supabase (PostgreSQL + GoTrue)
- **Containerization:** Docker (`Dockerfile` in `/backend`)
- **Package Management:** `npm` (Frontend), `pip` (Backend)

## 4. Key Data Flows

1. **Natural Language Parsing**: 
   - User types a prompt via `NlInputPanel.tsx`.
   - Frontend posts to `backend/app/api/routes/parse.py`.
   - Backend processes the AI instruction and returns a JSON schema mapping to `ReactFlow` nodes.
   - The `<WorkflowBuilder>` re-renders the Canvas dynamically.

2. **Authentication Flow**:
   - Supabase handles user signup/login natively in `SignupPage.tsx` and `LoginPage.tsx`.
   - JWT tokens are preserved in session and securely passed to the FastAPI backend via Authorization headers.

3. **Background Execution**:
   - Active workflow logic runs in the background using `apscheduler` (`backend/app/scheduler/`).
   - Third-party data endpoints are pushed directly into `backend/app/api/routes/webhooks.py`, verified using HMAC-SHA1 signatures, and trigger corresponding workflow steps.

## 5. Known Design Patterns
- **Semantic UI Variables**: Frontend relies heavily on semantic, layered CSS variables (EtherealShadows) to provide premium aesthetics.
- **Factory/Service Pattern**: Backend uses a service layer (`services/`) to encapsulate external service requests and decouple API routes from database queries.
