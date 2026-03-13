---
phase: 5
plan: responsiveness-polish
wave: 1
gap_closure: false
---

# Plan 5: Responsive Design Polish

## Problem
The application currently targets desktop users primarily. Layout elements like the sidebar and the workflow canvas need to be optimized for smaller screen sizes.

## Tasks

<task type="auto">
  <name>Polish Responsive Layout</name>
  <files>
    frontend/src/pages/DashboardLayout.tsx
    frontend/src/pages/IntegrationsPage.tsx
    frontend/src/pages/WorkflowBuilder.tsx
  </files>
  <action>
    Fix layout breakpoints and responsive behavior.
    
    Steps:
    1. Implement a collapsible/mobile-friendly sidebar in `DashboardLayout.tsx`.
    2. Ensure the `IntegrationsPage` grid reflows correctly on mobile.
    3. Add "Export to Image" or better scaling for the `WorkflowBuilder` canvas on smaller screens.
    4. Test and fix card stacking across all dashboard pages.
  </action>
  <verify>
    Use Chrome DevTools to verify layout at 375px, 768px, and 1440px.
  </verify>
</task>
