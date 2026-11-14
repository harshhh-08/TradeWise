import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded border border-border-subtle bg-surface text-ink-primary',
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
    <div className={cn('px-4 py-3 border-b border-border-subtle flex flex-col space-y-1', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        'text-sm font-semibold tracking-tight text-ink-primary',
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
    <p className={cn('text-xs text-ink-secondary leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'px-4 py-3 flex items-center justify-between border-t border-border-subtle bg-surface',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
