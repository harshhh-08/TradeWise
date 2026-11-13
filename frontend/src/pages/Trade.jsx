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
      <div className="pb-3 border-b border-(--color-border)">
        <h1 className="text-lg font-bold font-mono tracking-tight text-(--color-text-primary)">
          ORDER TRANSMISSION ENGINE
        </h1>
        <p className="text-[11px] font-mono text-(--color-text-muted)">
          Real-time Level 1 quote routing &bull; Instant cash account margin validation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Order Ticket (2 cols) */}
        <div className="lg:col-span-2">
          <TradeForm initialSymbol={symbol} onTradeExecuted={loadTrades} />
        </div>

        {/* Sidebar Info (1 col) */}
        <div className="space-y-4">
          <Card className="p-4 space-y-3 font-mono">
            <CardHeader className="p-0">
              <CardTitle className="text-xs uppercase tracking-wider">
                Execution Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-xs text-(--color-text-muted) space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-(--color-brand) mt-1.5 shrink-0" />
                <span><strong>Fill Protocol:</strong> Market orders fill instantaneously at best national bid/ask.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-(--color-brand) mt-1.5 shrink-0" />
                <span><strong>Fee Structure:</strong> 100% zero-commission simulation. No exchange levies.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-(--color-brand) mt-1.5 shrink-0" />
                <span><strong>Account Leverage:</strong> Strictly cash backed. Short sales require inventory.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4 space-y-2.5 font-mono">
            <h3 className="text-xs font-bold text-(--color-text-primary) flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-(--color-brand)" />
              <span>Full Technical Chart</span>
            </h3>
            <p className="text-[11px] text-(--color-text-muted) leading-relaxed">
              Inspect candlestick geometry, moving averages, and 52-week parameters for {symbol}.
            </p>
            <Link to={`/stocks/${symbol}`} className="block pt-1">
              <Button size="sm" variant="outline" className="w-full font-mono text-xs">
                Inspect {symbol} Chart
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Execution Ledger */}
      <RecentTrades trades={trades} />
    </div>
  );
}
