import { cn } from '@/lib/utils';

/**
 * TradeWise "Linear TW" Official Brandmark
 * Minimalist, monoline Swiss geometry fusing 'T' and 'W' with precision blue focal dot.
 */
export function Logo({
  size = 28,
  className = '',
  showText = false,
  textClassName = '',
  subtitle = 'TERMINAL // PRO',
}) {
  return (
    <div className={cn('flex items-center gap-2.5 select-none group', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-all duration-200 group-hover:scale-105"
      >
        {/* Obsidian Glass Foundation Tile */}
        <rect
          width="32"
          height="32"
          rx="8"
          fill="#0A0C12"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
        {/* Top-edge Specular Hairline */}
        <line
          x1="6"
          y1="1"
          x2="26"
          y2="1"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Linear TW Monoline Vector Paths */}
        {/* Top T Crossbar */}
        <path
          d="M7.5 10H24.5"
          stroke="#F1F3F9"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Interlocking T-Stem transitioning seamlessly into W-Waveform */}
        <path
          d="M16 10V15.5L11.5 22.5L16 18L20.5 22.5L24.5 15.5"
          stroke="#F1F3F9"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Signature Precision Blue Focal Dot */}
        <circle cx="24.5" cy="10" r="2" fill="#3B82F6" />
        <circle cx="24.5" cy="10" r="3.5" stroke="#3B82F6" strokeWidth="0.8" opacity="0.45" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-bold font-mono tracking-wider text-xs text-(--color-text-primary) leading-none flex items-center gap-1.5',
              textClassName
            )}
          >
            TRADEWISE
            <span className="w-1.5 h-1.5 rounded-full bg-(--color-success) beacon-live" />
          </span>
          {subtitle && (
            <span className="text-[9px] font-mono text-(--color-text-muted) tracking-tight leading-none mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;
