---
description: If the verdict is NEEDS FIXES, GSD automatically feeds the issues back into /debug and /execute to fix them before you open the PR.
---

# Live Website Check — Phase {{PHASE_NUMBER}}: {{PHASE_NAME}}

You are a QA engineer. The frontend is running at http://localhost:5173 
and the backend is running at http://localhost:8000.

Do NOT edit any code. Only observe, test, and report.

## Step 1 — Confirm Both Servers Are Running
- Check http://localhost:8000/health → must return {"status":"ok","version":"1.0.0"}
- Check http://localhost:5173 → must load without blank screen or console errors
- Open browser console → report any red errors

## Step 2 — Phase-Specific Checks

### If Phase 1 (Auth Foundation):
- Open http://localhost:5173/login → page loads, no blank screen
- Open http://localhost:5173/dashboard → redirects to /login (ProtectedRoute works)
- Check src/lib/supabase.ts exists and exports supabase client
- Check src/lib/api.ts exists and has get/post/patch/delete methods
- Check src/context/AuthContext.tsx exports useAuth hook
- Check src/components/ProtectedRoute.tsx exists
- Run: cd frontend && npx tsc --noEmit → must show zero errors

### If Phase 2 (Auth Pages):
- Open http://localhost:5173/login
  → Type wrong email/password → error message appears
  → Type correct credentials → redirects to /dashboard
- Open http://localhost:5173/signup
  → Fill form → submits → redirects to /dashboard
- In dashboard → click logout → redirects to /login
- Open http://localhost:5173/dashboard without login → redirects to /login
- Run: cd frontend && npx tsc --noEmit → zero errors

### If Phase 3 (Dashboard Home):
- Login and open http://localhost:5173/dashboard
  → Real workflow cards load (not static placeholder data)
  → Loading skeleton shows briefly before cards appear
  → If no workflows: empty state with Create button shows
- Click "New Workflow" → POST fires → navigates to /workflows/:id
- Click delete on a card → confirm dialog appears → card disappears after confirm
- Click a workflow card → navigates to /workflows/:id
- Open Network tab → confirm GET /api/workflows/ returns 200
- Run: cd frontend && npx tsc --noEmit → zero errors

### If Phase 4 (Workflow Builder):
- Open http://localhost:5173/dashboard/workflows/new
  → Canvas loads with React Flow
  → Type in NLP textarea → POST /api/parse/ fires after 600ms
  → Parsed JSON appears in preview panel
  → Nodes appear on canvas (trigger node + action nodes)
- Click Save → POST /api/workflows/ fires → URL updates to /workflows/:id
- Click Activate → POST /api/workflows/:id/activate → badge changes to "active"
- Click Run Now → POST /api/workflows/:id/run → toast appears
- Reload page with existing :id → workflow loads from GET /api/workflows/:id
- Open Network tab → confirm all API calls return 200
- Run: cd frontend && npx tsc --noEmit → zero errors

### If Phase 5 (Logs):
- Open http://localhost:5173/logs
  → Real log rows load (not static data)
  → Loading skeleton shows briefly
- Change status filter to "Failed" → table refetches with filtered results
- Select a workflow from dropdown → table filters by that workflow
- Click a log row → expands to show output/error JSON
- Click Next page → offset increases → new logs load
- Open Network tab → confirm GET /api/logs/ returns 200
- Run: cd frontend && npx tsc --noEmit → zero errors

### If Phase 6 (Settings):
- Open http://localhost:5173/settings
  → Profile form loads with real name and email from API
- Change full name → click Save → success toast appears
- Open Network tab → confirm PATCH /api/profile/ returns 200
- Fill password form with wrong current password → error message shows
- Toggle a notification switch → PATCH /api/profile/notifications fires immediately
- Run: cd frontend && npx tsc --noEmit → zero errors

### If Phase 7 (Integrations):
- Open http://localhost:5173/integrations
  → Page loads (not 404)
  → Integration cards load or empty state shows
- Click Add Integration → modal opens with type selector
- Select Slack → webhook_url field appears
- Fill form → submit → POST /api/integrations/ fires → card appears
- Click Test Connection → POST /api/integrations/:id/test → inline result shows
- Click Delete → confirm → card disappears
- Check Sidebar → Integrations link exists and is clickable
- Run: cd frontend && npx tsc --noEmit → zero errors

### If Phase 8 (UX Polish):
- Open any page → loading skeleton shows before data loads
- Trigger an error (disconnect backend) → error boundary shows, not blank screen
- Open http://localhost:5173/nonexistent → 404 page shows with Go Home button
- Submit login form empty → red validation errors appear on fields
- Resize browser to 375px width → sidebar collapses, cards stack, tables scroll
- Run: cd frontend && npx tsc --noEmit → zero errors

### If Phase 9 (NLP Improvements):
- Open http://localhost:5173/dashboard/workflows/new
- Type: "notify me on slack every day at 9am" → parsed output shows:
  → trigger.type = "schedule", trigger.config.cron = "0 9 * * *"
  → action.type = "slack"
  → confidence score present in output
- Type: "ping the discord channel every 2 hours" → cron = "0 */2 * * *"
- Type: "if status is active and role is admin send email" → 2 conditions parsed
- Run backend tests: cd backend && pytest tests/test_nlp_parser.py -v → all pass

## Step 3 — Final Report

After all checks, report exactly this format:

PHASE {{PHASE_NUMBER}} LIVE CHECK REPORT
========================================
Server status:     [PASS/FAIL]
TypeScript errors: [0 / list them]
UI loads:          [PASS/FAIL]
API calls fire:    [PASS/FAIL]
Data renders:      [PASS/FAIL]
Error states work: [PASS/FAIL]
Phase-specific:    [PASS/FAIL — list any failures]

VERDICT: [READY TO MERGE / NEEDS FIXES]

If NEEDS FIXES: list each issue as:
- File: [filename]
- Problem: [exact description]  
- Expected: [what should happen]
- Actual: [what is happening]