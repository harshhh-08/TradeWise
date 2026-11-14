import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

function getSparklinePoints(symbol, isPositive) {
  const seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const base = isPositive ? [8, 12, 10, 16, 14, 20] : [20, 15, 17, 11, 13, 8];
  return base.map((v, i) => Math.max(4, Math.min(22, v + ((seed * (i + 1)) % 5) - 2)));
}

export function StockCard({ stock }) {
  const { symbol, name, price, changePercent = 0 } = stock;
  const isPositive = (changePercent ?? 0) >= 0;
  const points = getSparklinePoints(symbol, isPositive);

  return (
    <Link to={`/stocks/${symbol}`} className="block group">
      <Card className="p-3.5 hover:border-(--color-brand)/40 hover:bg-(--color-bg-raised)/80 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold font-mono text-xs text-(--color-text-primary) group-hover:text-(--color-brand) transition-colors">
                {symbol}
              </span>
              <span className="text-[9px] font-mono text-(--color-text-muted) px-1 py-0.2 rounded bg-(--color-bg-raised)">
                NASDAQ
              </span>
            </div>
            <p className="text-[11px] text-(--color-text-muted) truncate max-w-[110px]">
              {name || symbol}
            </p>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="h-6 w-14 shrink-0 overflow-hidden flex items-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 50 24">
              <polyline
                fill="none"
                stroke={isPositive ? '#10b981' : '#f43f5e'}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points
                  .map((val, i) => {
                    const min = Math.min(...points);
                    const max = Math.max(...points);
                    const y = 20 - ((val - min) / ((max - min) || 1)) * 16;
                    const x = (i / (points.length - 1)) * 50;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            </svg>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-bold font-mono text-(--color-text-primary) tabular">
              {formatCurrency(price || 0)}
            </div>
            <div
              className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold ${
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
