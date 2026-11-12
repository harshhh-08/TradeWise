import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] shadow-xs transition-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pb-3 flex flex-col space-y-1', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        'text-base font-semibold tracking-tight text-[var(--color-text-primary)]',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-xs text-[var(--color-text-muted)] leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pt-2', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'p-5 pt-0 flex items-center justify-between border-t border-[var(--color-border)] mt-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

