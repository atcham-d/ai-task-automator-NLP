import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    type Node,
    type Edge,
    type Connection,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'react-hot-toast';
import { Play, Pause, Save, ArrowLeft, Loader2, RotateCcw, Trash2 } from 'lucide-react';

import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { AnimatedPage } from '../components/AnimatedPage';
import { NlInputPanel } from '../components/NlInputPanel';

// Nodes
import TriggerNode from '../components/nodes/TriggerNode';
import ActionNode from '../components/nodes/ActionNode';
import ConditionNode from '../components/nodes/ConditionNode';
import AnimatedEdge from '../components/edges/AnimatedEdge';

/* ─── Types ─── */

interface WorkflowDefinition {
    trigger: { type: string; config: Record<string, unknown> };
    conditions: { field: string; operator: string; value: string }[];
    actions: { type: string; config: Record<string, any> }[];
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
    const centerX = 250;
    const spacingY = 160;

    // 1. Trigger node
    const triggerType = def.trigger.type.toLowerCase();
    const triggerLabel = triggerType.charAt(0).toUpperCase() + triggerType.slice(1) + ' Trigger';
    nodes.push({
        id: 'trigger-1',
        type: 'trigger',
        position: { x: centerX, y },
        data: { label: triggerLabel, icon: triggerType },
    });
    y += spacingY;

    // 2. Condition node (supports first condition for branching)
    let lastConditionId: string | null = null;
    if (def.conditions.length > 0) {
        const cond = def.conditions[0];
        const id = 'condition-1';
        nodes.push({
            id,
            type: 'condition',
            position: { x: centerX, y },
            data: { label: `${cond.field} ${cond.operator} ${cond.value}` },
        });
        edges.push({
            id: `e-trigger-condition`,
            source: 'trigger-1',
            target: id,
            type: 'animated',
        });
        lastConditionId = id;
        y += spacingY;
    }

    // 3. Action nodes distribution
    const yesActions = def.actions.filter(a => a.config?.condition_branch === 'yes');
    const noActions = def.actions.filter(a => a.config?.condition_branch === 'no');
    const seqActions = def.actions.filter(a => !a.config?.condition_branch);

    // YES Branch (Right)
    let lastYesId = lastConditionId || 'trigger-1';
    yesActions.forEach((action, i) => {
        const id = `action-yes-${i + 1}`;
        const label = action.type.charAt(0).toUpperCase() + action.type.slice(1) + ' Action';
        nodes.push({
            id,
            type: 'action',
            position: { x: centerX + 300, y: y + i * spacingY },
            data: { label, icon: action.type.toLowerCase() },
        });
        edges.push({
            id: `e-${lastYesId}-${id}`,
            source: lastYesId!,
            target: id,
            sourceHandle: i === 0 ? 'yes' : undefined,
            type: 'animated',
        });
        lastYesId = id;
    });

    // NO Branch (Left)
    let lastNoId = lastConditionId || 'trigger-1';
    noActions.forEach((action, i) => {
        const id = `action-no-${i + 1}`;
        const label = action.type.charAt(0).toUpperCase() + action.type.slice(1) + ' Action';
        nodes.push({
            id,
            type: 'action',
            position: { x: centerX - 300, y: y + i * spacingY },
            data: { label, icon: action.type.toLowerCase() },
        });
        edges.push({
            id: `e-${lastNoId}-${id}`,
            source: lastNoId!,
            target: id,
            sourceHandle: i === 0 ? 'no' : undefined,
            type: 'animated',
        });
        lastNoId = id;
    });

    // Sequential Branch (Center)
    let lastSeqId = lastConditionId || 'trigger-1';
    seqActions.forEach((action, i) => {
        const id = `action-seq-${i + 1}`;
        const label = action.type.charAt(0).toUpperCase() + action.type.slice(1) + ' Action';
        
        const offsetY = (yesActions.length > 0 || noActions.length > 0) 
            ? Math.max(yesActions.length, noActions.length) * spacingY 
            : 0;

        nodes.push({
            id,
            type: 'action',
            position: { x: centerX, y: y + offsetY + i * spacingY },
            data: { label, icon: action.type.toLowerCase() },
        });
        edges.push({
            id: `e-${lastSeqId}-${id}`,
            source: lastSeqId,
            target: id,
            type: 'animated',
        });
        lastSeqId = id;
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
                if (wf.description) setNlInput(wf.description);
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

    const handleParse = useCallback(async (text: string) => {
        setParsing(true);
        try {
            setNlInput(text);
            const def = await apiPost<WorkflowDefinition>('/api/parse/', { text });
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
    }, [setNodes, setEdges]);

    const getMiniMapNodeColor = useCallback((node: Node) => {
        if (node.type === 'trigger') return '#a78bfa';
        if (node.type === 'condition') return '#fbbf24';
        return '#6366f1';
    }, []);

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
                    description: nlInput,
                    definition: parsedDef,
                });
                toast.success('Workflow updated');
            } else {
                const created = await apiPost<WorkflowResponse>('/api/workflows/', {
                    name: workflowName,
                    description: nlInput,
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
    }, [parsedDef, savedId, workflowName, nlInput, navigate]);

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

    const handleRun = useCallback(async () => {
        if (!savedId) return;
        try {
            await apiPost(`/api/workflows/${savedId}/run`);
            toast.success('Workflow run triggered');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Run failed');
        }
    }, [savedId]);

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
                    height: '60px',
                    background: '#0a0a0f',
                    borderBottom: '1px solid #1e1e2e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={16} />
                    </Button>
                    <input
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        placeholder="Workflow Name"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#f1f5f9',
                            fontSize: '18px',
                            fontWeight: 700,
                            fontFamily: "'Syne', sans-serif",
                            outline: 'none',
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {savedId && (
                        <>
                            <Button variant="ghost" size="sm" onClick={handleDelete} style={{ color: '#ef4444' }}>
                                <Trash2 size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleRun}>
                                <RotateCcw size={14} />
                            </Button>
                        </>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                        Save
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleToggleActive}>
                        {workflowStatus === 'active' ? <Pause size={14} /> : <Play size={14} />}
                        {workflowStatus === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                </div>
            </div>

            {/* 3-Panel Layout */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Panel — NL Input */}
                <NlInputPanel
                    onParse={handleParse}
                    parsing={parsing}
                    parsedDef={parsedDef}
                />

                {/* Center Panel — React Flow Canvas */}
                <div style={{ flex: 1, position: 'relative' }}>
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
                            nodeColor={getMiniMapNodeColor}
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
                            </div>

                            <Button variant="primary" size="sm" style={{ width: '100%', marginTop: '24px' }} disabled>
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};
