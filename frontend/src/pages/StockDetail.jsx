import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  ArrowLeftRight,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { StockChart } from '@/components/features/StockChart';
import { StatGrid } from '@/components/features/StatGrid';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

function generateFallbackCandles(basePrice = 150) {
  const points = [];
  let p = basePrice * 0.96;
  const now = new Date();

  for (let i = 24; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600 * 1000);
    const variation = (Math.random() - 0.48) * (basePrice * 0.015);
    p = Math.max(1, p + variation);
    points.push({
      date: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open: +(p - Math.random() * 0.4).toFixed(2),
      high: +(p + Math.random() * 0.6).toFixed(2),
      low: +(p - Math.random() * 0.6).toFixed(2),
      close: +p.toFixed(2),
      volume: Math.floor(Math.random() * 600000) + 120000,
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

  const { walletBalance, updateWalletCash } = useAuth();
  const [tradeSide, setTradeSide] = useState('BUY');
  const [shares, setShares] = useState(10);
  const [isTradeSuccess, setIsTradeSuccess] = useState(false);

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

  const [isSubmittingTrade, setIsSubmittingTrade] = useState(false);

  const handleExecuteTrade = async (e) => {
    e.preventDefault();
    const qty = Number(shares);
    if (!qty || qty <= 0) {
      toast.error('Please enter a valid quantity of shares.');
      return;
    }

    setIsSubmittingTrade(true);
    try {
      const res = await api.post('/api/orders', {
        symbol: upperSymbol,
        side: tradeSide,
        quantity: qty,
        type: 'MARKET',
      });

      if (res.data?.success) {
        if (res.data.wallet?.cash !== undefined) {
          updateWalletCash(res.data.wallet.cash);
        }
        setIsTradeSuccess(true);
        toast.success(res.data.message || `${tradeSide} order executed for ${qty} ${upperSymbol}!`);
        setTimeout(() => setIsTradeSuccess(false), 3000);
      } else {
        throw new Error(res.data?.message || 'Order execution failed');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to execute order';
      toast.error(errMsg);
    } finally {
      setIsSubmittingTrade(false);
    }
  };

  return (
    <div className="space-y-4">
      
      <div>
        <Link
          to="/markets"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Screener / {upperSymbol}</span>
        </Link>
      </div>

      
      {isLoading && !quote ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-(--color-border)">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-extrabold font-mono tracking-tight text-(--color-text-primary)">
                {upperSymbol}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-(--color-bg-raised) text-(--color-text-muted) border border-(--color-border)">
                {quote?.exchange || (upperSymbol.endsWith('.NS') ? 'NSE' : 'US')} &bull; {quote?.currency || (upperSymbol.endsWith('.NS') ? 'INR' : 'USD')}
              </span>
            </div>
            <p className="text-xs text-(--color-text-muted)">{quote?.name || upperSymbol}</p>
          </div>

          <div className="flex items-end sm:items-center gap-4">
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-(--color-text-primary)">
                {formatCurrency(currentPrice, quote?.currency || (upperSymbol.endsWith('.NS') ? 'INR' : 'USD'))}
              </div>
              <div
                className={`inline-flex items-center gap-1 font-mono font-semibold text-xs ${
                  isPositive ? 'text-(--color-success)' : 'text-(--color-error)'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {formatCurrency(quote?.change || 0, quote?.currency || (upperSymbol.endsWith('.NS') ? 'INR' : 'USD'))} ({formatPercent(quote?.changePercent || 0).text})
                </span>
              </div>
            </div>

            <Link to={`/replay?symbol=${upperSymbol}`} className="hidden md:inline-block">
              <Button size="sm" variant="outline" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Replay Simulator
              </Button>
            </Link>
          </div>
        </div>
      )}

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <StockChart
              data={candles}
              isPositive={isPositive}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
            />
          </Card>

          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-(--color-text-muted)">
              Exchange Fundamentals
            </h2>
            <StatGrid stats={quote || {}} />
          </div>
        </div>

        
        <div>
          <Card className="p-4 sticky top-16 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-(--color-border)">
              <CardTitle className="text-xs font-mono uppercase tracking-wider">
                Instant Order
              </CardTitle>
              <span className="text-[10px] font-mono text-(--color-success)">
                SIMULATED FILL
              </span>
            </div>

            {isTradeSuccess && (
              <div className="p-2.5 rounded bg-(--color-success-subtle) border border-(--color-success)/30 text-(--color-success) text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Fill executed. Position updated.</span>
              </div>
            )}

            <form onSubmit={handleExecuteTrade} className="space-y-3.5">
              <div className="grid grid-cols-2 p-0.5 rounded bg-(--color-bg-base) border border-(--color-border)">
                <button
                  type="button"
                  onClick={() => setTradeSide('BUY')}
                  className={`py-1.5 text-xs font-bold font-mono rounded transition-colors cursor-pointer ${
                    tradeSide === 'BUY'
                      ? 'bg-(--color-success) text-white shadow-xs'
                      : 'text-(--color-text-muted) hover:text-(--color-text-primary)'
                  }`}
                >
                  BUY (LONG)
                </button>
                <button
                  type="button"
                  onClick={() => setTradeSide('SELL')}
                  className={`py-1.5 text-xs font-bold font-mono rounded transition-colors cursor-pointer ${
                    tradeSide === 'SELL'
                      ? 'bg-(--color-error) text-white shadow-xs'
                      : 'text-(--color-text-muted) hover:text-(--color-text-primary)'
                  }`}
                >
                  SELL (CLOSE)
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-(--color-text-muted)">
                  <span>Shares</span>
                  <div className="flex items-center gap-1">
                    {[10, 25, 50].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setShares(n)}
                        className="px-1.5 rounded bg-(--color-bg-raised) text-[10px] hover:text-(--color-text-primary) cursor-pointer"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={shares}
                  onChange={(e) => setShares(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="font-mono"
                />
              </div>

              <div className="rounded bg-(--color-bg-base) p-3 space-y-1.5 text-xs font-mono border border-(--color-border)">
                <div className="flex justify-between text-(--color-text-muted)">
                  <span>Quote</span>
                  <span className="text-(--color-text-primary)">
                    {formatCurrency(currentPrice, quote?.currency || (upperSymbol.endsWith('.NS') ? 'INR' : 'USD'))}
                  </span>
                </div>
                <div className="flex justify-between text-(--color-text-muted)">
                  <span>Type</span>
                  <span className="text-(--color-text-primary)">Market Order</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-(--color-border) font-bold text-(--color-text-primary)">
                  <span>Consideration</span>
                  <span>
                    {formatCurrency(estimatedTotal, quote?.currency || (upperSymbol.endsWith('.NS') ? 'INR' : 'USD'))}
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-(--color-text-muted) flex justify-between">
                <span>Buying Power</span>
                <span className="font-bold text-(--color-brand)">
                  {formatCurrency(walletBalance)}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isSubmittingTrade || isLoading}
                variant={tradeSide === 'BUY' ? 'success' : 'danger'}
                className="w-full font-mono text-xs font-bold"
                leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}
              >
                {isSubmittingTrade ? 'Executing Order...' : `Transmit ${tradeSide} Order`}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
