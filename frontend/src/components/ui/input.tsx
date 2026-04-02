import * as React from 'react';
import { cn } from '../../lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-4 py-2 text-sm text-[#f1f5f9] shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#475569] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6366f1] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
