import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IntegrationModal } from '../components/IntegrationModal';
import type { Integration } from '../lib/api';
import { integrationsApi } from '../lib/api';
import type { IntegrationType } from '../lib/integrationSchemas';
import { AVAILABLE_INTEGRATIONS } from '../lib/integrationSchemas';
import {
    Globe, Mail, Trello, FileText, Table, Database,
    CheckCircle2, Plus, Edit, Trash2, ShieldAlert, Zap, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

// Component mapping for Lucide icons
const IconMap: Record<string, React.FC<any>> = {
    Globe,
    Mail,
    Trello,
    FileText,
    Table,
    Database,
    Zap,
};

export const IntegrationsPage: React.FC = () => {
    const [activeIntegrations, setActiveIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<IntegrationType | null>(null);
    const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);

    const fetchIntegrations = async () => {
        try {
            const data = await integrationsApi.getAll();
            setActiveIntegrations(data);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to fetch integrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const openCreateModal = (type: IntegrationType) => {
        setSelectedType(type);
        setEditingIntegration(null);
        setModalOpen(true);
    };

    const openEditModal = (integration: Integration) => {
        setSelectedType(integration.type);
        setEditingIntegration(integration);
        setModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        try {
            await integrationsApi.delete(id);
            toast.success(`${name} disconnected`);
            fetchIntegrations();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    if (loading) {
        return (
            <div role="status" className="flex flex-col justify-center items-center py-20 gap-4">
                <Loader2 size={32} className="text-[#6366f1] animate-spin" />
                <span className="sr-only">Loading integrations...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl">
            <div className="mb-10">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[#f1f5f9] mb-2">
                    Integrations
                </h1>
                <p className="text-[#94a3b8]">Connect FlowAI to your favorite services and APIs.</p>
            </div>

            {/* Active Integrations */}
            <div className="mb-12">
                <h2 className="text-lg font-semibold text-[#f1f5f9] mb-6 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-[#10b981]" />
                    Active Connections
                </h2>

                {activeIntegrations.length === 0 ? (
                    <div className="p-10 text-center border border-dashed border-[#1e1e2e] rounded-2xl bg-[#111118]/50">
                        <ShieldAlert size={32} className="mx-auto mb-4 text-[#475569] opacity-50" />
                        <p className="text-[#f1f5f9] font-medium">No active integrations found.</p>
                        <p className="text-[#94a3b8] text-sm mt-1">Select an app from the directory below to connect it.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeIntegrations.map((active) => {
                            const meta = AVAILABLE_INTEGRATIONS.find(a => a.type === active.type);
                            const Icon = meta ? IconMap[meta.icon_name] || Globe : Globe;

                            return (
                                <Card key={active.id} className="flex flex-col gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[#6366f1]/10 rounded-xl text-[#6366f1] shrink-0">
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-[#f1f5f9] truncate">
                                                {active.name}
                                            </h3>
                                            <div className="text-[12px] text-[#10b981] flex items-center gap-1.5 mt-0.5 font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                                                Connected
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-auto">
                                        <Button
                                            variant="ghost"
                                            className="flex-1 py-1 px-2 text-xs"
                                            onClick={async () => {
                                                const promise = integrationsApi.test(active.id);
                                                toast.promise(promise, {
                                                    loading: 'Testing...',
                                                    success: (res) => res.message,
                                                    error: (err) => err.message || 'Test failed',
                                                });
                                            }}
                                        >
                                            <Zap size={14} className="mr-1.5" /> Test
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            className="flex-1 py-1 px-2 text-xs" 
                                            onClick={() => openEditModal(active)}
                                        >
                                            <Edit size={14} className="mr-1.5" /> Config
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            className="px-3 shrink-0" 
                                            onClick={() => handleDelete(active.id, active.name)}
                                            aria-label="Disconnect"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* App Directory */}
            <div className="mb-10">
                <h2 className="text-lg font-semibold text-[#f1f5f9] mb-6">
                    App Directory
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {AVAILABLE_INTEGRATIONS.map((app) => {
                        const Icon = IconMap[app.icon_name] || Globe;
                        const isConnected = activeIntegrations.some(a => a.type === app.type);

                        return (
                            <Card 
                                key={app.type} 
                                hover 
                                role={!isConnected ? "button" : undefined}
                                tabIndex={!isConnected ? 0 : undefined}
                                className={`flex flex-col h-full ${!isConnected ? 'cursor-pointer focus-within:ring-2 focus-within:ring-violet-500/50 outline-none' : ''}`}
                                onClick={() => !isConnected && openCreateModal(app.type)}
                                onKeyDown={(e: React.KeyboardEvent) => {
                                    if (!isConnected && (e.key === 'Enter' || e.key === ' ')) {
                                        e.preventDefault();
                                        openCreateModal(app.type);
                                    }
                                }}
                            >
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="p-3 bg-white/5 rounded-xl text-[#a78bfa] shrink-0 group-hover:bg-[#a78bfa]/10 transition-colors">
                                        <Icon size={28} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-[#f1f5f9] truncate">{app.name}</h3>
                                        <p className="text-[13px] text-[#94a3b8] mt-1.5 leading-relaxed line-clamp-2">
                                            {app.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    {isConnected ? (
                                        <div className="w-full text-[13px] font-medium text-[#10b981] py-2.5 text-center bg-[#10b981]/10 rounded-lg">
                                            Already Connected
                                        </div>
                                    ) : (
                                        <Button 
                                            variant="ghost" 
                                            className="w-full" 
                                            onClick={(e) => { e.stopPropagation(); openCreateModal(app.type); }}
                                        >
                                            <Plus size={16} className="mr-2" /> Connect
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <IntegrationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                type={selectedType}
                existingIntegration={editingIntegration}
                onSuccess={fetchIntegrations}
            />
        </div>
    );
};

export default IntegrationsPage;
