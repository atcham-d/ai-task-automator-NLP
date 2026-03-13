---
description: # /ask-claude — Ask Claude When Stuck on an Error
---

# /ask-claude — Ask Claude When Stuck on an Error

> Workflow: Consult Claude AI for error diagnosis and fix strategy
> Trigger: Use when /debug fails after 3 attempts or error is unfamiliar

---

<process>

## Step 1 — Capture Full Error Context

Before asking Claude, collect:

1. The exact error message (full stack trace, not summarized)
2. The file name and line number
3. What was being attempted when the error occurred
4. What fixes have already been tried (from /debug attempts)
5. Relevant code snippet (the function or block, not the whole file)

Format the context like this:

```
ERROR: [exact error message]
FILE: [filename:line]
ATTEMPTING: [what task was being executed]
ALREADY TRIED:
  - [fix attempt 1]
  - [fix attempt 2]
  - [fix attempt 3]
CODE SNIPPET:
  [relevant 10-30 lines only]
```

---

## Step 2 — Query Claude via API

Send the formatted context to Claude with this system prompt:

```
You are a senior engineer debugging a React + TypeScript + FastAPI project.
The stack is:
- Frontend: React 18, TypeScript, Tailwind CSS, React Flow, Vite
- Backend: FastAPI, Supabase, Python 3.11
- Auth: Supabase JWT via AuthContext

Rules for your response:
1. Diagnose the ROOT CAUSE first — not just the symptom
2. Give ONE specific fix — not multiple options
3. Show the exact code change — diff format preferred
4. Explain why this fixes it in one sentence
5. Give one command to verify the fix worked
```

Then append the error context from Step 1.

---

## Step 3 — Apply the Fix

1. Read the file Claude identified — search for the specific line first
2. Apply ONLY the change Claude suggested — nothing else
3. Do not refactor or improve surrounding code
4. Save the file

---

## Step 4 — Verify the Fix

Run the verification command Claude provided.

For frontend errors:
```bash
cd frontend && npx tsc --noEmit
```

For backend errors:
```bash
cd backend && source venv/bin/activate && python -m pytest
```

For runtime errors:
```bash
# Restart the server and reproduce the original action
uvicorn app.main:app --reload
```

---

## Step 5 — Document in STATE.md

Add this entry to .gsd/STATE.md under a "Resolved Errors" section:

```markdown
## Resolved Errors

### [date] — [error name]
- File: [filename]
- Root cause: [one line from Claude's diagnosis]
- Fix: [one line description]
- Verified by: [command and output]
```

---

## Step 6 — Resume Execution

After fix is verified:
1. Return to the task that was interrupted
2. Re-run /execute to continue from where it stopped
3. Do not restart the entire phase

---

## Escalation Rules

If Claude's fix does not resolve the error after 2 attempts:

| Attempts | Action |
|----------|--------|
| 1st fix fails | Ask Claude with MORE context — include the full file outline |
| 2nd fix fails | Run /web-search for the specific error message |
| 3rd fix fails | State dump → fresh session → /resume |
| Still failing | Isolate in a minimal reproduction → ask Claude with that |

---

## Common Error Patterns and Claude Query Templates

### TypeScript Import Error
```
ERROR: Cannot find module 'X' or its corresponding type declarations
QUERY: "In a Vite + React 18 + TypeScript project, what causes 
'Cannot find module X' and what is the exact fix including 
any required package installation or tsconfig change?"
```

### Supabase Auth Error
```
ERROR: [Supabase error message]
QUERY: "In supabase-js v2 with React AuthContext, what causes 
[error] when calling [method] and what is the exact fix?"
```

### FastAPI CORS Error
```
ERROR: CORS policy blocked
QUERY: "FastAPI with CORSMiddleware is blocking requests from 
[origin]. Current ALLOWED_ORIGINS is [value]. What is the 
exact fix including where to update and how to verify?"
```

### React Flow Node Error
```
ERROR: [React Flow error]
QUERY: "In React Flow v11 with TypeScript, what causes [error] 
when [action] and what is the exact node/edge definition fix?"
```

### Python Import Error
```
ERROR: ModuleNotFoundError: No module named 'X'
QUERY: "FastAPI project with venv at /backend/venv. Getting 
ModuleNotFoundError for X when running uvicorn from /backend. 
Exact fix including pip command and any path config needed?"
```

---

## Output Format Expected from Claude

Claude should respond in this format:

```
ROOT CAUSE:
[one sentence explaining WHY this error occurs]

FIX:
[filename]:[line range]
- Remove: [old code]
+ Add:    [new code]

WHY THIS WORKS:
[one sentence]

VERIFY WITH:
[exact command to run]
```

If Claude does not follow this format, re-prompt with:
"Respond only in the format: ROOT CAUSE / FIX (diff) / WHY / VERIFY WITH"

</process>

---

## Related Workflows

| Workflow | When to Use |
|----------|-------------|
| /debug | First 3 fix attempts — autonomous debugging |
| /ask-claude | After /debug fails — consult Claude directly |
| /web-search | After /ask-claude fails — search for known solutions |
| /pause | Before escalating — save state safely |
| /resume | After fix — continue from exact stopping point |
