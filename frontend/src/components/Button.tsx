import React from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-r from-primary to-primary-container text-on-surface border-none shadow-[inset_0_2px_8px_rgba(255,255,255,0.1)] hover:brightness-110',
    ghost: 'bg-transparent text-primary border border-outline-variant hover:bg-surface-container-highest/30',
    danger: 'bg-tertiary text-surface border-none hover:brightness-110',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-4 py-1.5 text-[13px]',
    md: 'px-6 py-2.5 text-[15px]',
    lg: 'px-8 py-3.5 text-[16px]',
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ...props
}) => {
    return (
        <button
            className={`
                inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 
                cursor-pointer active:scale-95 hover:-translate-y-0.5 whitespace-nowrap font-body
                ${variantClasses[variant]}
                ${sizeClasses[size]}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
};
