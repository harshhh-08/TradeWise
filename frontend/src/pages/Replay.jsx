import { useState, useCallback, useMemo } from 'react';
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
} from 'lucide-react';
import { ReplayChart } from '@/components/features/ReplayChart';
import { ReplayControls } from '@/components/features/ReplayControls';
import { ReplayTradePanel } from '@/components/features/ReplayTradePanel';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

const AVAILABLE_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 185.0 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', basePrice: 130.0 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', basePrice: 410.0 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 175.0 },
  { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 210.0 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 165.0 },
];

/**
 * Generates synthetic simulated candles for historical market replay.
 * Note: These candles are simulated mock data, not real historical market data.
 */
function generateMockCandles(symbol = 'AAPL', startDateStr = '2024-01-02', count = 60) {
  const stockInfo = AVAILABLE_STOCKS.find((s) => s.symbol === symbol) || AVAILABLE_STOCKS[0];
  const basePrice = stockInfo.basePrice;
  const candles = [];
  let currentPrice = basePrice;
  const startDate = new Date(startDateStr);

  let dayOffset = 0;
  while (candles.length < count) {
    const d = new Date(startDate.getTime() + dayOffset * 86400000);
    dayOffset++;
    // Skip weekends (0 = Sunday, 6 = Saturday)
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Daily deterministic + pseudo-random volatility simulation
    const cycle = Math.sin(dayOffset * 0.35) * 0.012;
    const noise = ((Math.sin(dayOffset * 7.9) + Math.cos(dayOffset * 3.7)) / 2) * 0.018;
    const changePercent = cycle + noise;

    const open = +currentPrice.toFixed(2);
    const close = Math.max(1, +(open * (1 + changePercent)).toFixed(2));
    const spread = Math.abs(close - open);
    const high = +(Math.max(open, close) + spread * 0.5 + 0.4).toFixed(2);
    const low = +(Math.max(1, Math.min(open, close) - spread * 0.5 - 0.3)).toFixed(2);
    const volume = Math.floor(Math.abs(Math.sin(dayOffset * 2.1)) * 35000000) + 12000000;

    candles.push({
      date: d.toISOString().split('T')[0],
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      open,
      high,
      low,
      close,
      volume,
      isUp: close >= open,
    });

    currentPrice = close;
  }

  return candles;
}

