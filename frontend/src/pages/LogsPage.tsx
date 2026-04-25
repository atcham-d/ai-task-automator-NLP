import React, { useState, useEffect } from 'react';
import { apiGet } from '../lib/api';
import { AnimatedPage, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { ChevronDown, ChevronRight, Filter, Loader2, Search, Activity, Zap } from 'lucide-react';

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
    const [hasMore, setHasMore] = useState(false);
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
                const limit = 51; // Fetch one extra to determine if there's a next page
                const offset = (page - 1) * 50;
                let query = `?limit=${limit}&offset=${offset}`;
                if (statusFilter !== 'all') query += `&status=${statusFilter}`;
                if (workflowFilter !== 'all') query += `&workflow_id=${workflowFilter}`;

                const data = await apiGet<LogResponse[]>(`/api/logs${query}`);
                setHasMore(data.length > 50);
                setLogs(data.slice(0, 50));
            } catch (err: unknown) {
                setErrorMsg(err instanceof Error ? err.message : 'Failed to load logs');
                setLogs([]);
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [statusFilter, workflowFilter, page]);

    return (
        <AnimatedPage className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="font-display text-3xl font-bold text-[#f1f5f9] tracking-tight">Execution Logs</h1>
                <div className="flex items-center gap-2 text-xs text-[#475569] font-medium uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <Activity size={14} className="text-indigo-400" />
                    Real-time monitoring
                </div>
            </div>

            <div aria-live="polite" className="sr-only">
                {isLoading ? 'Loading logs...' : `Showing ${logs.length} logs for page ${page}.`}
            </div>

            {/* Filter Bar */}
            <Card className="p-4 mb-6 border-white/5 bg-[#111118]/60 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2 text-[#94a3b8] text-sm">
                        <Filter size={16} />
                        <span className="font-medium">Filter by:</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
                        <select
                            value={workflowFilter}
                            onChange={(e) => setWorkflowFilter(e.target.value)}
                            className="bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2 text-sm text-[#f1f5f9] outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                        >
                            <option value="all">All Workflows</option>
                            {workflows.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'success' | 'failed')}
                            className="bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2 text-sm text-[#f1f5f9] outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Logs Table Wrapper */}
            <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-bold text-[#475569] uppercase tracking-wider">Workflow</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#475569] uppercase tracking-wider">Triggered At</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#475569] uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#475569] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                            <span className="text-sm text-[#94a3b8]">Crunching execution data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : errorMsg ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-red-400 text-sm">
                                        {errorMsg}
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Search className="w-8 h-8 text-[#1e1e2e]" />
                                            <span className="text-sm text-[#475569]">No matching execution records found.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr 
                                            onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setExpandedRow(expandedRow === log.id ? null : log.id);
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                            aria-expanded={expandedRow === log.id}
                                            className={`group cursor-pointer hover:bg-white/[0.03] border-b border-white/[0.02] transition-colors focus-visible:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 ${expandedRow === log.id ? 'bg-white/[0.02]' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-[#f1f5f9]">
                                                    {log.workflow_name || 'Untitled Workflow'}
                                                </div>
                                                <div className="text-[10px] text-[#475569] font-mono mt-0.5 opacity-50">
                                                    ID: {log.workflow_id.slice(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-[#94a3b8]">
                                                {new Date(log.triggered_at).toLocaleString([], { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-[#94a3b8]">
                                                {log.duration_ms !== undefined && log.duration_ms !== null 
                                                    ? `${(log.duration_ms / 1000).toFixed(2)}s` 
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={log.status === 'success' ? 'success' : 'error'} className="rounded-md px-2 py-0.5 text-[10px] font-bold">
                                                    {log.status === 'success' ? 'SUCCESS' : 'FAILED'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-[#475569] group-hover:text-indigo-400 transition-colors">
                                                    {expandedRow === log.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                </div>
                                            </td>
                                        </tr>

                                        {expandedRow === log.id && (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-6 bg-[#0a0a0f]/50">
                                                    <StaggerContainer>
                                                        <StaggerItem>
                                                            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-[#475569] uppercase tracking-widest">
                                                                <Zap size={10} className="text-indigo-500" />
                                                                Execution Output
                                                            </div>
                                                            <div className="relative group/code">
                                                                <div className="absolute -inset-2 bg-indigo-500/5 rounded-xl blur opacity-0 group-hover/code:opacity-100 transition-opacity" />
                                                                <pre className="relative font-mono text-xs leading-relaxed text-[#94a3b8] bg-[#0d0d12] p-5 rounded-xl border border-white/5 overflow-x-auto whitespace-pre-wrap break-all">
                                                                    {log.error ? log.error : JSON.stringify(log.output, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </StaggerItem>
                                                    </StaggerContainer>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination Navigation">
                {[page > 1 ? page - 1 : null, page, hasMore ? page + 1 : null].filter(Boolean).map((pageNum) => (
                    <button
                        key={pageNum as number}
                        onClick={() => setPage(pageNum as number)}
                        disabled={isLoading}
                        aria-current={pageNum === page ? 'page' : undefined}
                        aria-label={`Go to page ${pageNum}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl border font-medium text-sm transition-all duration-200 ${
                            pageNum === page 
                                ? 'border-[#6366f1] bg-indigo-500/10 text-[#818cf8] shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                                : 'border-white/5 bg-[#0a0a0f] hover:border-white/10 text-[#475569] hover:text-[#94a3b8]'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50'}`}
                    >
                        {pageNum}
                    </button>
                ))}
            </div>
        </AnimatedPage>
    );
};
