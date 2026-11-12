import { Link } from 'react-router-dom';
import { ArrowLeftRight, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function RecentTrades({ trades = [] }) {
  if (!trades || trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-bg-raised)] text-[var(--color-text-muted)] flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                No simulated trades yet
              </p>
              <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto">
                Test your market strategies risk-free. Pick a stock and place a paper order.
              </p>
            </div>
            <Link to="/trade">
              <Button size="sm" variant="outline" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
                Execute Paper Order
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Recent Activity</CardTitle>
        <Link to="/portfolio" className="text-xs text-[var(--color-brand)] hover:underline">
          View all in portfolio
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[var(--color-border)]">
          {trades.slice(0, 5).map((trade, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 hover:bg-[var(--color-bg-raised)]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant={trade.side === 'BUY' ? 'success' : 'error'}
                  size="sm"
                >
                  {trade.side}
                </Badge>
                <div>
                  <span className="font-bold font-mono text-xs text-[var(--color-text-primary)]">
                    {trade.symbol}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] ml-2">
                    {trade.quantity} shares @ {formatCurrency(trade.price)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-semibold text-[var(--color-text-primary)] block">
                  {formatCurrency(trade.quantity * trade.price)}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {new Date(trade.executedAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
