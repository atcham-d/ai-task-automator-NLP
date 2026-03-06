import React, { useState, useEffect } from 'react';
import { apiGet } from '../lib/api';
import { AnimatedPage, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { ChevronDown, ChevronRight, Filter } from 'lucide-react';

interface LogResponse {
    id: string;
    workflow_id: string;
    workflow_name?: string;
    triggered_at: string;
    trigger_type?: string;
    duration_ms?: number;
    status: string;
    output?: Record<string, unknown>;
    error?: string;
}

interface Workflow {
    id: string;
    name: string;
}

export const LogsPage: React.FC = () => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
    const [workflowFilter, setWorkflowFilter] = useState<string>('all');
    const [logs, setLogs] = useState<LogResponse[]>([]);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const data = await apiGet<Workflow[]>('/api/workflows');
                setWorkflows(data);
            } catch (err: unknown) {
                console.error("Failed to load workflows:", err);
            }
        };
        fetchWorkflows();
    }, []);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            setErrorMsg(null);
            try {
                const limit = 50;
                const offset = (page - 1) * limit;
                let query = `?limit=${limit}&offset=${offset}`;
                if (statusFilter !== 'all') query += `&status=${statusFilter}`;
                if (workflowFilter !== 'all') query += `&workflow_id=${workflowFilter}`;

                const data = await apiGet<LogResponse[]>(`/api/logs${query}`);
                setLogs(data);
            } catch (err: unknown) {
                setErrorMsg(err instanceof Error ? err.message : 'Failed to load logs');
                setLogs([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [statusFilter, workflowFilter, page]);

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
                        {workflows.map((w) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
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
                    {isLoading ? (
                        <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                            <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
                            <div>Loading logs...</div>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : errorMsg ? (
                        <div style={{ padding: '48px 20px', textAlign: 'center', color: '#ef4444', fontSize: '14px' }}>
                            {errorMsg}
                        </div>
                    ) : logs.length === 0 ? (
                        <div style={{ padding: '48px 20px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>
                            No logs match your filters.
                        </div>
                    ) : (
                        logs.map((log) => (
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
                                        <span style={{ fontWeight: 500 }}>{log.workflow_name || log.workflow_id}</span>
                                        <span style={{ color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                                            {new Date(log.triggered_at).toLocaleString()}
                                        </span>
                                        <span style={{ color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                                            {log.duration_ms !== undefined && log.duration_ms !== null ? `${(log.duration_ms / 1000).toFixed(2)}s` : '-'}
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
                                                {log.error ? log.error : JSON.stringify(log.output, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </StaggerItem>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                    {[page > 1 ? page - 1 : null, page, logs.length === 50 ? page + 1 : null].filter(Boolean).map((pageNum) => (
                        <button
                            key={pageNum as number}
                            onClick={() => setPage(pageNum as number)}
                            disabled={isLoading}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: pageNum === page ? '1px solid #6366f1' : '1px solid #1e1e2e',
                                background: pageNum === page ? 'rgba(99,102,241,0.1)' : 'transparent',
                                color: pageNum === page ? '#818cf8' : '#94a3b8',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                            }}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>
            </StaggerContainer>
        </AnimatedPage>
    );
};
