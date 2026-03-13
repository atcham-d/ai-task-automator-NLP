import { z } from 'zod';

export const INTEGRATION_SCHEMAS = {
    webhook: z.object({
        name: z.string().min(1, 'Name is required').default('My Webhook'),
        url: z.string().url('Must be a valid URL'),
    }),
    smtp: z.object({
        name: z.string().min(1, 'Name is required').default('My SMTP'),
        host: z.string().min(1, 'Host is required'),
        port: z.coerce.number().int().positive('Port must be a positive number'),
        user: z.string().min(1, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
    }),
    trello: z.object({
        name: z.string().min(1, 'Name is required').default('My Trello'),
        api_key: z.string().min(1, 'API Key is required'),
        api_token: z.string().min(1, 'API Token is required'),
        board_id: z.string().min(1, 'Board ID is required'),
        list_id: z.string().min(1, 'List ID is required'),
    }),
    notion: z.object({
        name: z.string().min(1, 'Name is required').default('My Notion'),
        database_id: z.string().min(1, 'Database ID is required'),
        internal_integration_token: z.string().min(1, 'Integration Token is required'),
    }),
    sheets: z.object({
        name: z.string().min(1, 'Name is required').default('My Sheets'),
        spreadsheet_id: z.string().min(1, 'Spreadsheet ID is required'),
        api_key: z.string().min(1, 'API Key is required'),
    }),
    airtable: z.object({
        name: z.string().min(1, 'Name is required').default('My Airtable'),
        base_id: z.string().min(1, 'Base ID is required'),
        table_name: z.string().min(1, 'Table Name is required'),
        personal_access_token: z.string().min(1, 'Access Token is required'),
    }),
} as const;

export type IntegrationType = keyof typeof INTEGRATION_SCHEMAS;

export interface AvailableIntegration {
    type: IntegrationType;
    name: string;
    description: string;
    icon_name: string;
}

export const AVAILABLE_INTEGRATIONS: AvailableIntegration[] = [
    {
        type: 'webhook',
        name: 'Webhooks',
        description: 'Trigger external HTTP endpoints dynamically.',
        icon_name: 'Globe',
    },
    {
        type: 'smtp',
        name: 'SMTP Email',
        description: 'Send custom emails via your private SMTP server.',
        icon_name: 'Mail',
    },
    {
        type: 'trello',
        name: 'Trello',
        description: 'Create cards and manage boards automatically.',
        icon_name: 'Trello',
    },
    {
        type: 'notion',
        name: 'Notion',
        description: 'Add pages and sync data into Notion databases.',
        icon_name: 'FileText',
    },
    {
        type: 'sheets',
        name: 'Google Sheets',
        description: 'Append rows to spreadsheets dynamically.',
        icon_name: 'Table',
    },
    {
        type: 'airtable',
        name: 'Airtable',
        description: 'Create records in Airtable bases.',
        icon_name: 'Database',
    },
];
