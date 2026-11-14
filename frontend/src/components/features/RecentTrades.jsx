import { Link } from 'react-router-dom';
import { ArrowLeftRight, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function RecentTrades({ trades = [] }) {
  if (!trades || trades.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[13px] font-medium text-ink-primary font-sans">
            Execution Ledger
          </CardTitle>
          <span className="text-[11px] font-sans text-ink-muted">
            0 orders
          </span>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center space-y-3">
            <div className="w-8 h-8 rounded bg-elevated border border-border-subtle text-ink-muted flex items-center justify-center mx-auto">
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-ink-primary font-sans">
                No orders executed in this session
              </p>
              <p className="text-xs text-ink-secondary max-w-xs mx-auto font-sans">
                Submit a paper trade order to record fills into your simulated audit ledger.
              </p>
            </div>
            <Link to="/trade">
              <Button size="sm" variant="secondary" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[13px] font-medium text-ink-primary font-sans">
          Execution Ledger
        </CardTitle>
        <Link to="/portfolio" className="text-xs font-sans text-ink-secondary hover:text-ink-primary transition-colors">
          View all in portfolio &rarr;
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border-subtle">
          {trades.slice(0, 5).map((trade, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-4 py-3 hover:bg-elevated transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-1.5 py-0.5 rounded-sm text-[11px] font-mono font-medium ${
                    trade.side === 'BUY'
                      ? 'bg-emerald-500/10 text-trade-up border border-emerald-500/20'
                      : 'bg-red-500/10 text-trade-down border border-red-500/20'
                  }`}
                >
                  {trade.side}
                </span>
                <div>
                  <span className="font-mono font-medium text-ink-primary text-[13px] tabular-nums">
                    {trade.symbol}
                  </span>
                  <span className="text-xs text-ink-secondary font-mono tabular-nums ml-2">
                    {trade.quantity} shs @ {formatCurrency(trade.price)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-medium text-ink-primary text-xs tabular-nums block">
                  {formatCurrency(trade.quantity * trade.price)}
                </span>
                <span className="text-[11px] text-ink-muted font-mono tabular-nums">
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
