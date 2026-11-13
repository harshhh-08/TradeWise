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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-mono uppercase tracking-wider">
            Execution Log
          </CardTitle>
          <span className="text-[10px] font-mono text-(--color-text-muted)">
            0 ORDERS
          </span>
        </CardHeader>
        <CardContent>
          <div className="py-7 text-center space-y-2.5">
            <div className="w-8 h-8 rounded bg-(--color-bg-raised) text-(--color-text-muted) flex items-center justify-center mx-auto">
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold font-mono text-(--color-text-primary)">
                No orders executed in this session
              </p>
              <p className="text-[11px] text-(--color-text-muted) max-w-xs mx-auto">
                Submit a paper trade order to record fills into your simulated audit ledger.
              </p>
            </div>
            <Link to="/trade">
              <Button size="sm" variant="outline" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
                Open Order Ticket
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-mono uppercase tracking-wider">
          Execution Log
        </CardTitle>
        <Link to="/portfolio" className="text-xs font-mono text-(--color-brand) hover:underline">
          View all in portfolio &rarr;
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-(--color-border)">
          {trades.slice(0, 5).map((trade, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 hover:bg-(--color-bg-raised)/50 transition-colors text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    trade.side === 'BUY'
                      ? 'bg-(--color-success-subtle) text-(--color-success)'
                      : 'bg-(--color-error-subtle) text-(--color-error)'
                  }`}
                >
                  {trade.side}
                </span>
                <div>
                  <span className="font-bold text-(--color-text-primary)">
                    {trade.symbol}
                  </span>
                  <span className="text-[11px] text-(--color-text-muted) ml-2">
                    {trade.quantity} shs @ {formatCurrency(trade.price)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-(--color-text-primary) block">
                  {formatCurrency(trade.quantity * trade.price)}
                </span>
                <span className="text-[10px] text-(--color-text-muted)">
                  {new Date(trade.executedAt || Date.now()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
