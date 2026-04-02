import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-[13px] font-medium text-[#94a3b8] mb-1.5 font-body">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
                        bg-[#0a0a0f] border rounded-xl px-3.5 py-2.5 text-[#f1f5f9] font-body text-[15px] w-full 
                        transition-all duration-200 outline-none
                        ${error ? 'border-red-500' : 'border-[#1e1e2e] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20'}
                        ${className}
                    `}
                    {...props}
                />
                {error && <div className="text-red-500 text-[12px] mt-1">{error}</div>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-[13px] font-medium text-[#94a3b8] mb-1.5 font-body">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`
                        bg-[#0a0a0f] border rounded-xl px-3.5 py-2.5 text-[#f1f5f9] font-body text-[15px] w-full 
                        transition-all duration-200 outline-none resize-vertical min-h-[120px] leading-relaxed
                        ${error ? 'border-red-500' : 'border-[#1e1e2e] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20'}
                        ${className}
                    `}
                    {...props}
                />
                {error && <div className="text-red-500 text-[12px] mt-1">{error}</div>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
