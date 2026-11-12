import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  ArrowLeftRight,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { StockChart } from '@/components/features/StockChart';
import { StatGrid } from '@/components/features/StatGrid';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

function generateFallbackCandles(basePrice = 150) {
  const points = [];
  let p = basePrice * 0.95;
  const now = new Date();

  for (let i = 24; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600 * 1000);
    const variation = (Math.random() - 0.48) * (basePrice * 0.015);
    p = Math.max(1, p + variation);
    points.push({
      date: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open: +(p - Math.random() * 0.5).toFixed(2),
      high: +(p + Math.random() * 0.8).toFixed(2),
      low: +(p - Math.random() * 0.8).toFixed(2),
      close: +p.toFixed(2),
      volume: Math.floor(Math.random() * 500000) + 100000,
    });
  }
  return points;
}

export default function StockDetail() {
  const { symbol = 'AAPL' } = useParams();
  const upperSymbol = symbol.toUpperCase();

  const [quote, setQuote] = useState(null);
  const [candles, setCandles] = useState([]);
  const [timeframe, setTimeframe] = useState('1D');
  const [isLoading, setIsLoading] = useState(true);

  // Quick Trade panel state
  const { walletBalance, updateWalletCash } = useAuth();
  const [tradeSide, setTradeSide] = useState('BUY');
  const [shares, setShares] = useState(10);
  const [isTradeSuccess, setIsTradeSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setIsTradeSuccess(false);

      try {
        const quoteRes = await api.get(`/api/stocks/${upperSymbol}`);
        if (isMounted && quoteRes.data?.stock) {
          setQuote(quoteRes.data.stock);
        }
      } catch (_) {
        if (isMounted) {
          setQuote({
            symbol: upperSymbol,
            name: `${upperSymbol} Inc.`,
            price: 224.23,
            change: 4.05,
            changePercent: 1.84,
            open: 221.10,
            high: 225.40,
            low: 220.80,
            previousClose: 220.18,
            volume: 48920100,
            fiftyTwoWeekHigh: 237.23,
            fiftyTwoWeekLow: 164.08,
            marketCap: 3450000000000,
          });
        }
      }

      try {
        const candleRes = await api.get(`/api/stocks/${upperSymbol}/candles?timeframe=${timeframe}`);
        if (isMounted && candleRes.data?.candles && candleRes.data.candles.length > 0) {
          setCandles(candleRes.data.candles);
        } else if (isMounted) {
          setCandles(generateFallbackCandles(quote?.price || 200));
        }
      } catch (_) {
        if (isMounted) {
          setCandles(generateFallbackCandles(quote?.price || 200));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [upperSymbol, timeframe]);

  const currentPrice = quote?.price || 224.23;
  const isPositive = (quote?.changePercent ?? 0) >= 0;
  const estimatedTotal = shares * currentPrice;

  const handleExecuteTrade = (e) => {
    e.preventDefault();
    if (shares <= 0) return;

    if (tradeSide === 'BUY') {
      if (estimatedTotal > walletBalance) {
        alert('Insufficient virtual buying power.');
        return;
      }
      updateWalletCash(walletBalance - estimatedTotal);
    } else {
      updateWalletCash(walletBalance + estimatedTotal);
    }

    // Save trade to local storage history
    try {
      const existingTrades = JSON.parse(localStorage.getItem('tradewise_trades') || '[]');
      const newTrade = {
        symbol: upperSymbol,
        side: tradeSide,
        quantity: Number(shares),
        price: currentPrice,
        executedAt: new Date().toISOString(),
      };
      localStorage.setItem('tradewise_trades', JSON.stringify([newTrade, ...existingTrades]));

      // Update positions
      const existingPos = JSON.parse(localStorage.getItem('tradewise_positions') || '[]');
      const idx = existingPos.findIndex((p) => p.symbol === upperSymbol);
      if (tradeSide === 'BUY') {
        if (idx >= 0) {
          const cur = existingPos[idx];
          const newQty = cur.quantity + Number(shares);
          const newAvg = (cur.quantity * cur.avgCost + estimatedTotal) / newQty;
          existingPos[idx] = { ...cur, quantity: newQty, avgCost: newAvg };
        } else {
          existingPos.push({ symbol: upperSymbol, quantity: Number(shares), avgCost: currentPrice });
        }
      } else if (idx >= 0) {
        const cur = existingPos[idx];
        const newQty = Math.max(0, cur.quantity - Number(shares));
        if (newQty === 0) existingPos.splice(idx, 1);
        else existingPos[idx] = { ...cur, quantity: newQty };
      }
      localStorage.setItem('tradewise_positions', JSON.stringify(existingPos));
    } catch (_) {}

    setIsTradeSuccess(true);
    setTimeout(() => setIsTradeSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/markets"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Markets</span>
        </Link>
      </div>

      {/* Stock Header */}
      {isLoading && !quote ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold font-mono tracking-tight text-[var(--color-text-primary)]">
                {upperSymbol}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-bg-raised)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                NASDAQ
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">{quote?.name || upperSymbol}</p>
          </div>

          <div className="flex items-end sm:items-center gap-4">
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--color-text-primary)]">
                {formatCurrency(currentPrice)}
              </div>
              <div
                className={`inline-flex items-center gap-1 font-mono font-semibold text-xs ${
                  isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {formatCurrency(quote?.change || 0)} ({formatPercent(quote?.changePercent || 0).text}) Today
                </span>
              </div>
            </div>

            <Link to={`/replay?symbol=${upperSymbol}`} className="hidden md:inline-block">
              <Button size="sm" variant="outline" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Replay Mode
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 2-Column Layout: Chart & Stats on left (8), Trade Ticket on right (4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <StockChart
              data={candles}
              isPositive={isPositive}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
            />
          </Card>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
              Key Metrics
            </h2>
            <StatGrid stats={quote || {}} />
          </div>
        </div>

        {/* Right side: Trade Slip */}
        <div>
          <Card className="p-5 sticky top-20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <CardTitle className="text-sm">Order Ticket</CardTitle>
              <span className="text-[11px] text-[var(--color-brand)] font-semibold">
                Simulated Execution
              </span>
            </div>

            {isTradeSuccess && (
              <div className="p-3 rounded-lg bg-[var(--color-success-subtle)] border border-[var(--color-success)]/30 text-[var(--color-success)] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Order filled! Portfolio updated.</span>
              </div>
            )}

            <form onSubmit={handleExecuteTrade} className="space-y-4">
              {/* Buy / Sell toggle */}
              <div className="grid grid-cols-2 p-1 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setTradeSide('BUY')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    tradeSide === 'BUY'
                      ? 'bg-[var(--color-success)] text-white'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setTradeSide('SELL')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    tradeSide === 'SELL'
                      ? 'bg-[var(--color-error)] text-white'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  SELL
                </button>
              </div>

              <Input
                label="Number of shares"
                type="number"
                min="1"
                step="1"
                value={shares}
                onChange={(e) => setShares(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />

              <div className="rounded-lg bg-[var(--color-bg-subtle)] p-3 space-y-2 text-xs border border-[var(--color-border)] font-mono">
                <div className="flex justify-between text-[var(--color-text-muted)]">
                  <span>Price</span>
                  <span className="text-[var(--color-text-primary)]">{formatCurrency(currentPrice)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-text-muted)]">
                  <span>Order Type</span>
                  <span className="text-[var(--color-text-primary)]">Market Order</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--color-border)] font-bold text-[var(--color-text-primary)]">
                  <span>Estimated Total</span>
                  <span>{formatCurrency(estimatedTotal)}</span>
                </div>
              </div>

              <div className="text-[11px] text-[var(--color-text-muted)] flex justify-between">
                <span>Available Cash</span>
                <span className="font-mono font-semibold text-[var(--color-brand)]">
                  {formatCurrency(walletBalance)}
                </span>
              </div>

              <Button
                type="submit"
                variant={tradeSide === 'BUY' ? 'success' : 'danger'}
                className="w-full"
                leftIcon={<ArrowLeftRight className="w-4 h-4" />}
              >
                Place {tradeSide} Order
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
