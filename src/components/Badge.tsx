import React from 'react';

type BadgeVariant = 'trigger' | 'success' | 'error' | 'warning' | 'info' | 'default';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
    trigger: {
        background: 'rgba(167,139,250,0.1)',
        color: '#a78bfa',
        border: '1px solid rgba(167,139,250,0.2)',
    },
    success: {
        background: 'rgba(52,211,153,0.1)',
        color: '#34d399',
        border: '1px solid rgba(52,211,153,0.2)',
    },
    error: {
        background: 'rgba(248,113,113,0.1)',
        color: '#f87171',
        border: '1px solid rgba(248,113,113,0.2)',
    },
    warning: {
        background: 'rgba(251,191,36,0.1)',
        color: '#fbbf24',
        border: '1px solid rgba(251,191,36,0.2)',
    },
    info: {
        background: 'rgba(99,102,241,0.1)',
        color: '#818cf8',
        border: '1px solid rgba(99,102,241,0.2)',
    },
    default: {
        background: 'rgba(148,163,184,0.1)',
        color: '#94a3b8',
        border: '1px solid rgba(148,163,184,0.2)',
    },
};

export const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    children,
    style,
}) => {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '9999px',
                padding: '2px 12px',
                fontSize: '11px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                lineHeight: '20px',
                whiteSpace: 'nowrap',
                ...variantStyles[variant],
                ...style,
            }}
        >
            {children}
        </span>
    );
};
