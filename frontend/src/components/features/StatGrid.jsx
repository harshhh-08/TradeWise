import { formatCurrency, formatCompact } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export function StatGrid({ stats = {} }) {
  const items = [
    { label: 'Open', value: stats.open ? formatCurrency(stats.open) : '—' },
    { label: 'Day High', value: stats.high ? formatCurrency(stats.high) : '—' },
    { label: 'Day Low', value: stats.low ? formatCurrency(stats.low) : '—' },
    { label: 'Prev Close', value: stats.previousClose ? formatCurrency(stats.previousClose) : '—' },
    { label: 'Volume', value: stats.volume ? formatCompact(stats.volume) : '—' },
    { label: '52W High', value: stats.fiftyTwoWeekHigh ? formatCurrency(stats.fiftyTwoWeekHigh) : '—' },
    { label: '52W Low', value: stats.fiftyTwoWeekLow ? formatCurrency(stats.fiftyTwoWeekLow) : '—' },
    { label: 'Market Cap', value: stats.marketCap ? formatCompact(stats.marketCap) : '—' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item, idx) => (
        <Card key={idx} className="p-3.5 space-y-1">
          <span className="text-[11px] text-[var(--color-text-muted)] font-medium block">
            {item.label}
          </span>
          <span className="text-sm font-bold font-mono text-[var(--color-text-primary)] block">
            {item.value}
          </span>
        </Card>
      ))}
    </div>
  );
}
