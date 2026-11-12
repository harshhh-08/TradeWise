import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Clock } from 'lucide-react';
import { TradeForm } from '@/components/features/TradeForm';
import { RecentTrades } from '@/components/features/RecentTrades';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Trade() {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('symbol') || 'AAPL';
  const [trades, setTrades] = useState([]);

  const loadTrades = () => {
    try {
      const saved = localStorage.getItem('tradewise_trades');
      if (saved) setTrades(JSON.parse(saved));
    } catch (_) {}
  };

  useEffect(() => {
    loadTrades();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Paper Trading Execution
        </h1>
        <p className="text-xs text-[var(--color-text-muted)]">
          Place simulated market and limit orders with real price feeds and instant execution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trade Ticket (2 cols) */}
        <div className="lg:col-span-2">
          <TradeForm initialSymbol={symbol} onTradeExecuted={loadTrades} />
        </div>

        {/* Sidebar Info (1 col) */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-sm">Paper Trading Rules</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-xs text-[var(--color-text-muted)] space-y-2.5 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] mt-1.5 shrink-0" />
                <span><strong>Instant Fill:</strong> Market orders fill immediately at current bid/ask quote.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] mt-1.5 shrink-0" />
                <span><strong>Zero Slippage:</strong> No commission fees or exchange transaction levies charged.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] mt-1.5 shrink-0" />
                <span><strong>Buying Power:</strong> Cash account enforced — short selling limited to held positions.</span>
              </div>
            </CardContent>
          </Card>

          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-3">
            <h3 className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[var(--color-brand)]" />
              <span>Analyze Before Trading</span>
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Review candlestick patterns and historical indicators on the full stock chart.
            </p>
            <Link to={`/stocks/${symbol}`} className="block">
              <Button size="sm" variant="outline" className="w-full">
                View {symbol} Full Chart
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent trades list */}
      <RecentTrades trades={trades} />
    </div>
  );
}
