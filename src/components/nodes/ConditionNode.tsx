import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

function ConditionNode({ data }: NodeProps) {
    const label = (data as { label?: string }).label || 'Condition';

    return (
        <div
            style={{
                background: '#111118',
                border: '2px solid rgba(251,191,36,0.5)',
                borderRadius: '12px',
                padding: '12px 16px',
                minWidth: '160px',
                boxShadow: '0 0 20px rgba(251,191,36,0.1)',
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: '#fbbf24',
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
                        background: 'rgba(251,191,36,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fbbf24',
                    }}
                >
                    <GitBranch size={16} />
                </div>
                <span
                    style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#fbbf24',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}
                >
                    Condition
                </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#f1f5f9' }}>{label}</div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="yes"
                style={{
                    background: '#34d399',
                    width: '10px',
                    height: '10px',
                    border: '2px solid #111118',
                    left: '30%',
                }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="no"
                style={{
                    background: '#f87171',
                    width: '10px',
                    height: '10px',
                    border: '2px solid #111118',
                    left: '70%',
                }}
            />
        </div>
    );
}

export default memo(ConditionNode);
