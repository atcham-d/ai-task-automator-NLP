import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Send, MessageSquare, Globe, Bell, Zap } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
    slack: <MessageSquare size={16} />,
    http: <Globe size={16} />,
    email: <Send size={16} />,
    notification: <Bell size={16} />,
    default: <Zap size={16} />,
};

function ActionNode({ data }: NodeProps) {
    const label = (data as { label?: string }).label || 'Action';
    const icon = (data as { icon?: string }).icon || 'default';

    return (
        <div
            style={{
                background: '#111118',
                border: '2px solid rgba(99,102,241,0.5)',
                borderRadius: '12px',
                padding: '12px 16px',
                minWidth: '160px',
                boxShadow: '0 0 20px rgba(99,102,241,0.15)',
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: '#6366f1',
                    width: '10px',
                    height: '10px',
                    border: '2px solid #111118',
                }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div
                    style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'rgba(99,102,241,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6366f1',
                    }}
                >
                    {iconMap[icon] || iconMap.default}
                </div>
                <span
                    style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#818cf8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}
                >
                    Action
                </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#f1f5f9' }}>{label}</div>
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: '#6366f1',
                    width: '10px',
                    height: '10px',
                    border: '2px solid #111118',
                }}
            />
        </div>
    );
}

export default memo(ActionNode);
