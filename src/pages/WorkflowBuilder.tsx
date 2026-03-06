import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Node,
    type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Textarea } from '../components/Input';
import { Card } from '../components/Card';
import TriggerNode from '../components/nodes/TriggerNode';
import ConditionNode from '../components/nodes/ConditionNode';
import ActionNode from '../components/nodes/ActionNode';
import AnimatedEdge from '../components/nodes/AnimatedEdge';
import { Save, Play, Pause, ChevronDown, ChevronRight, Sparkles, Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api';
import toast from 'react-hot-toast';

/* ─── Types ─── */

interface WorkflowDefinition {
    trigger: { type: string; config: Record<string, unknown> };
    conditions: { field: string; operator: string; value: string }[];
    actions: { type: string; config: Record<string, unknown> }[];
}

interface WorkflowResponse {
    id: string;
    name: string;
    description: string | null;
    status: string;
    definition: Record<string, unknown>;
    run_count: number;
}

/* ─── Helpers ─── */

function definitionToNodes(def: WorkflowDefinition): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let y = 50;

    // Trigger node
    const triggerLabel = def.trigger.type.charAt(0).toUpperCase() + def.trigger.type.slice(1) + ' Trigger';
    nodes.push({
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y },
        data: { label: triggerLabel, icon: def.trigger.type },
    });
    let lastId = 'trigger-1';
    y += 160;

    // Condition nodes
    def.conditions.forEach((cond, i) => {
        const id = `condition-${i + 1}`;
        nodes.push({
            id,
            type: 'condition',
            position: { x: 230, y },
            data: { label: `${cond.field} ${cond.operator} ${cond.value}` },
        });
        edges.push({
            id: `e-${lastId}-${id}`,
            source: lastId,
            target: id,
            type: 'animated',
        });
        lastId = id;
        y += 160;
    });

    // Action nodes
    const actionStartX = def.actions.length > 1 ? 100 : 250;
    const actionSpacing = 270;
    def.actions.forEach((action, i) => {
        const id = `action-${i + 1}`;
        const label = action.type.charAt(0).toUpperCase() + action.type.slice(1) + ' Action';
        nodes.push({
            id,
            type: 'action',
            position: { x: actionStartX + i * actionSpacing, y },
            data: { label, icon: action.type },
        });
        edges.push({
            id: `e-${lastId}-${id}`,
            source: lastId,
            target: id,
            sourceHandle: def.conditions.length > 0 && i === 0 ? 'yes' : def.conditions.length > 0 && i === 1 ? 'no' : undefined,
            type: 'animated',
        });
    });

    return { nodes, edges };
}

/* ─── Component ─── */

