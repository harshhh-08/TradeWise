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
      <Card className="p-3 hover:border-border-strong hover:bg-elevated transition-colors rounded">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium font-mono text-[13px] text-ink-primary tabular-nums">
                {symbol}
              </span>
              <span className="text-[10px] font-mono text-ink-muted px-1 py-0.2 rounded-sm bg-elevated border border-border-subtle">
                NASDAQ
              </span>
            </div>
            <p className="text-xs text-ink-secondary truncate max-w-[120px] font-sans">
              {name || symbol}
            </p>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="h-6 w-14 shrink-0 overflow-hidden flex items-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 50 24">
              <polyline
                fill="none"
                stroke={isPositive ? '#10B981' : '#EF4444'}
                strokeWidth="1.6"
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
            <div className="text-[13px] font-medium font-mono text-ink-primary tabular-nums">
              {formatCurrency(price || 0)}
            </div>
            <div
              className={`inline-flex items-center gap-0.5 text-xs font-mono tabular-nums ${
                isPositive ? 'text-trade-up' : 'text-trade-down'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{formatPercent(changePercent).text}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
