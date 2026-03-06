import React from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
        color: '#f1f5f9',
        border: 'none',
        boxShadow: '0 0 20px rgba(99,102,241,0.3)',
    },
    ghost: {
        background: 'transparent',
        color: '#f1f5f9',
        border: '1px solid #1e1e2e',
    },
    danger: {
        background: '#f87171',
        color: '#fff',
        border: 'none',
    },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: '6px 16px', fontSize: '13px' },
    md: { padding: '10px 24px', fontSize: '15px' },
    lg: { padding: '14px 32px', fontSize: '16px' },
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    style,
    className = '',
    ...props
}) => {
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            style={{
                borderRadius: '9999px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                ...variantStyles[variant],
                ...sizeStyles[size],
                ...style,
            }}
            onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'scale(1.02) translateY(-1px)';
                if (variant === 'primary') {
                    el.style.boxShadow = '0 0 30px rgba(99,102,241,0.5)';
                } else if (variant === 'ghost') {
                    el.style.borderColor = '#6366f1';
                }
            }}
            onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'scale(1) translateY(0)';
                if (variant === 'primary') {
                    el.style.boxShadow = '0 0 20px rgba(99,102,241,0.3)';
                } else if (variant === 'ghost') {
                    el.style.borderColor = '#1e1e2e';
                }
            }}
            {...props}
        >
            {children}
        </button>
    );
};