export const WorkflowBuilder: React.FC = () => {
    const { id: workflowId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = workflowId && workflowId !== 'new';

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [nlInput, setNlInput] = useState('');
    const [jsonVisible, setJsonVisible] = useState(true);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [workflowName, setWorkflowName] = useState('New Workflow');
    const [workflowStatus, setWorkflowStatus] = useState('draft');
    const [parsedDef, setParsedDef] = useState<WorkflowDefinition | null>(null);
    const [parsing, setParsing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedId, setSavedId] = useState<string | null>(workflowId && workflowId !== 'new' ? workflowId : null);

    // Load existing workflow
    useEffect(() => {
        if (!isEditing) return;
        let cancelled = false;
        async function loadWorkflow() {
            try {
                const wf = await apiGet<WorkflowResponse>(`/api/workflows/${workflowId}`);
                if (cancelled) return;
                setWorkflowName(wf.name);
                setWorkflowStatus(wf.status);
                setSavedId(wf.id);
                const def = wf.definition as unknown as WorkflowDefinition;
                if (def?.trigger) {
                    setParsedDef(def);
                    const { nodes: n, edges: e } = definitionToNodes(def);
                    setNodes(n);
                    setEdges(e);
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to load workflow');
            }
        }
        loadWorkflow();
        return () => { cancelled = true; };
    }, [isEditing, workflowId, setNodes, setEdges]);

    const nodeTypes = useMemo(() => ({
        trigger: TriggerNode,
        condition: ConditionNode,
        action: ActionNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        animated: AnimatedEdge,
    }), []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'animated' }, eds)),
        [setEdges]
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    // Parse NL input
    const handleParse = useCallback(async () => {
        if (!nlInput.trim()) {
            toast.error('Please describe your workflow first');
            return;
        }
        setParsing(true);
        try {
            const def = await apiPost<WorkflowDefinition>('/api/parse/', { text: nlInput });
            setParsedDef(def);
            const { nodes: n, edges: e } = definitionToNodes(def);
            setNodes(n);
            setEdges(e);
            toast.success('Workflow parsed successfully');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to parse workflow');
        } finally {
            setParsing(false);
        }
    }, [nlInput, setNodes, setEdges]);

    // Save workflow
    const handleSave = useCallback(async () => {
        if (!parsedDef) {
            toast.error('Parse a workflow first before saving');
            return;
        }
        setSaving(true);
        try {
            if (savedId) {
                await apiPatch(`/api/workflows/${savedId}`, {
                    name: workflowName,
                    definition: parsedDef,
                });
                toast.success('Workflow updated');
            } else {
                const created = await apiPost<WorkflowResponse>('/api/workflows/', {
                    name: workflowName,
                    definition: parsedDef,
                });
                setSavedId(created.id);
                toast.success('Workflow created');
                navigate(`/dashboard/workflows/${created.id}`, { replace: true });
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    }, [parsedDef, savedId, workflowName, navigate]);

    // Activate / Pause
    const handleToggleActive = useCallback(async () => {
        if (!savedId) {
            toast.error('Save the workflow first');
            return;
        }
        try {
            const endpoint = workflowStatus === 'active' ? 'pause' : 'activate';
            const wf = await apiPost<WorkflowResponse>(`/api/workflows/${savedId}/${endpoint}`);
            setWorkflowStatus(wf.status);
            toast.success(wf.status === 'active' ? 'Workflow activated' : 'Workflow paused');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update status');
        }
    }, [savedId, workflowStatus]);

    // Run manually
    const handleRun = useCallback(async () => {
        if (!savedId) return;
        try {
            await apiPost(`/api/workflows/${savedId}/run`);
            toast.success('Workflow run triggered');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Run failed');
        }
    }, [savedId]);

    // Delete workflow
    const handleDelete = useCallback(async () => {
        if (!savedId) return;
        if (!window.confirm('Are you sure you want to delete this workflow?')) return;
        try {
            await apiDelete(`/api/workflows/${savedId}`);
            toast.success('Workflow deleted');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete');
        }
    }, [savedId, navigate]);

    return (
        <AnimatedPage style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
            {/* Top Bar */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #1e1e2e',
                    marginBottom: '0',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <input
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontFamily: "'Syne', sans-serif",
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#f1f5f9',
                            outline: 'none',
                            width: '300px',
                        }}
                    />
                    <Badge variant={workflowStatus === 'active' ? 'success' : workflowStatus === 'paused' ? 'warning' : 'info'}>
                        {workflowStatus.charAt(0).toUpperCase() + workflowStatus.slice(1)}
                    </Badge>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {savedId && (
                        <Button variant="ghost" size="sm" onClick={handleDelete} title="Delete Workflow" style={{ color: '#ef4444' }}>
                            <Trash2 size={14} />
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                    {savedId && (
                        <Button variant="ghost" size="sm" onClick={handleRun}>
                            <RotateCcw size={14} />
                            Run
                        </Button>
                    )}
                    <Button variant="primary" size="sm" onClick={handleToggleActive}>
                        {workflowStatus === 'active' ? <Pause size={14} /> : <Play size={14} />}
                        {workflowStatus === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                </div>
            </div>

            {/* 3-Panel Layout */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Panel — NL Input */}
                <div
                    style={{
                        width: '280px',
                        borderRight: '1px solid #1e1e2e',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        overflowY: 'auto',
                    }}
                >
                    <label
                        style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#f1f5f9',
                        }}
                    >
                        Describe your automation
                    </label>
                    <Textarea
                        value={nlInput}
                        onChange={(e) => setNlInput(e.target.value)}
                        placeholder="When I receive an email from..."
                        style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '13px',
                            minHeight: '160px',
                        }}
                    />
                    <p style={{ color: '#475569', fontSize: '11px' }}>{nlInput.length} / 500 characters</p>
                    <Button variant="primary" style={{ width: '100%' }} onClick={handleParse} disabled={parsing}>
                        {parsing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                        {parsing ? 'Parsing...' : 'Parse Workflow'}
                    </Button>

                    {/* JSON Preview */}
                    {parsedDef && (
                        <div>
                            <button
                                onClick={() => setJsonVisible(!jsonVisible)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 0',
                                    fontFamily: "'DM Sans', sans-serif",
                                }}
                            >
                                {jsonVisible ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                Parsed JSON
                            </button>
                            {jsonVisible && (
                                <Card style={{ padding: '12px', marginTop: '8px', background: '#0a0a0f' }}>
                                    <pre
                                        style={{
                                            fontFamily: "'JetBrains Mono', monospace",
                                            fontSize: '11px',
                                            color: '#94a3b8',
                                            lineHeight: 1.6,
                                            overflow: 'auto',
                                            margin: 0,
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {JSON.stringify(parsedDef, null, 2)}
                                    </pre>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Parsed Fields */}
                    {parsedDef && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Badge variant="trigger">Trigger</Badge>
                                <span style={{ fontSize: '13px', color: '#f1f5f9' }}>
                                    {parsedDef.trigger.type.charAt(0).toUpperCase() + parsedDef.trigger.type.slice(1)}
                                </span>
                            </div>
                            {parsedDef.conditions.map((c, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Badge variant="warning">Condition</Badge>
                                    <span style={{ fontSize: '13px', color: '#f1f5f9' }}>{c.field} {c.operator} {c.value}</span>
                                </div>
                            ))}
                            {parsedDef.actions.map((a, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Badge variant="info">Action</Badge>
                                    <span style={{ fontSize: '13px', color: '#f1f5f9' }}>
                                        {a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Center Panel — React Flow Canvas */}
                <div style={{ flex: 1 }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                        proOptions={{ hideAttribution: true }}
                        style={{ background: '#0a0a0f' }}
                    >
                        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.05)" />
                        <Controls />
                        <MiniMap
                            nodeColor={(node) => {
                                if (node.type === 'trigger') return '#a78bfa';
                                if (node.type === 'condition') return '#fbbf24';
                                return '#6366f1';
                            }}
                            maskColor="rgba(10,10,15,0.8)"
                        />
                    </ReactFlow>
                </div>

                {/* Right Panel — Node Inspector */}
                <div
                    style={{
                        width: selectedNode ? '260px' : '0px',
                        borderLeft: selectedNode ? '1px solid #1e1e2e' : 'none',
                        padding: selectedNode ? '20px' : '0',
                        overflowY: 'auto',
                        transition: 'width 0.3s ease, padding 0.3s ease',
                        overflowX: 'hidden',
                    }}
                >
                    {selectedNode && (
                        <>
                            <h3
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: '#f1f5f9',
                                    marginBottom: '20px',
                                }}
                            >
                                Node Properties
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                        Type
                                    </label>
                                    <Badge
                                        variant={
                                            selectedNode.type === 'trigger' ? 'trigger' :
                                                selectedNode.type === 'condition' ? 'warning' : 'info'
                                        }
                                    >
                                        {selectedNode.type?.charAt(0).toUpperCase()}{selectedNode.type?.slice(1)}
                                    </Badge>
                                </div>

                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                        Label
                                    </label>
                                    <input
                                        value={(selectedNode.data as { label?: string }).label || ''}
                                        readOnly
                                        style={{
                                            background: '#0a0a0f',
                                            border: '1px solid #1e1e2e',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            color: '#f1f5f9',
                                            fontSize: '13px',
                                            width: '100%',
                                            fontFamily: "'DM Sans', sans-serif",
                                            outline: 'none',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                        Position X
                                    </label>
                                    <input
                                        value={Math.round(selectedNode.position.x)}
                                        readOnly
                                        style={{
                                            background: '#0a0a0f',
                                            border: '1px solid #1e1e2e',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            color: '#f1f5f9',
                                            fontSize: '13px',
                                            width: '100%',
                                            fontFamily: "'JetBrains Mono', monospace",
                                            outline: 'none',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                        Position Y
                                    </label>
                                    <input
                                        value={Math.round(selectedNode.position.y)}
                                        readOnly
                                        style={{
                                            background: '#0a0a0f',
                                            border: '1px solid #1e1e2e',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            color: '#f1f5f9',
                                            fontSize: '13px',
                                            width: '100%',
                                            fontFamily: "'JetBrains Mono', monospace",
                                            outline: 'none',
                                        }}
                                    />
                                </div>

                                {selectedNode.type === 'trigger' && (
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                            Trigger Source
                                        </label>
                                        <select
                                            style={{
                                                background: '#0a0a0f',
                                                border: '1px solid #1e1e2e',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                color: '#f1f5f9',
                                                fontSize: '13px',
                                                width: '100%',
                                                fontFamily: "'DM Sans', sans-serif",
                                                outline: 'none',
                                            }}
                                            defaultValue="email"
                                        >
                                            <option value="email">Email</option>
                                            <option value="webhook">Webhook</option>
                                            <option value="schedule">Schedule</option>
                                            <option value="http">HTTP Request</option>
                                        </select>
                                    </div>
                                )}

                                {selectedNode.type === 'action' && (
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                            Destination
                                        </label>
                                        <select
                                            style={{
                                                background: '#0a0a0f',
                                                border: '1px solid #1e1e2e',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                color: '#f1f5f9',
                                                fontSize: '13px',
                                                width: '100%',
                                                fontFamily: "'DM Sans', sans-serif",
                                                outline: 'none',
                                            }}
                                            defaultValue="slack"
                                        >
                                            <option value="slack">Slack</option>
                                            <option value="email">Email</option>
                                            <option value="http">HTTP Endpoint</option>
                                            <option value="webhook">Webhook</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <Button variant="primary" size="sm" style={{ width: '100%', marginTop: '24px' }}>
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};
