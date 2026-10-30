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
    ArrowLeft, Trash2, Save, Play, Pause 
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

/** Returns `value` as a config object, treating a missing config as empty and rejecting anything else. */
function validateConfig(value: unknown, label: string): Record<string, unknown> {
    if (value === undefined || value === null) return {};
    if (typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label} config must be an object`);
    }
    return value as Record<string, unknown>;
}

function requireNonEmptyString(value: unknown, message: string): string {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(message);
    }
    return value;
}

/**
 * Validates a workflow definition (from the NLP engine or a saved workflow)
 * against the WorkflowDefinition interface before propagating it to the UI.
 */
function validateWorkflowDefinition(data: unknown): WorkflowDefinition {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Invalid workflow definition: Response is not a valid object');
    }

    const workflowData = data as Record<string, unknown>;

    // 1. Trigger Validation
    const trigger = workflowData.trigger;
    if (!trigger || typeof trigger !== 'object' || Array.isArray(trigger)) {
        throw new Error('Workflow is missing a trigger definition');
    }
    const triggerRecord = trigger as Record<string, unknown>;
    const triggerType = requireNonEmptyString(
        triggerRecord.type,
        'Trigger must have a non-empty type (e.g., "trello", "github")'
    );

    // 2. Actions Validation
    if (!Array.isArray(workflowData.actions)) {
        throw new Error('Workflow actions must be an array');
    }

    const validatedActions = workflowData.actions.map((a, i) => {
        if (!a || typeof a !== 'object' || Array.isArray(a)) {
            throw new Error(`Action at index ${i} is invalid`);
        }
        const action = a as Record<string, unknown>;
        return {
            type: requireNonEmptyString(action.type, `Action at index ${i} is missing a required type`),
            config: validateConfig(action.config, `Action at index ${i}`),
        };
    });

    // 3. Conditions Validation (saved workflows may omit the array entirely)
    const rawConditions = workflowData.conditions ?? [];
    if (!Array.isArray(rawConditions)) {
        throw new Error('Workflow conditions must be an array');
    }

    const validatedConditions = rawConditions.map((c, i) => {
        if (!c || typeof c !== 'object' || Array.isArray(c)) {
            throw new Error(`Condition at index ${i} is invalid`);
        }
        const cond = c as Record<string, unknown>;
        const value = cond.value;
        if (!['string', 'number', 'boolean'].includes(typeof value)) {
            throw new Error(`Condition at index ${i} must have a string, number, or boolean value`);
        }
        return {
            field: requireNonEmptyString(cond.field, `Condition at index ${i} is missing a field`),
            operator: requireNonEmptyString(cond.operator, `Condition at index ${i} is missing an operator`),
            value: String(value),
        };
    });

    return {
        trigger: {
            type: triggerType.toLowerCase(),
            config: validateConfig(triggerRecord.config, 'Trigger'),
        },
        actions: validatedActions,
        conditions: validatedConditions
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
    const [parseError, setParseError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [savedId, setSavedId] = useState<string | null>(workflowId && workflowId !== 'new' ? workflowId : null);
    // On phones the assistant panel overlays the canvas and toolbar, so start it closed there
    const [nlPanelOpen, setNlPanelOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches);

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
                if (wf.definition?.trigger) {
                    const def = validateWorkflowDefinition(wf.definition);
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
        setParseError(null);
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
            setParsedDef(null);
            setSelectedNode(null);
            setNodes([]);
            setEdges([]);
            const msg = err instanceof Error ? err.message : 'Failed to parse workflow';
            setParseError(msg);
            toast.error(msg);
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
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="shrink-0" aria-label="Back to dashboard">
                        <ArrowLeft size={20} aria-hidden="true" />
                    </Button>
                    <input
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        placeholder="Workflow Name"
                        aria-label="Workflow name"
                        className="bg-transparent border-none text-[#f1f5f9] text-base md:text-lg font-bold font-display outline-none truncate w-full max-w-[120px] sm:max-w-[150px] md:max-w-md"
                    />
                </div>

                <div className="flex gap-2 items-center">
                    {savedId && (
                        <div className="hidden sm:flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-[#ef4444] hover:bg-red-500/10" aria-label="Delete workflow" title="Delete workflow">
                                <Trash2 size={20} aria-hidden="true" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleRun} title="Run Workflow" aria-label="Run workflow">
                                <Play size={20} aria-hidden="true" />
                            </Button>
                        </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving} className="flex" aria-label="Save workflow">
                        {saving ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <Save size={20} aria-hidden="true" />}
                        <span className="ml-2 hidden md:inline">Save</span>
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleToggleActive} className="whitespace-nowrap px-3 md:px-4">
                        {workflowStatus === 'active' ? <Pause size={20} /> : <Play size={20} />}
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
                        aria-label="Open AI Assistant"
                        className="fixed bottom-6 right-6 z-50 p-4 bg-[#6366f1] text-white rounded-full shadow-xl shadow-indigo-500/40 md:hidden hover:scale-110 transition-transform active:scale-95"
                    >
                        <Sparkles size={20} aria-hidden="true" />
                    </button>
                )}

                {/* Left Panel — NL Input */}
                <NlInputPanel
                    onParse={handleParse}
                    parsing={parsing}
                    parsedDef={parsedDef}
                    parseError={parseError}
                    isOpen={nlPanelOpen}
                    onToggle={() => setNlPanelOpen(!nlPanelOpen)}
                />

                {/* Center Panel — React Flow Canvas */}
                <div className="flex-1 relative bg-[#0a0a0f]">
                    {/* Desktop Toggle Button */}
                    <button
                        onClick={() => setNlPanelOpen(!nlPanelOpen)}
                        className="hidden md:flex absolute top-4 left-4 z-10 p-2 bg-[#111118]/80 border border-[#1e1e2e] text-[#94a3b8] hover:text-[#f1f5f9] rounded-lg backdrop-blur-md transition-all group"
                        title={nlPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
                        aria-label={nlPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
                        aria-expanded={nlPanelOpen}
                    >
                        <Sparkles size={20} className={nlPanelOpen ? "text-[#6366f1]" : ""} aria-hidden="true" />
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
                        <Controls className="bg-[#111118]! border-[#1e1e2e]! fill-[#94a3b8]!" />
                        <MiniMap
                            nodeColor={getMiniMapNodeColor}
                            maskColor="rgba(10,10,15,0.8)"
                            className="hidden md:block bg-[#111118]! border-[#1e1e2e]!"
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
                                <button onClick={() => setSelectedNode(null)} className="p-1 md:hidden text-[#475569]" aria-label="Close node properties">
                                    <X size={20} aria-hidden="true" />
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
