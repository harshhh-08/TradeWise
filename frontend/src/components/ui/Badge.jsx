import { cn } from '@/lib/utils';

const variantClasses = {
  default: 'bg-[var(--color-bg-raised)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
  brand: 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)] border-[var(--color-brand)]/20',
  success: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success)]/20',
  error: 'bg-[var(--color-error-subtle)] text-[var(--color-error)] border-[var(--color-error)]/20',
  warning: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning)]/20',
  info: 'bg-[var(--color-info-subtle)] text-[var(--color-info)] border-[var(--color-info)]/20',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full border tracking-wide uppercase',
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

