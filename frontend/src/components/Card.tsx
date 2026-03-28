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
            onClick={onClick}
            style={style}
            className={`
                bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6
                shadow-[0_0_0_1px_rgba(99,102,241,0.05),_0_4px_24px_rgba(0,0,0,0.4)]
                transition-all duration-300
                ${onClick ? 'cursor-pointer' : ''}
                ${hover ? 'hover:border-[#6366f1]/30 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.15),_0_8px_32px_rgba(0,0,0,0.5)]' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
};
