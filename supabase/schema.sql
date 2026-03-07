-- Phase 8 Migration: Add new integration types to the integrations_type_check constraint
ALTER TABLE integrations DROP CONSTRAINT IF EXISTS integrations_type_check;
ALTER TABLE integrations ADD CONSTRAINT integrations_type_check CHECK (type IN ('slack', 'discord', 'webhook', 'smtp', 'trello', 'notion', 'sheets', 'airtable'));
