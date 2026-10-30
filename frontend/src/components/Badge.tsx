import React from 'react';

type BadgeVariant = 'trigger' | 'success' | 'error' | 'warning' | 'info' | 'default';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    trigger: 'bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/20',
    success: 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20',
    error: 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20',
    warning: 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20',
    info: 'bg-[#6366f1]/10 text-[#818cf8] border-[#6366f1]/20',
    default: 'bg-[#94a3b8]/10 text-[#94a3b8] border-[#94a3b8]/20',
};

export const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    children,
    className = '',
}) => {
    return (
        <span
            className={`
                inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium leading-5 whitespace-nowrap border
                ${variantClasses[variant]}
                ${className}
            `}
        >
            {children}
        </span>
    );
};
