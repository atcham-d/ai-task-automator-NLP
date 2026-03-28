import React from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-br from-[#6366f1] to-[#a78bfa] text-[#f1f5f9] border-none shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]',
    ghost: 'bg-transparent text-[#f1f5f9] border border-[#1e1e2e] hover:border-[#6366f1]',
    danger: 'bg-red-500 text-white border-none hover:bg-red-600',
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
                inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 
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
