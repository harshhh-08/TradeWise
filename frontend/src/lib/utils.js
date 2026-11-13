import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Usage: cn('p-4 text-red-500', condition && 'text-blue-500', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency (USD, INR, etc.).
 * Usage: formatCurrency(12345.67, 'INR') → "₹12,345.67"
 */
export function formatCurrency(value, currency = 'USD') {
  const safeCurrency = currency || 'USD';
  const locale = safeCurrency === 'INR' ? 'en-IN' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  } catch {
    return `${safeCurrency === 'INR' ? '₹' : '$'}${(Number(value) || 0).toFixed(2)}`;
  }
}

/**
 * Format a number with +/- sign and color hint.
 * Returns { text, isPositive }
 */
export function formatChange(value) {
  const isPositive = value >= 0;
  const sign = isPositive ? '+' : '';
  return {
    text: `${sign}${value.toFixed(2)}`,
    isPositive,
  };
}

/**
 * Format a percentage with +/- sign.
 */
export function formatPercent(value) {
  const isPositive = value >= 0;
  const sign = isPositive ? '+' : '';
  return {
    text: `${sign}${value.toFixed(2)}%`,
    isPositive,
  };
}

/**
 * Format large numbers compactly (e.g., 1.2M, 45.3K).
 */
export function formatCompact(value) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

