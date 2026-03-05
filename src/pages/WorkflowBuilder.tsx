import React, { useState, useCallback, useMemo } from 'react';
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
import { Save, Play, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

const initialNodes: Node[] = [
    {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { label: 'Email Received', icon: 'email' },
    },
    {
        id: 'condition-1',
        type: 'condition',
        position: { x: 230, y: 200 },
        data: { label: 'From Manager?' },
    },
    {
        id: 'action-1',
        type: 'action',
        position: { x: 100, y: 380 },
        data: { label: 'Post to Slack', icon: 'slack' },
    },
    {
        id: 'action-2',
        type: 'action',
        position: { x: 370, y: 380 },
        data: { label: 'Archive Email', icon: 'email' },
    },
];

const initialEdges: Edge[] = [
    { id: 'e-t1-c1', source: 'trigger-1', target: 'condition-1', type: 'animated' },
    { id: 'e-c1-a1', source: 'condition-1', target: 'action-1', sourceHandle: 'yes', type: 'animated' },
    { id: 'e-c1-a2', source: 'condition-1', target: 'action-2', sourceHandle: 'no', type: 'animated' },
];

const sampleJSON = {
    trigger: { type: 'email', config: { filter: 'from:manager@company.com' } },
    condition: { type: 'check_sender', field: 'from', operator: 'equals', value: 'manager@company.com' },
    actions: [
        { type: 'slack_message', channel: '#notifications', message: 'New email from manager: {{subject}}' },
        { type: 'archive_email', folder: 'Processed' },
    ],
};

export const WorkflowBuilder: React.FC = () => {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [nlInput, setNlInput] = useState('When I receive an email from my manager, post a message to Slack with the subject line. Otherwise, archive the email.');
    const [jsonVisible, setJsonVisible] = useState(true);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [workflowName, setWorkflowName] = useState('Email to Slack Notifier');

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
                    <Badge variant="info">Draft</Badge>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="ghost" size="sm">
                        <Save size={14} />
                        Save
                    </Button>
                    <Button variant="primary" size="sm">
                        <Play size={14} />
                        Activate
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
                    <Button variant="primary" style={{ width: '100%' }}>
                        <Sparkles size={14} />
                        Parse Workflow
                    </Button>

                    {/* JSON Preview */}
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
                                    {JSON.stringify(sampleJSON, null, 2)
                                        .replace(/"([^"]+)":/g, (_, key) => `"${key}":`)
                                        .split('\n')
                                        .map((line, i) => {
                                            // Simple syntax highlighting
                                            const highlighted = line
                                                .replace(/"([^"]+)"(?=:)/g, '<key>"$1"</key>')
                                                .replace(/: "([^"]+)"/g, ': <str>"$1"</str>');
                                            return (
                                                <span key={i} dangerouslySetInnerHTML={{
                                                    __html: highlighted
                                                        .replace(/<key>/g, '<span style="color:#818cf8">')
                                                        .replace(/<\/key>/g, '</span>')
                                                        .replace(/<str>/g, '<span style="color:#34d399">')
                                                        .replace(/<\/str>/g, '</span>')
                                                }} />
                                            );
                                        })
                                        .reduce((acc: React.ReactNode[], el, i) => {
                                            if (i > 0) acc.push('\n');
                                            acc.push(el);
                                            return acc;
                                        }, [])
                                    }
                                </pre>
                            </Card>
                        )}
                    </div>

                    {/* Parsed Fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Badge variant="trigger">Trigger</Badge>
                            <span style={{ fontSize: '13px', color: '#f1f5f9' }}>Email Received</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Badge variant="warning">Condition</Badge>
                            <span style={{ fontSize: '13px', color: '#f1f5f9' }}>From Manager</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Badge variant="info">Action</Badge>
                            <span style={{ fontSize: '13px', color: '#f1f5f9' }}>Post to Slack</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Badge variant="info">Action</Badge>
                            <span style={{ fontSize: '13px', color: '#f1f5f9' }}>Archive Email</span>
                        </div>
                    </div>
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
