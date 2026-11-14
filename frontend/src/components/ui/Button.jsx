import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantClasses = {
  primary:
    'bg-(--color-brand) text-white hover:bg-(--color-brand-hover) active:bg-(--color-brand-active) font-semibold relative overflow-hidden btn-tactile shadow-[0_1px_3px_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.28)] hover:shadow-[0_4px_16px_-2px_var(--color-brand),inset_0_1px_0_0_rgba(255,255,255,0.38)]',
  secondary:
    'bg-(--color-bg-raised) text-(--color-text-primary) hover:bg-(--color-bg-subtle) border border-(--color-border) hover:border-(--color-border-strong) font-medium btn-tactile hover:shadow-xs',
  outline:
    'border border-(--color-border) text-(--color-text-primary) hover:bg-(--color-bg-raised) hover:border-(--color-border-strong) font-medium transition-all',
  ghost:
    'text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-raised)/80 transition-colors',
  danger:
    'bg-(--color-error) text-white hover:opacity-95 active:opacity-100 font-semibold relative overflow-hidden btn-tactile shadow-[0_1px_3px_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:shadow-[0_4px_16px_-2px_var(--color-error)]',
  success:
    'bg-(--color-success) text-white hover:opacity-95 active:opacity-100 font-semibold relative overflow-hidden btn-tactile shadow-[0_1px_3px_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:shadow-[0_4px_16px_-2px_var(--color-success)]',
};

const sizeClasses = {
  sm: 'h-7.5 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-4 text-xs gap-2 rounded-md',
  lg: 'h-10.5 px-5 text-sm gap-2.5 rounded-lg',
};

export const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    leftIcon = null,
    rightIcon = null,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all select-none cursor-pointer tracking-tight active:scale-[0.985]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}

      <span>{children}</span>

      {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
});
