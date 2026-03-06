import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Webhook, Clock, Mail, Zap } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
    webhook: <Webhook size={16} />,
    schedule: <Clock size={16} />,
    email: <Mail size={16} />,
    default: <Zap size={16} />,
};

function TriggerNode({ data }: NodeProps) {
    const label = (data as { label?: string }).label || 'Trigger';
    const icon = (data as { icon?: string }).icon || 'default';

    return (
        <div
            style={{
                background: '#111118',
                border: '2px solid rgba(167,139,250,0.5)',
                borderRadius: '12px',
                padding: '12px 16px',
                minWidth: '160px',
                boxShadow: '0 0 20px rgba(167,139,250,0.15)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div
                    style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'rgba(167,139,250,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a78bfa',
                    }}
                >
                    {iconMap[icon] || iconMap.default}
                </div>
                <span
                    style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#a78bfa',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}
                >
                    Trigger
                </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#f1f5f9' }}>{label}</div>
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: '#a78bfa',
                    width: '10px',
                    height: '10px',
                    border: '2px solid #111118',
                }}
            />
        </div>
    );
}

export default memo(TriggerNode);
