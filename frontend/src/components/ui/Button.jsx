import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantClasses = {
  primary:
    'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] active:bg-[var(--color-brand-active)] shadow-xs font-semibold',
  secondary:
    'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-strong)] border border-[var(--color-border)]',
  outline:
    'border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-raised)] hover:border-[var(--color-border-strong)]',
  ghost:
    'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-raised)]',
  danger:
    'bg-[var(--color-error)] text-white hover:opacity-90 active:opacity-100 shadow-xs font-semibold',
  success:
    'bg-[var(--color-success)] text-white hover:opacity-90 active:opacity-100 shadow-xs font-semibold',
};

const sizeClasses = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-8 px-3.5 text-xs gap-2',
  lg: 'h-10 px-4 text-sm gap-2',
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
        'inline-flex items-center justify-center font-medium rounded-md transition-colors select-none cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
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
