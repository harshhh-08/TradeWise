import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-(--radius-md) bg-(--color-bg-raised)/80',
        className
      )}
      {...props}
    />
  );
}

