import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export function StockCard({ stock }) {
  const { symbol, name, price, changePercent = 0, change = 0 } = stock;
  const isPositive = (changePercent ?? 0) >= 0;

  return (
    <Link to={`/stocks/${symbol}`} className="block group">
      <Card className="p-3.5 hover:border-(--color-border-strong) hover:bg-(--color-bg-raised)/70 transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold font-mono text-xs text-(--color-text-primary) group-hover:text-(--color-brand) transition-colors">
                {symbol}
              </span>
              <span className="text-[10px] font-mono text-(--color-text-muted) px-1 py-0.2 rounded bg-(--color-bg-raised)">
                US
              </span>
            </div>
            <p className="text-[11px] text-(--color-text-muted) truncate max-w-[130px]">
              {name || symbol}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-bold font-mono text-(--color-text-primary)">
              {formatCurrency(price || 0)}
            </div>
            <div
              className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold ${
                isPositive ? 'text-(--color-success)' : 'text-(--color-error)'
              }`}
            >
              {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              <span>{formatPercent(changePercent).text}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
