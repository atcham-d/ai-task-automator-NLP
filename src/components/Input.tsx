import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

const inputBaseStyle: React.CSSProperties = {
    background: '#0a0a0f',
    border: '1px solid #1e1e2e',
    borderRadius: '12px',
    padding: '10px 14px',
    color: '#f1f5f9',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '15px',
    width: '100%',
    transition: 'all 0.2s ease',
    outline: 'none',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#94a3b8',
    marginBottom: '6px',
    fontFamily: "'DM Sans', sans-serif",
};

const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#6366f1';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)';
};

const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#1e1e2e';
    e.currentTarget.style.boxShadow = 'none';
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, style, ...props }, ref) => {
        return (
            <div>
                {label && <label style={labelStyle}>{label}</label>}
                <input
                    ref={ref}
                    style={{ ...inputBaseStyle, ...style }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, style, ...props }, ref) => {
        return (
            <div>
                {label && <label style={labelStyle}>{label}</label>}
                <textarea
                    ref={ref}
                    style={{
                        ...inputBaseStyle,
                        resize: 'vertical',
                        minHeight: '120px',
                        lineHeight: '1.5',
                        ...style,
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
