AGENTS.md — Agent Execution Rules

Project

AI Task Automator (NLP Workflow Builder)

Architecture

Frontend
	•	React
	•	TypeScript
	•	Tailwind
	•	React Flow

Backend
	•	FastAPI
	•	Python
	•	NLP workflow parser

Database
	•	Supabase

⸻

Agent Roles

GSD Planner

Responsible for generating execution plans.

Inputs:
	•	PRD.md
	•	ROADMAP.md
	•	STATE.md

Outputs:
	•	PLAN.md files inside .gsd/phases/{phase}/plans/

⸻

Ralph Loop (Executor)

Ralph is the primary execution agent.

Responsibilities:
	1.	Read PLAN.md
	2.	Execute <task> blocks sequentially
	3.	Modify code when required
	4.	Run validation commands
	5.	Stop when task completes

Ralph must never create new plans.

⸻

Claude Debug Agent

Claude handles debugging when validation fails.

Trigger conditions:
	•	TypeScript compilation fails
	•	runtime errors occur
	•	API integration mismatches

Steps:
	1.	Analyze error logs
	2.	Identify minimal fix
	3.	Apply patch
	4.	Re-run validation

Rules:
	•	modify only necessary files
	•	preserve UI styling
	•	avoid unrelated changes
    
Execution Flow    
GSD → PLAN.md
        ↓
/execute orchestrator
        ↓
Ralph executes tasks
        ↓
Validation
        ↓
Claude Debug Agent
        ↓
Commit

Validation Rules

After every change run:

tsc --noEmit
Also run:
npm run lint
npm run build
Project Rules
	•	Do not modify unrelated files
	•	Preserve existing UI styling
	•	Ensure TypeScript compiles
	•	Follow ROADMAP phase structure

    Phase Execution

Current phase is defined in:

.gsd/STATE.md

Each phase has:

.gsd/phases/{phase}/PLAN.md

.gsd/phases/{phase}/VERIFICATION.md


