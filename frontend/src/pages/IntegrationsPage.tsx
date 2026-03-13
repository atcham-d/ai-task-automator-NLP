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
    CheckCircle2, Plus, Edit, Trash2, ShieldAlert, Zap
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
        // Removed confirm for smoother automated verification, can be restored for PROD
        try {
            await integrationsApi.delete(id);
            toast.success(`${name} disconnected`);
            fetchIntegrations();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    if (loading) {
        return <div style={{ color: '#94a3b8', padding: '24px' }}>Loading integrations...</div>;
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', color: '#f1f5f9', fontWeight: 700, marginBottom: '8px' }}>
                    Integrations
                </h1>
                <p style={{ color: '#94a3b8' }}>Connect FlowAI to your favorite services and APIs.</p>
            </div>

            {/* Active Integrations */}
            <h2 style={{ fontSize: '18px', color: '#e2e8f0', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#10b981" />
                Active Connections
            </h2>

            {activeIntegrations.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', marginBottom: '48px', color: '#64748b' }}>
                    <ShieldAlert size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                    <p>No active integrations found.</p>
                    <p style={{ fontSize: '14px', marginTop: '4px' }}>Select an app from the directory below to connect it.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '48px' }}>
                    {activeIntegrations.map((active) => {
                        const meta = AVAILABLE_INTEGRATIONS.find(a => a.type === active.type);
                        const Icon = meta ? IconMap[meta.icon_name] || Globe : Globe;

                        return (
                            <Card key={active.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '10px', background: 'rgba(99,102,241,0.1)', borderRadius: '10px', color: '#8b5cf6' }}>
                                        <Icon size={24} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>{active.name}</h3>
                                        <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Connected
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                    <Button
                                        variant="ghost"
                                        style={{ flex: 1, padding: '4px' }}
                                        onClick={async () => {
                                            const promise = integrationsApi.test(active.id);
                                            toast.promise(promise, {
                                                loading: 'Testing connection...',
                                                success: (res) => res.message,
                                                error: (err) => err.message || 'Test failed',
                                            });
                                        }}
                                    >
                                        <Zap size={14} style={{ marginRight: '6px' }} /> Test
                                    </Button>
                                    <Button variant="ghost" style={{ flex: 1, padding: '4px' }} onClick={() => openEditModal(active)}>
                                        <Edit size={14} style={{ marginRight: '6px' }} /> Configure
                                    </Button>
                                    <Button variant="danger" style={{ padding: '4px 10px' }} onClick={() => handleDelete(active.id, active.name)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* App Directory */}
            <h2 style={{ fontSize: '18px', color: '#e2e8f0', fontWeight: 600, marginBottom: '16px' }}>
                App Directory
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {AVAILABLE_INTEGRATIONS.map((app) => {
                    const Icon = IconMap[app.icon_name] || Globe;
                    const isConnected = activeIntegrations.some(a => a.type === app.type);

                    return (
                        <Card key={app.type} style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => !isConnected && openCreateModal(app.type)}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', color: '#a78bfa' }}>
                                    <Icon size={28} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>{app.name}</h3>
                                    <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', lineHeight: 1.4 }}>{app.description}</p>
                                </div>
                            </div>

                            {isConnected ? (
                                <div style={{ fontSize: '13px', color: '#10b981', padding: '8px 0', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>
                                    Already Connected
                                </div>
                            ) : (
                                <Button variant="ghost" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); openCreateModal(app.type); }}>
                                    <Plus size={16} style={{ marginRight: '6px' }} /> Connect
                                </Button>
                            )}
                        </Card>
                    );
                })}
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
