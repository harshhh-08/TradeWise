import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantClasses = {
  primary:
    'bg-(--color-brand) text-white hover:bg-(--color-brand-hover) active:bg-(--color-brand-active) shadow-xs font-semibold',
  secondary:
    'bg-(--color-bg-raised) text-(--color-text-primary) hover:bg-(--color-border-strong) border border-(--color-border)',
  outline:
    'border border-(--color-border) text-(--color-text-primary) hover:bg-(--color-bg-raised) hover:border-(--color-border-strong)',
  ghost:
    'text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-raised)',
  danger:
    'bg-(--color-error) text-white hover:opacity-90 active:opacity-100 shadow-xs font-semibold',
  success:
    'bg-(--color-success) text-white hover:opacity-90 active:opacity-100 shadow-xs font-semibold',
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
