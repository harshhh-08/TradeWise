import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export function StockCard({ stock }) {
  const { symbol, name, price, changePercent = 0, change = 0 } = stock;
  const isPositive = (changePercent ?? 0) >= 0;

  return (
    <Link to={`/stocks/${symbol}`} className="block group">
      <Card className="p-4 hover:border-[var(--color-border-strong)] transition-all duration-150 group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm font-mono tracking-tight text-[var(--color-text-primary)]">
                {symbol}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[140px]">
              {name || symbol}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
              {formatCurrency(price || 0)}
            </div>
            <div
              className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-medium ${
                isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{formatPercent(changePercent).text}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
