import React, { useState } from 'react';
import { AnimatedPage, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { ChevronDown, ChevronRight, Filter } from 'lucide-react';

interface LogEntry {
    id: string;
    workflowName: string;
    triggeredAt: string;
    duration: string;
    status: 'success' | 'failed';
    detail: string;
}

const mockLogs: LogEntry[] = [
    {
        id: '1',
        workflowName: 'Email to Slack Notifier',
        triggeredAt: '2026-03-04 23:45:12',
        duration: '1.2s',
        status: 'success',
        detail: `[23:45:12] Trigger fired: New email from manager@company.com
[23:45:12] Subject: "Q1 Board Deck Review"
[23:45:12] Condition check: sender == manager@company.com → TRUE
[23:45:13] Action: Posting to Slack #notifications
[23:45:13] Slack API response: 200 OK
[23:45:13] Workflow completed successfully`,
    },
    {
        id: '2',
        workflowName: 'Daily Report Generator',
        triggeredAt: '2026-03-04 22:00:00',
        duration: '3.8s',
        status: 'success',
        detail: `[22:00:00] Schedule trigger fired: daily-9am-report
[22:00:01] Fetching data from analytics API...
[22:00:02] Data received: 1,247 records
[22:00:03] Generating PDF report...
[22:00:03] Sending report via email to team@company.com
[22:00:04] Email sent successfully`,
    },
    {
        id: '3',
        workflowName: 'Webhook Data Processor',
        triggeredAt: '2026-03-04 20:15:33',
        duration: '0.5s',
        status: 'failed',
        detail: `[20:15:33] Webhook received: POST /api/webhook/process
[20:15:33] Payload size: 2.4KB
[20:15:33] Error: Failed to parse JSON payload
[20:15:33] TypeError: Cannot read property 'data' of undefined
[20:15:33] Stack trace: at processWebhook (worker.js:45)
[20:15:33] Workflow failed after 0.5s`,
    },
    {
        id: '4',
        workflowName: 'Customer Onboarding Flow',
        triggeredAt: '2026-03-04 18:30:00',
        duration: '2.1s',
        status: 'success',
        detail: `[18:30:00] Trigger fired: New user signup
[18:30:00] User: jane@startup.io
[18:30:01] Action: Sending welcome email
[18:30:01] Action: Creating CRM record
[18:30:02] Action: Posting to #new-customers Slack
[18:30:02] Workflow completed successfully`,
    },
    {
        id: '5',
        workflowName: 'Invoice Reminder System',
        triggeredAt: '2026-03-04 16:00:00',
        duration: '1.8s',
        status: 'success',
        detail: `[16:00:00] Schedule trigger fired: invoice-check
[16:00:00] Checking overdue invoices...
[16:00:01] Found 3 overdue invoices
[16:00:01] Sending reminder to client-a@example.com
[16:00:01] Sending reminder to client-b@example.com
[16:00:02] Sending reminder to client-c@example.com
[16:00:02] Workflow completed successfully`,
    },
    {
        id: '6',
        workflowName: 'Email to Slack Notifier',
        triggeredAt: '2026-03-04 14:22:45',
        duration: '0.3s',
        status: 'failed',
        detail: `[14:22:45] Trigger fired: New email from unknown@spam.co
[14:22:45] Condition check: sender == manager@company.com → FALSE
[14:22:45] Error: No fallback action configured
[14:22:45] Workflow failed`,
    },
];

export const LogsPage: React.FC = () => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
    const [workflowFilter, setWorkflowFilter] = useState<string>('all');

    const uniqueWorkflows = [...new Set(mockLogs.map((l) => l.workflowName))];

    const filteredLogs = mockLogs.filter((log) => {
        if (statusFilter !== 'all' && log.status !== statusFilter) return false;
        if (workflowFilter !== 'all' && log.workflowName !== workflowFilter) return false;
        return true;
    });

    const selectStyle: React.CSSProperties = {
        background: '#0a0a0f',
        border: '1px solid #1e1e2e',
        borderRadius: '8px',
        padding: '8px 12px',
        color: '#f1f5f9',
        fontSize: '13px',
        fontFamily: "'DM Sans', sans-serif",
        outline: 'none',
        cursor: 'pointer',
    };

    return (
        <AnimatedPage>
            <h1
                style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#f1f5f9',
                    marginBottom: '32px',
                }}
            >
                Execution Logs
            </h1>

            {/* Filter Bar */}
            <Card style={{ padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
                        <Filter size={14} />
                        Filters:
                    </div>
                    <select
                        value={workflowFilter}
                        onChange={(e) => setWorkflowFilter(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="all">All Workflows</option>
                        {uniqueWorkflows.map((w) => (
                            <option key={w} value={w}>{w}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'success' | 'failed')}
                        style={selectStyle}
                    >
                        <option value="all">All Status</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </Card>

            {/* Logs Table */}
            <StaggerContainer>
                <div
                    style={{
                        background: '#111118',
                        border: '1px solid #1e1e2e',
                        borderRadius: '16px',
                        overflow: 'hidden',
                    }}
                >
                    {/* Table Header */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1.5fr 0.8fr 0.8fr 0.5fr',
                            padding: '14px 20px',
                            borderBottom: '1px solid #1e1e2e',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        <span>Workflow</span>
                        <span>Triggered At</span>
                        <span>Duration</span>
                        <span>Status</span>
                        <span></span>
                    </div>

                    {/* Table Rows */}
                    {filteredLogs.map((log) => (
                        <StaggerItem key={log.id}>
                            <div>
                                <div
                                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1.5fr 0.8fr 0.8fr 0.5fr',
                                        padding: '14px 20px',
                                        borderBottom: '1px solid rgba(30,30,46,0.5)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        alignItems: 'center',
                                        fontSize: '14px',
                                        color: '#f1f5f9',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.03)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ fontWeight: 500 }}>{log.workflowName}</span>
                                    <span style={{ color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                                        {log.triggeredAt}
                                    </span>
                                    <span style={{ color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                                        {log.duration}
                                    </span>
                                    <Badge variant={log.status === 'success' ? 'success' : 'error'}>
                                        {log.status === 'success' ? 'Success' : 'Failed'}
                                    </Badge>
                                    <span style={{ color: '#475569', display: 'flex', justifyContent: 'flex-end' }}>
                                        {expandedRow === log.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </span>
                                </div>

                                {/* Expanded detail */}
                                {expandedRow === log.id && (
                                    <div
                                        style={{
                                            padding: '16px 20px',
                                            borderBottom: '1px solid rgba(30,30,46,0.5)',
                                            background: '#0a0a0f',
                                        }}
                                    >
                                        <pre
                                            style={{
                                                fontFamily: "'JetBrains Mono', monospace",
                                                fontSize: '12px',
                                                lineHeight: 1.6,
                                                color: '#94a3b8',
                                                margin: 0,
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {log.detail}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </StaggerItem>
                    ))}

                    {filteredLogs.length === 0 && (
                        <div style={{ padding: '48px 20px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>
                            No logs match your filters.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                    {[1, 2, 3].map((page) => (
                        <button
                            key={page}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: page === 1 ? '1px solid #6366f1' : '1px solid #1e1e2e',
                                background: page === 1 ? 'rgba(99,102,241,0.1)' : 'transparent',
                                color: page === 1 ? '#818cf8' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                            }}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            </StaggerContainer>
        </AnimatedPage>
    );
};
