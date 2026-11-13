import { formatCurrency, formatCompact } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export function StatGrid({ stats = {} }) {
  const items = [
    { label: 'Day Open', value: stats.open ? formatCurrency(stats.open) : '—' },
    { label: 'Day High', value: stats.high ? formatCurrency(stats.high) : '—' },
    { label: 'Day Low', value: stats.low ? formatCurrency(stats.low) : '—' },
    { label: 'Prev Close', value: stats.previousClose ? formatCurrency(stats.previousClose) : '—' },
    { label: 'Volume (24h)', value: stats.volume ? formatCompact(stats.volume) : '—' },
    { label: '52-Wk High', value: stats.fiftyTwoWeekHigh ? formatCurrency(stats.fiftyTwoWeekHigh) : '—' },
    { label: '52-Wk Low', value: stats.fiftyTwoWeekLow ? formatCurrency(stats.fiftyTwoWeekLow) : '—' },
    { label: 'Market Cap', value: stats.marketCap ? formatCompact(stats.marketCap) : '—' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
      {items.map((item, idx) => (
        <Card key={idx} className="p-3 space-y-0.5">
          <span className="text-[10px] text-(--color-text-muted) uppercase tracking-wider block">
            {item.label}
          </span>
          <span className="text-xs font-bold text-(--color-text-primary) block">
            {item.value}
          </span>
        </Card>
      ))}
    </div>
  );
}
