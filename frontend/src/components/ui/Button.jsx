import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantClasses = {
  primary:
    'bg-ink-primary text-canvas hover:bg-zinc-200 active:bg-zinc-300 font-medium border border-ink-primary',
  secondary:
    'bg-surface text-ink-primary hover:bg-elevated active:bg-zinc-800 border border-border-strong font-medium',
  outline:
    'border border-border-subtle text-ink-primary hover:bg-elevated hover:border-border-strong font-medium',
  ghost:
    'text-ink-secondary hover:text-ink-primary hover:bg-elevated font-medium',
  danger:
    'bg-trade-down text-white hover:opacity-90 active:opacity-100 font-medium border border-trade-down',
  success:
    'bg-trade-up text-white hover:opacity-90 active:opacity-100 font-medium border border-trade-up',
};

const sizeClasses = {
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded',
  md: 'h-8 px-3.5 text-xs gap-2 rounded',
  lg: 'h-9.5 px-4.5 text-sm gap-2.5 rounded',
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
        'inline-flex items-center justify-center font-medium select-none cursor-pointer tracking-tight transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
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
