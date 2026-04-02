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
import { 
    Sparkles, Loader2, X, 
    ArrowLeft, Trash2, RotateCcw, Save, Play, Pause 
} from 'lucide-react';

import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { AnimatedPage } from '../components/AnimatedPage';
import { NlInputPanel } from '../components/NlInputPanel';
import type { 
    WorkflowDefinition, 
    WorkflowResponse
} from '../types/workflow';

// Nodes
import TriggerNode from '../components/nodes/TriggerNode';
import ActionNode from '../components/nodes/ActionNode';
import ConditionNode from '../components/nodes/ConditionNode';
import AnimatedEdge from '../components/nodes/AnimatedEdge';

/* ─── Boundary Validation ─── */

/**
 * Validates the response from the NLP engine to ensure it matches the 
 * WorkflowDefinition interface before propagating it to the UI.
 */
function validateWorkflowDefinition(data: unknown): WorkflowDefinition {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid workflow definition: Response is not an object');
    }

    const workflowData = data as Record<string, unknown>;

    if (!workflowData.trigger || typeof workflowData.trigger !== 'object' || !((workflowData.trigger as Record<string, unknown>).type)) {
        throw new Error('Invalid workflow definition: Missing or invalid trigger');
    }

    if (!Array.isArray(workflowData.actions)) {
        throw new Error('Invalid workflow definition: Actions must be an array');
    }

    if (!Array.isArray(workflowData.conditions)) {
        throw new Error('Invalid workflow definition: Conditions must be an array');
    }

    const trigger = workflowData.trigger as Record<string, unknown>;

    // Narrowing to the expected shape
    return {
        trigger: {
            type: String(trigger.type),
            config: (trigger.config as Record<string, unknown>) || {}
        },
        conditions: (workflowData.conditions as Record<string, unknown>[]).map((c) => ({
            field: String(c.field || ''),
            operator: String(c.operator || ''),
            value: String(c.value || '')
        })),
        actions: (workflowData.actions as Record<string, unknown>[]).map((a) => ({
            type: String(a.type || ''),
            config: (a.config as Record<string, unknown>) || {}
        }))
    };
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
    const [nlPanelOpen, setNlPanelOpen] = useState(true);

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
            const responseData = await apiPost<unknown>('/api/parse/', { text });
            const def = validateWorkflowDefinition(responseData);
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
        <AnimatedPage className="flex flex-col h-[calc(100vh-64px)]">
            {/* Top Bar */}
            <div className="h-[60px] bg-[#0a0a0f] border-b border-[#1e1e2e] flex items-center justify-between px-4 md:px-6 shrink-0">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="shrink-0">
                        <ArrowLeft size={16} />
                    </Button>
                    <input
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        placeholder="Workflow Name"
                        className="bg-transparent border-none text-[#f1f5f9] text-base md:text-lg font-bold font-display outline-none truncate w-full max-w-[120px] sm:max-w-[150px] md:max-w-md"
                    />
                </div>

                <div className="flex gap-2 items-center">
                    {savedId && (
                        <div className="hidden sm:flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-[#ef4444] hover:bg-red-500/10">
                                <Trash2 size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleRun}>
                                <RotateCcw size={14} />
                            </Button>
                        </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving} className="flex">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        <span className="ml-2 hidden md:inline">Save</span>
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleToggleActive} className="whitespace-nowrap px-3 md:px-4">
                        {workflowStatus === 'active' ? <Pause size={14} /> : <Play size={14} />}
                        <span className="ml-2">{workflowStatus === 'active' ? 'Pause' : 'Activate'}</span>
                    </Button>
                </div>
            </div>

            {/* 3-Panel Layout */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Toggle for NL Panel */}
                {!nlPanelOpen && (
                    <button
                        onClick={() => setNlPanelOpen(true)}
                        className="fixed bottom-6 left-6 z-50 p-4 bg-[#6366f1] text-white rounded-full shadow-xl shadow-indigo-500/40 lg:hidden hover:scale-110 transition-transform active:scale-95"
                    >
                        <Sparkles size={20} />
                    </button>
                )}

                {/* Left Panel — NL Input */}
                <NlInputPanel
                    onParse={handleParse}
                    parsing={parsing}
                    parsedDef={parsedDef}
                    isOpen={nlPanelOpen}
                    onToggle={() => setNlPanelOpen(!nlPanelOpen)}
                />

                {/* Center Panel — React Flow Canvas */}
                <div className="flex-1 relative bg-[#0a0a0f]">
                    {/* Desktop Toggle Button */}
                    <button
                        onClick={() => setNlPanelOpen(!nlPanelOpen)}
                        className="hidden lg:flex absolute top-4 left-4 z-10 p-2 bg-[#111118]/80 border border-[#1e1e2e] text-[#94a3b8] hover:text-[#f1f5f9] rounded-lg backdrop-blur-md transition-all group"
                        title={nlPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
                    >
                        <Sparkles size={18} className={nlPanelOpen ? "text-[#6366f1]" : ""} />
                        {!nlPanelOpen && <span className="ml-2 text-xs font-semibold uppercase tracking-wider">Assistant</span>}
                    </button>

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
                    >
                        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.05)" />
                        <Controls className="!bg-[#111118] !border-[#1e1e2e] !fill-[#94a3b8]" />
                        <MiniMap
                            nodeColor={getMiniMapNodeColor}
                            maskColor="rgba(10,10,15,0.8)"
                            className="hidden md:block !bg-[#111118] !border-[#1e1e2e]"
                        />
                    </ReactFlow>
                </div>

                {/* Right Panel — Node Inspector */}
                <div
                    className={`
                        fixed inset-y-0 right-0 z-40 bg-[#0a0a0f] border-l border-[#1e1e2e]
                        transition-all duration-300 ease-in-out overflow-y-auto
                        md:relative md:translate-x-0
                        ${selectedNode ? 'translate-x-0 w-80 p-6' : 'translate-x-full w-0 p-0 overflow-hidden'}
                    `}
                >
                    {selectedNode && (
                        <div className="min-w-[260px]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-display text-lg font-bold text-[#f1f5f9]">
                                    Node Properties
                                </h3>
                                <button onClick={() => setSelectedNode(null)} className="p-1 md:hidden text-[#475569]">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-8">
                                <div className="space-y-3">
                                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#475569]">
                                        Type
                                    </label>
                                    <div>
                                        <Badge
                                            variant={
                                                selectedNode.type === 'trigger' ? 'trigger' :
                                                    selectedNode.type === 'condition' ? 'warning' : 'info'
                                            }
                                        >
                                            {selectedNode.type?.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#475569]">
                                        Label
                                    </label>
                                    <input
                                        value={(selectedNode.data as { label?: string }).label || ''}
                                        readOnly
                                        className="w-full bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3 text-[#f1f5f9] text-[13px] font-medium placeholder-[#475569] outline-none"
                                    />
                                </div>
                            </div>

                            <Button variant="primary" size="sm" className="w-full mt-10 opacity-50 cursor-not-allowed" disabled>
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default WorkflowBuilder;
