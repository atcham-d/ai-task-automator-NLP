import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    hover?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    style,
    hover = false,
    onClick,
}) => {
    return (
        <div
            className={className}
            onClick={onClick}
            style={{
                background: '#111118',
                border: '1px solid #1e1e2e',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 0 0 1px rgba(99,102,241,0.05), 0 4px 24px rgba(0,0,0,0.4)',
                transition: 'all 0.3s ease',
                cursor: onClick ? 'pointer' : undefined,
                ...style,
            }}
            onMouseEnter={(e) => {
                if (!hover) return;
                const el = e.currentTarget;
                el.style.borderColor = 'rgba(99,102,241,0.3)';
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = '0 0 0 1px rgba(99,102,241,0.15), 0 8px 32px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={(e) => {
                if (!hover) return;
                const el = e.currentTarget;
                el.style.borderColor = '#1e1e2e';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = '0 0 0 1px rgba(99,102,241,0.05), 0 4px 24px rgba(0,0,0,0.4)';
            }}
        >
            {children}
        </div>
    );
};
