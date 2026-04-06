import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedPage, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-[#f1f5f9]">
                        Your Workflows
                    </h1>
                    <p className="text-[#c7c4d7] text-sm mt-1">
                        Automate your logic and manage all your active processes.
                    </p>
                </div>
                <Link to="/dashboard/workflows/new" className="no-underline w-full sm:w-auto md:mr-2">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] text-[#131318] font-semibold text-sm w-full sm:w-auto hover:opacity-90 transition-all">
                        <Plus size={16} />
                        New Workflow
                    </button>
                </Link>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1 max-w-md">
                    <div className="relative group">
                        <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#6366f1] transition-colors pointer-events-none"
                        />
                        <Input
                            placeholder="Search workflows..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#35343a] text-[#c7c4d7] text-sm hover:bg-[#1b1b20] transition-colors">
                    Filter
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={32} className="text-[#6366f1] animate-spin" />
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <Card>
                    <div className="flex items-center gap-3 text-red-500">
                        <AlertCircle size={20} />
                        <span className="text-sm">{error}</span>
                    </div>
                </Card>
            )}

            {/* Empty State */}
            {!loading && !error && workflows.length === 0 && (
                <Card className="flex flex-col items-center text-center py-12 border border-[#1e1e2e] bg-[#0d0d12]">
                    <GitBranch size={48} className="text-[#475569] mb-4" />
                    <h3 className="font-display text-lg font-bold text-[#f1f5f9] mb-2">
                        No workflows yet
                    </h3>
                    <p className="text-[#94a3b8] text-sm mb-6 max-w-sm">
                        Create your first workflow by describing it in plain English.
                    </p>
                    <Link to="/dashboard/workflows/new" className="no-underline">
                        <button className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] text-[#131318] font-semibold text-sm hover:opacity-90 transition-all">
                            <Plus size={16} />
                            Create Workflow
                        </button>
                    </Link>
                </Card>
            )}

            {/* Workflow Cards Grid */}
            {!loading && !error && filtered.length > 0 && (
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filtered.map((workflow) => {
                        const triggerType = getTriggerType(workflow);
                        const statusBadge = getStatusBadge(workflow.status);
                        return (
                            <StaggerItem key={workflow.id}>
                                <Link to={`/dashboard/workflows/${workflow.id}`} className="no-underline">
                                    <Card hover className="h-full">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-display text-base font-bold text-[#f1f5f9] mb-3 truncate">
                                                    {workflow.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 items-center mb-4">
                                                    <Badge variant="trigger">
                                                        {triggerIcons[triggerType] || <GitBranch size={12} />}
                                                        <span className="ml-1.5">{triggerType}</span>
                                                    </Badge>
                                                    <Badge variant={statusBadge.variant}>
                                                        {statusBadge.label}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[#475569] text-[12px]">
                                                    <Clock size={12} />
                                                    Last run: {formatLastRun(workflow.last_run_at)}
                                                </div>
                                            </div>
                                            <button
                                                className="p-1 text-[#475569] hover:text-[#f1f5f9] transition-colors"
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
