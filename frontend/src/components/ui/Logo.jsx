import { cn } from '@/lib/utils';

/**
 * TradeWise Official "Linear TW." Brandmark
 * Exact recreation of the wireframe hollow-stroke T and W geometric monogram
 * with the signature electric blue period dot and tracked Swiss wordmark.
 */
export function Logo({
  size = 32,
  layout = 'horizontal', // 'horizontal' | 'stacked' | 'icon-only'
  className = '',
  textClassName = '',
}) {
  const icon = (
    <svg
      width={size}
      height={(size * 64) / 76}
      viewBox="0 0 76 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
    >
      {/* Hollow Outline 'T' */}
      <path
        d="M 5 6 H 42 V 14 H 28 V 56 H 19 V 14 H 5 Z"
        fill="transparent"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
      />

      {/* Hollow Outline Interlocking 'W' Wireframe */}
      <path
        d="M 23 6 L 35 56 L 47 18 L 57 56 L 70 6 H 61.5 L 54 38 L 47 12 L 39 42 L 30 6 H 23 Z"
        fill="transparent"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
      />

      {/* Signature Precision Electric Blue Dot */}
      <circle cx="70" cy="54" r="3.6" fill="#2563EB" />
    </svg>
  );

  if (layout === 'icon-only') {
    return <div className={cn('inline-flex items-center group', className)}>{icon}</div>;
  }

  if (layout === 'stacked') {
    return (
      <div className={cn('flex flex-col items-center gap-3 select-none group', className)}>
        {icon}
        <span
          className={cn(
            'font-black font-sans tracking-[0.28em] text-sm text-white leading-none uppercase pl-[0.28em]',
            textClassName
          )}
        >
          TRADEWISE
        </span>
      </div>
    );
  }

  // Default: 'horizontal'
  return (
    <div className={cn('flex items-center gap-2.5 select-none group', className)}>
      {icon}
      <div className="flex flex-col">
        <span
          className={cn(
            'font-black font-sans tracking-[0.24em] text-xs text-white leading-none uppercase pl-[0.24em]',
            textClassName
          )}
        >
          TRADEWISE
        </span>
        <span className="text-[8px] font-mono tracking-[0.16em] text-ink-muted uppercase leading-none mt-1">
          INSTITUTIONAL DESK
        </span>
      </div>
    </div>
  );
}

export default Logo;
