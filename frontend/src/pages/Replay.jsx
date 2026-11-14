import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  RotateCcw,
  Calendar,
  Wallet,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  History,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import api from '@/services/api';
import { ReplayChart } from '@/components/features/ReplayChart';
import { ReplayControls } from '@/components/features/ReplayControls';
import { ReplayTradePanel } from '@/components/features/ReplayTradePanel';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';

export const AVAILABLE_STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd' },
  { symbol: 'SBIN.NS', name: 'State Bank of India' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd' },
  { symbol: 'ITC.NS', name: 'ITC Ltd' },
];

function transformCandle(c) {
  if (!c) return null;
  const rawDate = c.timestamp || c.date;
  const d = new Date(rawDate);
  const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : String(rawDate);
  const displayDateStr = !isNaN(d.getTime())
    ? d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : dateStr;

  const open = Number(c.open) || 0;
  const high = Number(c.high) || open;
  const low = Number(c.low) || open;
  const close = Number(c.close) || open;
  const volume = Number(c.volume) || 0;

  return {
    date: dateStr,
    displayDate: displayDateStr,
    open,
    high,
    low,
    close,
    volume,
    isUp: close >= open,
  };
}

export default function Replay({ className }) {
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE.NS');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-03-31');
  const [backendSessionId, setBackendSessionId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [session, setSession] = useState({
    symbol: 'RELIANCE.NS',
    candles: [],
    currentIndex: 1,
    isPlaying: false,
    cash: 100000,
    positions: [],
    trades: [],
  });

  const abortControllerRef = useRef(null);

  const loadReplaySession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const createRes = await api.post('/api/replay/sessions', {
        symbol: selectedSymbol,
        startDate,
        endDate,
        timeframe: '1d',
      }, { signal: controller.signal });

      const newSession = createRes.data?.session;
      if (!newSession?.id) {
        throw new Error('Failed to create replay session on server.');
      }
      const sId = newSession.id;
      setBackendSessionId(sId);

      await api.post(`/api/replay/sessions/${sId}/start`, {}, { signal: controller.signal });

      const candlesRes = await api.get(`/api/replay/sessions/${sId}/candles?limit=500`, {
        signal: controller.signal,
      });

      const rawCandles = candlesRes.data?.candles || [];
      if (rawCandles.length === 0) {
        throw new Error(`No historical candles found for ${selectedSymbol} between ${startDate} and ${endDate}.`);
      }

      const formattedCandles = rawCandles.map(transformCandle).filter(Boolean);

      setSession((prev) => ({
        ...prev,
        symbol: selectedSymbol,
        candles: formattedCandles,
        currentIndex: 1,
        isPlaying: false,
      }));
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return;
      }
      const msg = err.response?.data?.message || err.message || 'Failed to initialize historical market replay.';
      setError(msg);
      setSession((prev) => ({
        ...prev,
        candles: [],
        currentIndex: 0,
        isPlaying: false,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [selectedSymbol, startDate, endDate]);

  useEffect(() => {
    loadReplaySession();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadReplaySession]);

  const handleSymbolChange = (newSymbol) => {
    setSelectedSymbol(newSymbol);
  };

  const handleStep = useCallback(async (newIndex) => {
    setSession((prev) => {
      const clamped = Math.max(1, Math.min(prev.candles.length, newIndex));
      return {
        ...prev,
        currentIndex: clamped,
      };
    });

    if (backendSessionId) {
      try {
        await api.post(`/api/replay/sessions/${backendSessionId}/next`);
      } catch {
      }
    }
  }, [backendSessionId]);

  const handlePlay = useCallback(async (playing) => {
    const nextState = typeof playing === 'boolean' ? playing : !session.isPlaying;
    setSession((prev) => ({
      ...prev,
      isPlaying: nextState,
    }));

    if (backendSessionId) {
      try {
        if (!nextState) {
          await api.post(`/api/replay/sessions/${backendSessionId}/pause`);
        } else {
          await api.post(`/api/replay/sessions/${backendSessionId}/start`);
        }
      } catch {
      }
    }
  }, [backendSessionId, session.isPlaying]);

  const currentCandle = useMemo(() => {
    if (!session.candles.length || session.currentIndex <= 0) return null;
    return session.candles[session.currentIndex - 1];
  }, [session.candles, session.currentIndex]);

  const handleExecuteTrade = useCallback((tradeOrder) => {
    const { type, symbol, quantity, price, date } = tradeOrder;

    if (!currentCandle) {
      return { success: false, message: 'Trading disabled: no active replay candle revealed.' };
    }

    if (date !== currentCandle.date) {
      return { success: false, message: 'Cannot place trades beyond the currently revealed replay candle.' };
    }

    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty <= 0) {
      return { success: false, message: 'Quantity must be a positive whole number.' };
    }

    const executionPrice = Number(price);
    if (isNaN(executionPrice) || executionPrice <= 0) {
      return { success: false, message: 'Invalid execution price for order routing.' };
    }

    let tradeSuccess = false;
    let failReason = '';

    setSession((prev) => {
      const positions = [...prev.positions];
      const posIndex = positions.findIndex((p) => p.symbol === symbol);
      const existingPos = posIndex >= 0 ? positions[posIndex] : null;

      if (type === 'BUY') {
        const totalCost = qty * executionPrice;
        if (totalCost > prev.cash) {
          failReason = `Insufficient virtual cash. Needed ${formatCurrency(totalCost, 'INR')}, available ${formatCurrency(prev.cash, 'INR')}.`;
          return prev;
        }

        const newCash = prev.cash - totalCost;

        if (existingPos) {
          const combinedQty = existingPos.quantity + qty;
          const weightedAvg = (existingPos.quantity * existingPos.avgPrice + totalCost) / combinedQty;
          positions[posIndex] = {
            ...existingPos,
            quantity: combinedQty,
            avgPrice: weightedAvg,
          };
        } else {
          positions.push({
            symbol,
            quantity: qty,
            avgPrice: executionPrice,
          });
        }

        const newTrade = {
          id: `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          date: currentCandle.date,
          displayDate: currentCandle.displayDate,
          symbol,
          type: 'BUY',
          quantity: qty,
          price: executionPrice,
          total: totalCost,
          realizedPnl: 0,
        };

        tradeSuccess = true;
        return {
          ...prev,
          cash: newCash,
          positions,
          trades: [newTrade, ...prev.trades],
        };
      }

      if (type === 'SELL') {
        if (!existingPos || existingPos.quantity < qty) {
          failReason = `Cannot sell ${qty} shares. Current holding is ${existingPos ? existingPos.quantity : 0} shares.`;
          return prev;
        }

        const proceeds = qty * executionPrice;
        const costBasisOfSold = qty * existingPos.avgPrice;
        const tradeRealizedPnl = proceeds - costBasisOfSold;
        const newCash = prev.cash + proceeds;

        const remainingQty = existingPos.quantity - qty;
        if (remainingQty === 0) {
          positions.splice(posIndex, 1);
        } else {
          positions[posIndex] = {
            ...existingPos,
            quantity: remainingQty,
          };
        }

        const newTrade = {
          id: `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          date: currentCandle.date,
          displayDate: currentCandle.displayDate,
          symbol,
          type: 'SELL',
          quantity: qty,
          price: executionPrice,
          total: proceeds,
          realizedPnl: tradeRealizedPnl,
        };

        tradeSuccess = true;
        return {
          ...prev,
          cash: newCash,
          positions,
          trades: [newTrade, ...prev.trades],
        };
      }

      return prev;
    });

    if (tradeSuccess) {
      return { success: true };
    }
    return { success: false, message: failReason || 'Failed to execute trade.' };
  }, [currentCandle]);

  const { totalPositionValue, unrealizedPnl, realizedPnl, totalPortfolioValue, sessionPnl, sessionPnlPct } = useMemo(() => {
    const curPrice = currentCandle ? currentCandle.close : 0;

    let posVal = 0;
    let unPnl = 0;

    session.positions.forEach((pos) => {
      const price = pos.symbol === session.symbol ? curPrice : pos.avgPrice;
      const value = pos.quantity * price;
      const cost = pos.quantity * pos.avgPrice;
      posVal += value;
      unPnl += (value - cost);
    });

    const realPnl = session.trades.reduce((sum, t) => sum + (t.realizedPnl || 0), 0);
    const netValue = session.cash + posVal;
    const totPnl = realPnl + unPnl;
    const pnlPct = ((netValue - 100000) / 100000) * 100;

    return {
      totalPositionValue: posVal,
      unrealizedPnl: unPnl,
      realizedPnl: realPnl,
      totalPortfolioValue: netValue,
      sessionPnl: totPnl,
      sessionPnlPct: pnlPct,
    };
  }, [session.cash, session.positions, session.trades, session.symbol, currentCandle]);

  return (
    <div className={cn('space-y-5', className)}>
      
      <div className="pb-3 border-b border-(--color-border) flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-(--color-brand-subtle) text-(--color-brand)">
              <RotateCcw className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-(--color-brand) font-semibold">
              Time Machine Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-(--color-text-primary) font-mono">
            Historical Market Replay
          </h1>
          <p className="text-xs text-(--color-text-muted) mt-0.5">
            Step through real historical candles day-by-day and execute virtual paper trades against verified market data.
          </p>
        </div>

        
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="brand" size="sm" className="font-mono text-[10px]">
            Real NSE Historical Data &bull; Virtual Engine
          </Badge>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--color-bg-subtle) border border-(--color-border) font-mono text-xs">
            <Wallet className="w-3.5 h-3.5 text-(--color-brand)" />
            <span className="text-(--color-text-muted)">Cash:</span>
            <span className="font-bold text-(--color-text-primary)">
              {formatCurrency(session.cash, 'INR')}
            </span>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-(--color-bg-subtle) border border-(--color-border)">
          <span className="text-[10px] text-(--color-text-muted) uppercase block">Net Portfolio Value</span>
          <span className="text-sm font-bold text-(--color-text-primary)">
            {formatCurrency(totalPortfolioValue, 'INR')}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-(--color-bg-subtle) border border-(--color-border)">
          <span className="text-[10px] text-(--color-text-muted) uppercase block">Stock Holdings Value</span>
          <span className="text-sm font-bold text-(--color-text-primary)">
            {formatCurrency(totalPositionValue, 'INR')}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-(--color-bg-subtle) border border-(--color-border)">
          <span className="text-[10px] text-(--color-text-muted) uppercase block">Realized P&amp;L</span>
          <span
            className={cn(
              'text-sm font-bold',
              realizedPnl >= 0 ? 'text-(--color-success)' : 'text-(--color-error)'
            )}
          >
            {realizedPnl >= 0 ? '+' : ''}{formatCurrency(realizedPnl, 'INR')}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-(--color-bg-subtle) border border-(--color-border)">
          <span className="text-[10px] text-(--color-text-muted) uppercase block">Unrealized P&amp;L</span>
          <span
            className={cn(
              'text-sm font-bold',
              unrealizedPnl >= 0 ? 'text-(--color-success)' : 'text-(--color-error)'
            )}
          >
            {unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(unrealizedPnl, 'INR')}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-(--color-bg-subtle) border border-(--color-border) col-span-2 sm:col-span-1">
          <span className="text-[10px] text-(--color-text-muted) uppercase block">Total Session P&amp;L</span>
          <span
            className={cn(
              'text-sm font-bold flex items-center gap-1',
              sessionPnl >= 0 ? 'text-(--color-success)' : 'text-(--color-error)'
            )}
          >
            {sessionPnl >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {sessionPnl >= 0 ? '+' : ''}{formatCurrency(sessionPnl, 'INR')} ({formatPercent(sessionPnlPct).text})
          </span>
        </div>
      </div>

      
      <Card className="p-3.5 bg-(--color-bg-subtle) border-(--color-border)">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end font-mono text-xs">
          
          <div>
            <label className="block text-[11px] font-semibold text-(--color-text-secondary) mb-1">
              Select NSE Ticker
            </label>
            <select
              value={selectedSymbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              disabled={isLoading}
              className="w-full h-8 px-2.5 rounded-md border border-(--color-border) bg-(--color-bg-raised) text-(--color-text-primary) text-xs focus:outline-none focus:border-(--color-brand)"
            >
              {AVAILABLE_STOCKS.map((stock) => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} &mdash; {stock.name}
                </option>
              ))}
            </select>
          </div>

          
          <div>
            <label className="block text-[11px] font-semibold text-(--color-text-secondary) mb-1">
              Start Date
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
                className="w-full h-8 px-2.5 rounded-md border border-(--color-border) bg-(--color-bg-raised) text-(--color-text-primary) text-xs focus:outline-none focus:border-(--color-brand)"
              />
              <Calendar className="w-3.5 h-3.5 absolute right-2.5 text-(--color-text-muted) pointer-events-none" />
            </div>
          </div>

          
          <div>
            <label className="block text-[11px] font-semibold text-(--color-text-secondary) mb-1">
              End Date
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
                className="w-full h-8 px-2.5 rounded-md border border-(--color-border) bg-(--color-bg-raised) text-(--color-text-primary) text-xs focus:outline-none focus:border-(--color-brand)"
              />
              <Calendar className="w-3.5 h-3.5 absolute right-2.5 text-(--color-text-muted) pointer-events-none" />
            </div>
          </div>

          
          <div>
            <span className="block text-[11px] font-semibold text-(--color-text-secondary) mb-1">
              Current Replay Quote
            </span>
            <div className="h-8 px-2.5 rounded-md border border-(--color-border) bg-(--color-bg-base) flex items-center justify-between">
              <span className="font-bold text-(--color-text-primary)">
                {currentCandle ? formatCurrency(currentCandle.close, 'INR') : '--'}
              </span>
              {currentCandle && (
                <span
                  className={cn(
                    'text-[10px] font-semibold',
                    currentCandle.close >= currentCandle.open
                      ? 'text-(--color-success)'
                      : 'text-(--color-error)'
                  )}
                >
                  {currentCandle.close >= currentCandle.open ? '+' : ''}
                  {(currentCandle.close - currentCandle.open).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          
          <div>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadReplaySession}
              disabled={isLoading}
              className="w-full h-8"
              leftIcon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            >
              {isLoading ? 'Loading...' : 'Load Session'}
            </Button>
          </div>
        </div>
      </Card>

      
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      )}

      
      {!isLoading && error && (
        <Card className="p-6 bg-(--color-error-subtle) border-(--color-error)/30 text-xs text-(--color-error) flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadReplaySession}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry
          </Button>
        </Card>
      )}

      
      {!isLoading && !error && session.candles.length === 0 && (
        <Card className="p-12 text-center text-xs text-(--color-text-muted) space-y-2">
          <HelpCircle className="w-8 h-8 mx-auto text-(--color-text-muted)" />
          <p>No replay candles available for the selected parameters.</p>
        </Card>
      )}

      
      {!isLoading && !error && session.candles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          <div className="lg:col-span-2 space-y-4">
            
            <Card className="p-4 sm:p-5 bg-(--color-bg-subtle) border-(--color-border) shadow-xs">
              <ReplayChart
                candles={session.candles}
                visibleCount={session.currentIndex}
                currency="INR"
              />
            </Card>

            
            <ReplayControls
              current={session.currentIndex}
              total={session.candles.length}
              onStep={handleStep}
              onPlay={handlePlay}
              isPlaying={session.isPlaying}
            />

            
            <Card className="p-4 bg-(--color-bg-subtle) border-(--color-border) space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-(--color-border)">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-(--color-brand)" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-primary)">
                    Replay Transaction Ledger
                  </h3>
                </div>
                <span className="text-[10px] text-(--color-text-muted)">
                  {session.trades.length} recorded trade{session.trades.length === 1 ? '' : 's'}
                </span>
              </div>

              {session.trades.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead className="text-right">Shares</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                        <TableHead className="text-right">Realized P&amp;L</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {session.trades.map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell className="text-[11px] text-(--color-text-muted) whitespace-nowrap">
                            {trade.displayDate || trade.date}
                          </TableCell>
                          <TableCell className="font-bold text-(--color-text-primary)">
                            {trade.symbol}
                          </TableCell>
                          <TableCell>
                            <Badge variant={trade.type === 'BUY' ? 'success' : 'error'} size="sm">
                              {trade.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {trade.quantity}
                          </TableCell>
                          <TableCell className="text-right text-(--color-text-muted)">
                            {formatCurrency(trade.price, 'INR')}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-(--color-text-primary)">
                            {formatCurrency(trade.total, 'INR')}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {trade.type === 'SELL' ? (
                              <span className={trade.realizedPnl >= 0 ? 'text-(--color-success)' : 'text-(--color-error)'}>
                                {trade.realizedPnl >= 0 ? '+' : ''}{formatCurrency(trade.realizedPnl, 'INR')}
                              </span>
                            ) : (
                              <span className="text-(--color-text-muted)">&mdash;</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-(--color-text-muted) border border-dashed border-(--color-border) rounded-lg">
                  No replay trades executed yet. Place an order on any revealed day to simulate strategy returns.
                </div>
              )}
            </Card>
          </div>

          
          <div className="space-y-4">
            <ReplayTradePanel
              symbol={selectedSymbol}
              currentPrice={currentCandle ? currentCandle.close : 0}
              cash={session.cash}
              positions={session.positions}
              currentDate={currentCandle ? currentCandle.date : ''}
              currency="INR"
              onTrade={handleExecuteTrade}
            />

            
            <Card className="p-3.5 bg-(--color-bg-base) border-(--color-border) font-mono text-[11px] text-(--color-text-muted) space-y-2">
              <div className="flex items-center gap-1.5 text-(--color-brand) font-semibold uppercase text-[10px]">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Simulation Rules</span>
              </div>
              <ul className="space-y-1 list-disc list-inside leading-relaxed text-[10px]">
                <li>Real historical candle quotes powered by Yahoo Finance / Twelve Data.</li>
                <li>Zero brokerage fees &amp; zero exchange transaction tax.</li>
                <li>Instant fills against currently revealed candle close quote.</li>
                <li>Selling requires pre-existing holdings in the current session.</li>
                <li>All cash and positions are isolated to the active simulation.</li>
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
