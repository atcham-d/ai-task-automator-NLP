import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6366f1] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] disabled:active:scale-100',
  {
    variants: {
      variant: {
        default:
          'bg-[#6366f1] text-[#f1f5f9] shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f46e5]',
        destructive:
          'bg-red-500 text-slate-50 shadow-sm hover:bg-red-500/90',
        outline:
          'border border-[#1e1e2e] bg-transparent shadow-sm hover:bg-white/5 hover:text-[#f1f5f9]',
        secondary:
          'bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-100/80',
        ghost: 'hover:bg-white/5 hover:text-[#f1f5f9]',
        link: 'text-slate-900 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
