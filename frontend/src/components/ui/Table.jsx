import { cn } from '@/lib/utils';

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-left text-xs', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead
      className={cn(
        'border-b border-border-subtle bg-surface/50',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody
      className={cn('divide-y divide-border-subtle bg-surface', className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr
      className={cn(
        'hover:bg-elevated transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }) {
  return (
    <th
      className={cn(
        'py-2.5 px-4 font-sans font-medium text-[11px] uppercase tracking-[0.05em] text-zinc-500 select-none',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }) {
  return (
    <td
      className={cn(
        'py-3 px-4 text-[13px] text-ink-primary',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}
