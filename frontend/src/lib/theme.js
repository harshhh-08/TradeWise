/**
 * TradeWise Design Token System — JS Mirror
 * Single source of truth for tokens used in JS contexts (Recharts, Framer Motion, etc.)
 *
 * Usage:
 *   import { tokens, getToken, theme } from '@/lib/theme';
 *   stroke={tokens.color.brand}
 *   const brand = getToken('--color-brand-val');
 */

/** Read a live CSS custom property value from the document root. */
export function getToken(varName) {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/**
 * Static token values — dark mode (financial terminal default).
 * For light mode equivalents, use getToken() at runtime.
 */
export const tokens = {
  color: {
    // Backgrounds
    bgBase:    '#08090d',
    bgSubtle:  '#0e1017',
    bgRaised:  '#141722',
    bgOverlay: '#1c202d',

    // Foreground
    textPrimary:   '#f1f3f9',
    textSecondary: '#c3c7d3',
    textMuted:     '#757d91',
    textDisabled:  '#444b5b',
    textInverse:   '#08090d',

    // Brand
    brand:       '#3b82f6',
    brandHover:  '#60a5fa',
    brandActive: '#2563eb',
    brandSubtle: 'rgba(59,130,246,0.12)',

    // Semantic — financial ticker palette
    success:       '#10b981',
    successSubtle: 'rgba(16,185,129,0.12)',
    warning:       '#f59e0b',
    warningSubtle: 'rgba(245,158,11,0.12)',
    error:         '#f43f5e',
    errorSubtle:   'rgba(244,63,94,0.12)',
    info:          '#38bdf8',
    infoSubtle:    'rgba(56,189,248,0.12)',

    // Borders
    border:       'rgba(255,255,255,0.07)',
    borderStrong: 'rgba(255,255,255,0.14)',
  },

  radius: {
    sm:   4,
    md:   6,
    lg:   8,
    xl:   12,
    full: 9999,
  },

  shadow: {
    xs: '0 1px 2px rgba(0,0,0,.5)',
    sm: '0 1px 3px rgba(0,0,0,.6), inset 0 1px 0 0 rgba(255,255,255,.05)',
    md: '0 4px 8px rgba(0,0,0,.5), inset 0 1px 0 0 rgba(255,255,255,.05)',
    lg: '0 12px 24px rgba(0,0,0,.6), inset 0 1px 0 0 rgba(255,255,255,.05)',
  },

  font: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Cascadia Code", "Fira Code", ui-monospace, Menlo, Consolas, monospace',
  },

  duration: {
    fast: 100,
    ui:   200,
    page: 400,
  },
};

/**
 * Recharts-ready color theme — pass as `colors` or inline stroke/fill.
 */
export const chartTheme = {
  grid:        'rgba(255,255,255,0.05)',
  axis:        tokens.color.textMuted,
  tooltip: {
    bg:     tokens.color.bgRaised,
    border: tokens.color.border,
    text:   tokens.color.textPrimary,
  },
  series: [
    tokens.color.brand,
    tokens.color.success,
    tokens.color.warning,
    tokens.color.info,
    tokens.color.error,
  ],
};

/**
 * Framer Motion variants using design-system durations.
 */
export const motionVariants = {
  fadeUp: {
    hidden:  { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: tokens.duration.ui / 1000, ease: 'easeOut' } },
    exit:    { opacity: 0, y: -4, transition: { duration: tokens.duration.fast / 1000, ease: 'easeIn' } },
  },
  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: tokens.duration.ui / 1000, ease: 'easeOut' } },
    exit:    { opacity: 0, transition: { duration: tokens.duration.fast / 1000 } },
  },
  scaleIn: {
    hidden:  { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: tokens.duration.ui / 1000, ease: [0.16, 1, 0.3, 1] } },
    exit:    { opacity: 0, scale: 0.96, transition: { duration: tokens.duration.fast / 1000 } },
  },
  slideInRight: {
    hidden:  { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0, transition: { duration: tokens.duration.ui / 1000, ease: 'easeOut' } },
    exit:    { opacity: 0, x: 16, transition: { duration: tokens.duration.fast / 1000 } },
  },
  staggerChildren: {
    visible: { transition: { staggerChildren: 0.06 } },
  },
};

export default tokens;

