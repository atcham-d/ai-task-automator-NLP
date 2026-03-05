import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedPage, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Search, MoreVertical, Clock, Zap, GitBranch } from 'lucide-react';

interface Workflow {
    id: string;
    name: string;
    triggerType: string;
    status: 'success' | 'failed' | 'draft';
    lastRun: string;
}

const mockWorkflows: Workflow[] = [
    { id: '1', name: 'Email to Slack Notifier', triggerType: 'Email', status: 'success', lastRun: '2 min ago' },
    { id: '2', name: 'Daily Report Generator', triggerType: 'Schedule', status: 'success', lastRun: '1 hour ago' },
    { id: '3', name: 'Webhook Data Processor', triggerType: 'Webhook', status: 'failed', lastRun: '3 hours ago' },
    { id: '4', name: 'Customer Onboarding Flow', triggerType: 'HTTP', status: 'success', lastRun: '5 hours ago' },
    { id: '5', name: 'Slack Command Handler', triggerType: 'Webhook', status: 'draft', lastRun: 'Never' },
    { id: '6', name: 'Invoice Reminder System', triggerType: 'Schedule', status: 'success', lastRun: '12 hours ago' },
];

const triggerIcons: Record<string, React.ReactNode> = {
    Email: <Zap size={12} />,
    Schedule: <Clock size={12} />,
    Webhook: <GitBranch size={12} />,
    HTTP: <GitBranch size={12} />,
};

export const DashboardHome: React.FC = () => {
    const [search, setSearch] = useState('');
    const filtered = mockWorkflows.filter((w) =>
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

            {/* Workflow Cards Grid */}
            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {filtered.map((workflow) => (
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
                                                {triggerIcons[workflow.triggerType]}
                                                <span style={{ marginLeft: '4px' }}>{workflow.triggerType}</span>
                                            </Badge>
                                            <Badge
                                                variant={
                                                    workflow.status === 'success' ? 'success' :
                                                        workflow.status === 'failed' ? 'error' : 'default'
                                                }
                                            >
                                                {workflow.status === 'success' ? '● Success' :
                                                    workflow.status === 'failed' ? '● Failed' : '○ Draft'}
                                            </Badge>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '12px' }}>
                                            <Clock size={12} />
                                            Last run: {workflow.lastRun}
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
                ))}
            </StaggerContainer>
        </AnimatedPage>
    );
};
