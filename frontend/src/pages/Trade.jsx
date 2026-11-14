import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BarChart2, ShieldCheck, Clock } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink-primary font-sans">
            Order Execution
          </h1>
          <p className="text-xs text-ink-secondary font-sans">
            Real-time Level 1 quote routing • Instant cash validation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Order Ticket (2 cols) */}
        <div className="lg:col-span-2">
          <TradeForm initialSymbol={symbol} onTradeExecuted={loadTrades} />
        </div>

        {/* Sidebar Info (1 col) */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] font-medium text-ink-primary font-sans">
                Execution Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-ink-secondary space-y-2 leading-relaxed font-sans">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-muted mt-1.5 shrink-0" />
                <span><strong className="text-ink-primary">Fill Protocol:</strong> Market orders fill instantaneously at best national bid/ask.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-muted mt-1.5 shrink-0" />
                <span><strong className="text-ink-primary">Fee Structure:</strong> 100% zero-commission simulation. No exchange levies.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-muted mt-1.5 shrink-0" />
                <span><strong className="text-ink-primary">Account Leverage:</strong> Strictly cash backed. Short sales require inventory.</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] font-medium text-ink-primary font-sans flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-ink-secondary" />
                <span>Technical Chart</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-sans">
              <p className="text-xs text-ink-secondary leading-relaxed">
                Inspect candlestick geometry, moving averages, and 52-week parameters for {symbol}.
              </p>
              <Link to={`/stocks/${symbol}`} className="block">
                <Button size="sm" variant="secondary" className="w-full">
                  Inspect {symbol} Chart
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Execution Ledger */}
      <RecentTrades trades={trades} />
    </div>
  );
}