export default function Replay({ className }) {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [startDate, setStartDate] = useState('2024-01-02');
  const [isLoading] = useState(false);
  const [error] = useState(null);

  // Core session structure initialized per requirements
  const [session, setSession] = useState(() => ({
    symbol: 'AAPL',
    candles: generateMockCandles('AAPL', '2024-01-02', 60),
    currentIndex: 1, // Start with first candle revealed
    isPlaying: false,
    cash: 100000,
    positions: [],
    trades: [],
  }));

  // Handle symbol change
  const handleSymbolChange = (newSymbol) => {
    setSelectedSymbol(newSymbol);
    const newCandles = generateMockCandles(newSymbol, startDate, 60);
    setSession((prev) => ({
      ...prev,
      symbol: newSymbol,
      candles: newCandles,
      currentIndex: 1,
      isPlaying: false,
    }));
  };

  // Handle start date change
  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    const newCandles = generateMockCandles(selectedSymbol, newDate, 60);
    setSession((prev) => ({
      ...prev,
      candles: newCandles,
      currentIndex: 1,
      isPlaying: false,
    }));
  };

  // Step handler for controls
  const handleStep = useCallback((newIndex) => {
    setSession((prev) => ({
      ...prev,
      currentIndex: Math.max(1, Math.min(prev.candles.length, newIndex)),
    }));
  }, []);

  // Play/pause handler
  const handlePlay = useCallback((playing) => {
    setSession((prev) => ({
      ...prev,
      isPlaying: typeof playing === 'boolean' ? playing : !prev.isPlaying,
    }));
  }, []);

  // Current revealed candle
  const currentCandle = useMemo(() => {
    if (!session.candles.length || session.currentIndex <= 0) return null;
    return session.candles[session.currentIndex - 1];
  }, [session.candles, session.currentIndex]);

  // Execute a virtual trade
  const handleExecuteTrade = useCallback((tradeOrder) => {
    const { type, symbol, quantity, price, date } = tradeOrder;

    // Validate current candle is active
    if (!currentCandle) {
      return { success: false, message: 'Trading disabled: no active replay candle revealed.' };
    }

    // Prevent trading beyond the currently revealed replay day
    if (date !== currentCandle.date) {
      return { success: false, message: 'Cannot place trades beyond the currently revealed replay candle.' };
    }

    // Validate quantity is a positive whole number
    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty <= 0) {
      return { success: false, message: 'Quantity must be a positive whole number.' };
    }

    // Validate price
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
          failReason = `Insufficient virtual cash. Needed ${formatCurrency(totalCost)}, available ${formatCurrency(prev.cash)}.`;
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

  // P&L and Portfolio calculations
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
      {/* Header section */}
      <div className="pb-3 border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[var(--color-brand-subtle)] text-[var(--color-brand)]">
              <RotateCcw className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-brand)] font-semibold">
              Time Machine Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] font-mono">
            Market Replay
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Step through simulated historical candles day-by-day and execute virtual paper trades against replay data.
          </p>
        </div>

        {/* Top-Right Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="warning" size="sm" className="font-mono text-[10px]">
            Simulated Mock Data &bull; Virtual Trading
          </Badge>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] font-mono text-xs">
            <Wallet className="w-3.5 h-3.5 text-[var(--color-brand)]" />
            <span className="text-[var(--color-text-muted)]">Cash:</span>
            <span className="font-bold text-[var(--color-text-primary)]">
              {formatCurrency(session.cash)}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Portfolio Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">Net Portfolio Value</span>
          <span className="text-sm font-bold text-[var(--color-text-primary)]">
            {formatCurrency(totalPortfolioValue)}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">Stock Holdings Value</span>
          <span className="text-sm font-bold text-[var(--color-text-primary)]">
            {formatCurrency(totalPositionValue)}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">Realized P&amp;L</span>
          <span
            className={cn(
              'text-sm font-bold',
              realizedPnl >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
            )}
          >
            {realizedPnl >= 0 ? '+' : ''}{formatCurrency(realizedPnl)}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">Unrealized P&amp;L</span>
          <span
            className={cn(
              'text-sm font-bold',
              unrealizedPnl >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
            )}
          >
            {unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(unrealizedPnl)}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] col-span-2 sm:col-span-1">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">Total Session P&amp;L</span>
          <span
            className={cn(
              'text-sm font-bold flex items-center gap-1',
              sessionPnl >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
            )}
          >
            {sessionPnl >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {sessionPnl >= 0 ? '+' : ''}{formatCurrency(sessionPnl)} ({formatPercent(sessionPnlPct).text})
          </span>
        </div>
      </div>

      {/* Session Configuration Bar */}
      <Card className="p-3.5 bg-[var(--color-bg-subtle)] border-[var(--color-border)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end font-mono text-xs">
          {/* Stock Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
              Select Ticker
            </label>
            <select
              value={selectedSymbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              className="w-full h-8 px-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-brand)]"
            >
              {AVAILABLE_STOCKS.map((stock) => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} &mdash; {stock.name}
                </option>
              ))}
            </select>
          </div>

          {/* Starting Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
              Replay Start Date
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-brand)]"
              />
              <Calendar className="w-3.5 h-3.5 absolute right-2.5 text-[var(--color-text-muted)] pointer-events-none" />
            </div>
          </div>

          {/* Active Ticker Details */}
          <div>
            <span className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
              Simulation Scope
            </span>
            <div className="h-8 px-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-base)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
              <span>60 Trading Days</span>
              <span className="text-[var(--color-brand)] font-bold">1D Candles</span>
            </div>
          </div>

          {/* Current Revealed Price Card */}
          <div>
            <span className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
              Current Replay Quote
            </span>
            <div className="h-8 px-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-base)] flex items-center justify-between">
              <span className="font-bold text-[var(--color-text-primary)]">
                {currentCandle ? formatCurrency(currentCandle.close) : '--'}
              </span>
              {currentCandle && (
                <span
                  className={cn(
                    'text-[10px] font-semibold',
                    currentCandle.close >= currentCandle.open
                      ? 'text-[var(--color-success)]'
                      : 'text-[var(--color-error)]'
                  )}
                >
                  {currentCandle.close >= currentCandle.open ? '+' : ''}
                  {(currentCandle.close - currentCandle.open).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <Card className="p-6 bg-[var(--color-error-subtle)] border-[var(--color-error)]/30 text-xs text-[var(--color-error)] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && session.candles.length === 0 && (
        <Card className="p-12 text-center text-xs text-[var(--color-text-muted)] space-y-2">
          <HelpCircle className="w-8 h-8 mx-auto text-[var(--color-text-muted)]" />
          <p>No replay candles available for the selected parameters.</p>
        </Card>
      )}

      {/* Main Replay Surface: 2-Column Responsive Layout */}
      {!isLoading && !error && session.candles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column (2 cols on lg): Chart & Timeline Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* Market Replay Chart */}
            <Card className="p-4 sm:p-5 bg-[var(--color-bg-subtle)] border-[var(--color-border)] shadow-xs">
              <ReplayChart
                candles={session.candles}
                visibleCount={session.currentIndex}
              />
            </Card>

            {/* Replay Controls & Timeline */}
            <ReplayControls
              current={session.currentIndex}
              total={session.candles.length}
              onStep={handleStep}
              onPlay={handlePlay}
              isPlaying={session.isPlaying}
            />

            {/* Trade Execution History Section */}
            <Card className="p-4 bg-[var(--color-bg-subtle)] border-[var(--color-border)] space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[var(--color-brand)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                    Replay Transaction Ledger
                  </h3>
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)]">
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
                          <TableCell className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap">
                            {trade.displayDate || trade.date}
                          </TableCell>
                          <TableCell className="font-bold text-[var(--color-text-primary)]">
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
                          <TableCell className="text-right text-[var(--color-text-muted)]">
                            {formatCurrency(trade.price)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-[var(--color-text-primary)]">
                            {formatCurrency(trade.total)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {trade.type === 'SELL' ? (
                              <span className={trade.realizedPnl >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}>
                                {trade.realizedPnl >= 0 ? '+' : ''}{formatCurrency(trade.realizedPnl)}
                              </span>
                            ) : (
                              <span className="text-[var(--color-text-muted)]">&mdash;</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-lg">
                  No replay trades executed yet. Place an order on any revealed day to simulate strategy returns.
                </div>
              )}
            </Card>
          </div>

          {/* Right Column (1 col on lg): Virtual Order Entry Ticket & Position Panel */}
          <div className="space-y-4">
            <ReplayTradePanel
              symbol={selectedSymbol}
              currentPrice={currentCandle ? currentCandle.close : 0}
              cash={session.cash}
              positions={session.positions}
              currentDate={currentCandle ? currentCandle.date : ''}
              onTrade={handleExecuteTrade}
            />

            {/* Execution Disclaimers & Rules Card */}
            <Card className="p-3.5 bg-[var(--color-bg-base)] border-[var(--color-border)] font-mono text-[11px] text-[var(--color-text-muted)] space-y-2">
              <div className="flex items-center gap-1.5 text-[var(--color-brand)] font-semibold uppercase text-[10px]">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Simulation Rules</span>
              </div>
              <ul className="space-y-1 list-disc list-inside leading-relaxed text-[10px]">
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
