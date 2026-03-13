# Phase 9 Research: Dynamic Modal Form with `react-hook-form`

## Context
Phase 9 objective is to build an integrations page with a grid/list layout. Clicking an integration should open a modal with a dynamic form. We will use `react-hook-form` combined with `zod` validation. The integration types are: `slack`, `discord`, `webhook`, `smtp`, `trello`, `notion`, `sheets`, `airtable`.
We are building UI for 6 of them: `trello`, `notion`, `sheets`, `airtable`, `webhook`, and `smtp`.

## Implementation Approach
Instead of 6 distinct files with forms, we will define a single `IntegrationModal` component.

1. **Schemas Definition**:
   Create a centralized mapping of integration types to their Zod schemas to ensure type-safe validation before submitting to the backend.

```typescript
import { z } from 'zod';

export const INTEGRATION_SCHEMAS = {
  webhook: z.object({ url: z.string().url() }),
  smtp: z.object({
    host: z.string().min(1),
    port: z.number().int().positive(),
    user: z.string().min(1),
    password: z.string().min(1)
  }),
  trello: z.object({
    api_key: z.string().min(1),
    api_token: z.string().min(1),
    board_id: z.string().min(1),
    list_id: z.string().min(1)
  }),
  notion: z.object({
    database_id: z.string().min(1),
    internal_integration_token: z.string().min(1)
  }),
  sheets: z.object({
    spreadsheet_id: z.string().min(1),
    api_key: z.string().min(1)
  }),
  airtable: z.object({
    base_id: z.string().min(1),
    table_name: z.string().min(1),
    personal_access_token: z.string().min(1)
  })
} as const;

export type IntegrationType = keyof typeof INTEGRATION_SCHEMAS;
```

2. **React Hook Form Hookup**:
   We will pass the selected schema to the generic `zodResolver`. Based on the selected integration type, `Object.keys()` of the schema shape can be used to dynamically render the corresponding input fields, avoiding repetitive layout code.

3. **Secret Obfuscation**:
   API responses from the backend might include existing configuration data. Passwords and tokens should either be hidden or visually masked on the client. We will implement basic input `type="password"` for any keys ending in `password`, `key`, or `token`.

## API Interactions
- **GET** `/api/integrations` — fetch existing connected integrations
- **POST** `/api/integrations` — save a new integration configuration
- **PUT/PATCH** `/api/integrations/{id}` — update an existing configuration
- **DELETE** `/api/integrations/{id}` — remove an integration

## Conclusion
The dynamic modal approach with `react-hook-form` and `zod` is highly effective here. It minimizes code duplication and keeps validation robust. We will create two main components for this phase: `IntegrationsPage.tsx` and `IntegrationModal.tsx`.
