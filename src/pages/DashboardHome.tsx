import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedPage, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Search, MoreVertical, Clock, Zap, GitBranch, AlertCircle, Loader2 } from 'lucide-react';
import { apiGet } from '../lib/api';

interface WorkflowResponse {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    status: string;
    definition: {
        trigger?: { type?: string; config?: Record<string, unknown> };
        conditions?: unknown[];
        actions?: unknown[];
    };
    run_count: number;
    last_run_at: string | null;
    created_at: string;
    updated_at: string;
}

function getTriggerType(workflow: WorkflowResponse): string {
    const type = workflow.definition?.trigger?.type;
    if (!type) return 'Webhook';
    const map: Record<string, string> = {
        schedule: 'Schedule',
        email: 'Email',
        webhook: 'Webhook',
    };
    return map[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

function getStatusBadge(status: string): { variant: 'success' | 'error' | 'default'; label: string } {
    switch (status) {
        case 'active': return { variant: 'success', label: '● Active' };
        case 'paused': return { variant: 'error', label: '● Paused' };
        default: return { variant: 'default', label: '○ Draft' };
    }
}

function formatLastRun(lastRunAt: string | null): string {
    if (!lastRunAt) return 'Never';
    const diff = Date.now() - new Date(lastRunAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

const triggerIcons: Record<string, React.ReactNode> = {
    Email: <Zap size={12} />,
    Schedule: <Clock size={12} />,
    Webhook: <GitBranch size={12} />,
    HTTP: <GitBranch size={12} />,
};

export const DashboardHome: React.FC = () => {
    const [workflows, setWorkflows] = useState<WorkflowResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let cancelled = false;
        async function fetchWorkflows() {
            try {
                setLoading(true);
                setError(null);
                const data = await apiGet<WorkflowResponse[]>('/api/workflows/');
                if (!cancelled) setWorkflows(data);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load workflows');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchWorkflows();
        return () => { cancelled = true; };
    }, []);

    const filtered = workflows.filter((w) =>
        w.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AnimatedPage>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1
                    style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#f1f5f9',
                    }}
                >
                    Your Workflows
                </h1>
                <Link to="/dashboard/workflows/new" style={{ textDecoration: 'none' }}>
                    <Button variant="primary">
                        <Plus size={16} />
                        New Workflow
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
                <div style={{ position: 'relative' }}>
                    <Search
                        size={16}
                        style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#475569',
                            pointerEvents: 'none',
                        }}
                    />
                    <Input
                        placeholder="Search workflows..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
                    <Loader2 size={32} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
                        <AlertCircle size={20} />
                        <span style={{ fontSize: '14px' }}>{error}</span>
                    </div>
                </Card>
            )}

            {/* Empty State */}
            {!loading && !error && workflows.length === 0 && (
                <Card>
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <GitBranch size={48} style={{ color: '#475569', marginBottom: '16px' }} />
                        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                            No workflows yet
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                            Create your first workflow by describing it in plain English.
                        </p>
                        <Link to="/dashboard/workflows/new" style={{ textDecoration: 'none' }}>
                            <Button variant="primary">
                                <Plus size={16} />
                                Create Workflow
                            </Button>
                        </Link>
                    </div>
                </Card>
            )}

            {/* Workflow Cards Grid */}
            {!loading && !error && filtered.length > 0 && (
                <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {filtered.map((workflow) => {
                        const triggerType = getTriggerType(workflow);
                        const statusBadge = getStatusBadge(workflow.status);
                        return (
                            <StaggerItem key={workflow.id}>
                                <Link to={`/dashboard/workflows/${workflow.id}`} style={{ textDecoration: 'none' }}>
                                    <Card hover>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <h3
                                                    style={{
                                                        fontFamily: "'Syne', sans-serif",
                                                        fontSize: '16px',
                                                        fontWeight: 700,
                                                        color: '#f1f5f9',
                                                        marginBottom: '12px',
                                                    }}
                                                >
                                                    {workflow.name}
                                                </h3>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                                                    <Badge variant="trigger">
                                                        {triggerIcons[triggerType] || <GitBranch size={12} />}
                                                        <span style={{ marginLeft: '4px' }}>{triggerType}</span>
                                                    </Badge>
                                                    <Badge variant={statusBadge.variant}>
                                                        {statusBadge.label}
                                                    </Badge>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '12px' }}>
                                                    <Clock size={12} />
                                                    Last run: {formatLastRun(workflow.last_run_at)}
                                                </div>
                                            </div>
                                            <button
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#475569',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                }}
                                                onClick={(e) => e.preventDefault()}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </Card>
                                </Link>
                            </StaggerItem>
                        );
                    })}
                </StaggerContainer>
            )}
        </AnimatedPage>
    );
};
