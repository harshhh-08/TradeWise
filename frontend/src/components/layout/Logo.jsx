import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logoIcon from '@/assets/tradewise-icon.png';
import logoBanner from '@/assets/tradewise-logo.png';

const SIZE_MAP = {
  sm: {
    icon: 'w-6 h-6',
    text: 'text-xs',
    sub: 'text-[8px]',
    banner: 'h-6',
  },
  md: {
    icon: 'w-7 h-7',
    text: 'text-sm',
    sub: 'text-[9px]',
    banner: 'h-8',
  },
  lg: {
    icon: 'w-9 h-9',
    text: 'text-lg',
    sub: 'text-[10px]',
    banner: 'h-10',
  },
  xl: {
    icon: 'w-12 h-12',
    text: 'text-2xl',
    sub: 'text-xs',
    banner: 'h-14',
  },
};

export function Logo({
  variant = 'full', // 'icon' | 'full' | 'banner'
  size = 'md',
  showSubtitle = false,
  to,
  className,
  imgClassName,
}) {
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;

  const content = (
    <div className={cn('inline-flex items-center gap-2.5 select-none font-mono', className)}>
      {variant === 'banner' ? (
        <img
          src={logoBanner}
          alt="TradeWise - Intelligent Trading Platform"
          className={cn('w-auto object-contain', currentSize.banner, imgClassName)}
        />
      ) : variant === 'icon' ? (
        <img
          src={logoIcon}
          alt="TradeWise Icon"
          className={cn('rounded-lg object-contain shadow-xs shrink-0', currentSize.icon, imgClassName)}
        />
      ) : (
        <>
          <img
            src={logoIcon}
            alt="TradeWise Icon"
            className={cn('rounded-lg object-contain shadow-xs shrink-0', currentSize.icon, imgClassName)}
          />
          <div className="flex flex-col leading-none">
            <span className={cn('font-bold tracking-wider text-[var(--color-text-primary)]', currentSize.text)}>
              Trade<span className="text-[var(--color-success)]">Wise</span>
            </span>
            {showSubtitle && (
              <span className={cn('text-[var(--color-text-muted)] tracking-widest uppercase mt-0.5 font-semibold', currentSize.sub)}>
                Intelligent Trading Platform
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
