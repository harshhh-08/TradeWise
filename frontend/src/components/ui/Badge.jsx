import { cn } from '@/lib/utils';

const variantClasses = {
  default: 'bg-(--color-bg-raised) text-(--color-text-secondary) border-(--color-border)',
  brand: 'bg-(--color-brand-subtle) text-(--color-brand) border-(--color-brand)/20',
  success: 'bg-(--color-success-subtle) text-(--color-success) border-(--color-success)/20',
  error: 'bg-(--color-error-subtle) text-(--color-error) border-(--color-error)/20',
  warning: 'bg-(--color-warning-subtle) text-(--color-warning) border-(--color-warning)/20',
  info: 'bg-(--color-info-subtle) text-(--color-info) border-(--color-info)/20',
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

