import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import {
  Play,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  AlertCircle,
  Clock,
  History,
  Trash2,
  RefreshCw,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import api from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
import { AVAILABLE_STOCKS } from '@/pages/Replay';

export default function Backtest({ className }) {
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [fastPeriod, setFastPeriod] = useState('10');
  const [slowPeriod, setSlowPeriod] = useState('30');
  const [initialCapital, setInitialCapital] = useState('100000');

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [activeBacktest, setActiveBacktest] = useState(null);

  const [pastRuns, setPastRuns] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await api.get('/api/backtests?limit=20');
      if (res.data?.success && Array.isArray(res.data.backtests)) {
        setPastRuns(res.data.backtests);
      }
    } catch {
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRunBacktest = async (e) => {
    e?.preventDefault();
    setError(null);

    const fast = parseInt(fastPeriod, 10);
    const slow = parseInt(slowPeriod, 10);
    const cap = parseFloat(initialCapital);

    if (isNaN(fast) || fast < 2) {
      setError('Fast SMA period must be at least 2.');
      return;
    }
    if (isNaN(slow) || slow <= fast) {
      setError('Slow SMA period must be strictly greater than Fast SMA period.');
      return;
    }
    if (isNaN(cap) || cap <= 0) {
      setError('Initial capital must be a positive number.');
      return;
    }

    setIsRunning(true);

    try {
      const res = await api.post('/api/backtests', {
        symbol,
        timeframe: '1D',
        startDate,
        endDate,
        strategy: {
          type: 'SMA_CROSSOVER',
          fastPeriod: fast,
          slowPeriod: slow,
        },
        initialCapital: cap,
      });

      if (res.data?.success && res.data.backtest) {
        setActiveBacktest(res.data.backtest);
        loadHistory();
      } else {
        throw new Error(res.data?.message || 'Backtest execution failed.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to execute strategy backtest.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectRun = async (runId) => {
    try {
      const res = await api.get(`/api/backtests/${runId}`);
      if (res.data?.success && res.data.backtest) {
        setActiveBacktest(res.data.backtest);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load backtest details.');
    }
  };

  const handleDeleteRun = async (e, runId) => {
    e.stopPropagation();
    setDeletingId(runId);
    try {
      await api.delete(`/api/backtests/${runId}`);
      setPastRuns((prev) => prev.filter((r) => r.id !== runId));
      if (activeBacktest?.id === runId) {
        setActiveBacktest(null);
      }
    } catch {
    } finally {
      setDeletingId(null);
    }
  };

  const metrics = activeBacktest?.metrics;
  const trades = activeBacktest?.trades || [];
  const equityCurve = activeBacktest?.equityCurve || [];

  return (
    <div className={cn('space-y-6', className)}>
      
      <div className="pb-3 border-b border-(--color-border) flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-(--color-brand-subtle) text-(--color-brand)">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-(--color-brand) font-semibold">
              Algorithmic Simulator
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-(--color-text-primary) font-mono">
            Strategy Backtesting
          </h1>
          <p className="text-xs text-(--color-text-muted) mt-0.5">
            Test technical SMA crossover strategies against real historical candles and evaluate risk metrics.
          </p>
        </div>

        <Badge variant="brand" size="sm" className="font-mono text-[10px] self-start md:self-auto">
          SMA Crossover &bull; Daily Timeframe
        </Badge>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 bg-(--color-bg-subtle) border-(--color-border) space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-(--color-border)">
              <Sliders className="w-4 h-4 text-(--color-brand)" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-(--color-text-primary) font-mono">
                Strategy Parameters
              </h2>
            </div>

            <form onSubmit={handleRunBacktest} className="space-y-3 font-mono text-xs">
              
              <div>
                <label className="block text-[11px] font-semibold text-(--color-text-secondary) mb-1">
                  Ticker (NSE Equities)
                </label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  disabled={isRunning}
                  className="w-full h-8 px-2.5 rounded-md border border-(--color-border) bg-(--color-bg-raised) text-(--color-text-primary) text-xs focus:outline-none focus:border-(--color-brand)"
                >
                  {AVAILABLE_STOCKS.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} ({s.name})
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
                    disabled={isRunning}
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
                    disabled={isRunning}
                    className="w-full h-8 px-2.5 rounded-md border border-(--color-border) bg-(--color-bg-raised) text-(--color-text-primary) text-xs focus:outline-none focus:border-(--color-brand)"
                  />
                  <Calendar className="w-3.5 h-3.5 absolute right-2.5 text-(--color-text-muted) pointer-events-none" />
                </div>
              </div>

              
              <div>
                <label className="block text-[11px] font-semibold text-(--color-text-secondary) mb-1">
                  Fast SMA Period (Days)
                </label>
                <Input
                  type="number"
                  min="2"
                  value={fastPeriod}
                  onChange={(e) => setFastPeriod(e.target.value)}
                  disabled={isRunning}
                  className="h-8 text-xs font-mono"
                />
              </div>

              
              <div>
                <label className="block text-[11px] font-semibold text-(--color-text-secondary) mb-1">
                  Slow SMA Period (Days)
                </label>
                <Input
                  type="number"
                  min="3"
                  value={slowPeriod}
                  onChange={(e) => setSlowPeriod(e.target.value)}
                  disabled={isRunning}
                  className="h-8 text-xs font-mono"
                />
              </div>

              
              <div>
                <label className="block text-[11px] font-semibold text-(--color-text-secondary) mb-1">
                  Initial Capital (INR)
                </label>
                <Input
                  type="number"
                  min="1000"
                  step="1000"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(e.target.value)}
                  disabled={isRunning}
                  className="h-8 text-xs font-mono"
                />
              </div>

              
              {error && (
                <div className="p-2.5 rounded-lg bg-(--color-error-subtle) border border-(--color-error)/30 text-(--color-error) text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              
              <Button
                type="submit"
                disabled={isRunning}
                className="w-full h-9 text-xs font-bold mt-2"
                leftIcon={isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              >
                {isRunning ? 'Simulating Strategy...' : 'Run Backtest'}
              </Button>
            </form>
          </Card>

          
          <Card className="p-4 bg-(--color-bg-subtle) border-(--color-border) space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-(--color-border)">
              <div className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-(--color-brand)" />
                <span className="text-xs font-bold uppercase tracking-wider text-(--color-text-primary)">
                  Saved Runs ({pastRuns.length})
                </span>
              </div>
              <button
                type="button"
                onClick={loadHistory}
                disabled={isLoadingHistory}
                className="text-(--color-text-muted) hover:text-(--color-text-primary)"
              >
                <RefreshCw className={cn('w-3 h-3', isLoadingHistory && 'animate-spin')} />
              </button>
            </div>

            {isLoadingHistory && pastRuns.length === 0 ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : pastRuns.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {pastRuns.map((run) => {
                  const ret = run.metrics?.totalReturnPercent ?? Number(run.totalReturn || 0);
                  const isPos = ret >= 0;
                  const isSelected = activeBacktest?.id === run.id;

                  return (
                    <div
                      key={run.id}
                      onClick={() => handleSelectRun(run.id)}
                      className={cn(
                        'p-2 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between gap-2',
                        isSelected
                          ? 'border-(--color-brand) bg-(--color-brand-subtle)'
                          : 'border-(--color-border) bg-(--color-bg-base) hover:bg-(--color-bg-raised)'
                      )}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-(--color-text-primary) truncate">
                          {run.symbol}
                        </div>
                        <div className="text-[10px] text-(--color-text-muted)">
                          SMA {run.strategyConfig?.fastPeriod ?? 10}/{run.strategyConfig?.slowPeriod ?? 30}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn('font-bold text-xs', isPos ? 'text-(--color-success)' : 'text-(--color-error)')}>
                          {isPos ? '+' : ''}{ret.toFixed(1)}%
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteRun(e, run.id)}
                          disabled={deletingId === run.id}
                          className="text-(--color-text-muted) hover:text-(--color-error) p-1 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-(--color-text-muted) text-center py-4">
                No past runs recorded yet.
              </p>
            )}
          </Card>
        </div>

        
        <div className="lg:col-span-3 space-y-4">
          {activeBacktest && metrics ? (
            <>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                
                <div className="p-3 rounded-lg bg-(--color-bg-subtle) border border-(--color-border)">
                  <span className="text-[10px] text-(--color-text-muted) uppercase block">Total Return</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span
                      className={cn(
                        'text-base font-bold',
                        metrics.totalReturnPercent >= 0 ? 'text-(--color-success)' : 'text-(--color-error)'
                      )}
                    >
                      {metrics.totalReturnPercent >= 0 ? '+' : ''}{metrics.totalReturnPercent.toFixed(2)}%
                    </span>
                    <span className="text-[10px] text-(--color-text-muted)">
                      (B&amp;H: {metrics.buyAndHoldReturnPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                
                <div className="p-3 rounded-lg bg-(--color-bg-subtle) border border-(--color-border)">
                  <span className="text-[10px] text-(--color-text-muted) uppercase block">Final Capital</span>
                  <span className="text-base font-bold text-(--color-text-primary) block mt-0.5">
                    {formatCurrency(metrics.finalPortfolioValue, 'INR')}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-semibold',
                      metrics.totalPnl >= 0 ? 'text-(--color-success)' : 'text-(--color-error)'
                    )}
                  >
                    {metrics.totalPnl >= 0 ? '+' : ''}{formatCurrency(metrics.totalPnl, 'INR')}
                  </span>
                </div>

                
                <div className="p-3 rounded-lg bg-(--color-bg-subtle) border border-(--color-border)">
                  <span className="text-[10px] text-(--color-text-muted) uppercase block">Win Rate</span>
                  <span className="text-base font-bold text-(--color-text-primary) block mt-0.5">
                    {metrics.winRate.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-(--color-text-muted)">
                    {metrics.winningTrades}W / {metrics.losingTrades}L of {metrics.totalTrades}
                  </span>
                </div>

                
                <div className="p-3 rounded-lg bg-(--color-bg-subtle) border border-(--color-border)">
                  <span className="text-[10px] text-(--color-text-muted) uppercase block">Max Drawdown</span>
                  <span className="text-base font-bold text-(--color-error) block mt-0.5">
                    -{metrics.maxDrawdownPercent.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-(--color-text-muted)">Peak-to-trough</span>
                </div>
              </div>

              
              <Card className="p-4 sm:p-5 bg-(--color-bg-subtle) border-(--color-border) font-mono space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-(--color-border)">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-primary)">
                      Portfolio Equity Curve
                    </h3>
                    <p className="text-[10px] text-(--color-text-muted)">
                      Daily valuation trajectory from {activeBacktest.startDate?.split('T')[0]} to {activeBacktest.endDate?.split('T')[0]}
                    </p>
                  </div>
                  <Badge variant="brand" size="sm">
                    {activeBacktest.symbol}
                  </Badge>
                </div>

                <div className="h-72 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={equityCurve}
                      margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => v ? v.split('T')[0] : ''}
                        tick={{ fontSize: 10, fill: '#757d91' }}
                        minTickGap={40}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={['dataMin - 1000', 'dataMax + 1000']}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 10, fill: '#757d91' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-2.5 rounded-lg bg-(--color-bg-base) border border-(--color-border) shadow-md text-xs font-mono space-y-1">
                                <div className="text-(--color-text-muted) text-[10px]">
                                  {data.date?.split('T')[0]}
                                </div>
                                <div className="font-bold text-(--color-text-primary)">
                                  Portfolio: {formatCurrency(data.portfolioValue, 'INR')}
                                </div>
                                <div className="text-[10px] text-(--color-text-muted)">
                                  Cash: {formatCurrency(data.cash, 'INR')} &bull; Holding: {formatCurrency(data.positionValue, 'INR')}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="portfolioValue"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#equityGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              
              <Card className="p-4 bg-(--color-bg-subtle) border-(--color-border) space-y-3 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-(--color-border)">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-primary)">
                    Strategy Trade Execution Ledger ({trades.length})
                  </h3>
                  {metrics.unrealizedPosition && (
                    <Badge variant="warning" size="sm">
                      Active Holding: {metrics.unrealizedPosition.quantity} shares
                    </Badge>
                  )}
                </div>

                {trades.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Trade #</TableHead>
                          <TableHead>Entry Date</TableHead>
                          <TableHead className="text-right">Entry Price</TableHead>
                          <TableHead>Exit Date</TableHead>
                          <TableHead className="text-right">Exit Price</TableHead>
                          <TableHead className="text-right">Shares</TableHead>
                          <TableHead className="text-right">Net P&amp;L</TableHead>
                          <TableHead className="text-right">Return %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trades.map((t) => (
                          <TableRow key={t.tradeNumber}>
                            <TableCell className="font-bold text-(--color-text-primary)">
                              #{t.tradeNumber}
                            </TableCell>
                            <TableCell className="text-[11px] text-(--color-text-muted)">
                              {t.entryDate?.split('T')[0]}
                            </TableCell>
                            <TableCell className="text-right text-(--color-text-secondary)">
                              {formatCurrency(t.entryPrice, 'INR')}
                            </TableCell>
                            <TableCell className="text-[11px] text-(--color-text-muted)">
                              {t.exitDate?.split('T')[0]}
                            </TableCell>
                            <TableCell className="text-right text-(--color-text-secondary)">
                              {formatCurrency(t.exitPrice, 'INR')}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {t.quantity}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              <span className={t.pnl >= 0 ? 'text-(--color-success)' : 'text-(--color-error)'}>
                                {t.pnl >= 0 ? '+' : ''}{formatCurrency(t.pnl, 'INR')}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              <span className={t.returnPercent >= 0 ? 'text-(--color-success)' : 'text-(--color-error)'}>
                                {t.returnPercent >= 0 ? '+' : ''}{t.returnPercent.toFixed(2)}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-(--color-text-muted) border border-dashed border-(--color-border) rounded-lg">
                    No crossover trades were triggered for the selected parameters. Try widening the date window or adjusting SMA periods.
                  </div>
                )}
              </Card>
            </>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-(--color-border) bg-(--color-bg-subtle)/30 text-center space-y-3 font-mono">
              <div className="w-12 h-12 rounded-xl bg-(--color-bg-raised) flex items-center justify-center text-(--color-brand)">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-(--color-text-primary)">
                No Backtest Result Active
              </h3>
              <p className="text-xs text-(--color-text-muted) max-w-sm">
                Configure your strategy parameters on the left and click &quot;Run Backtest&quot;, or select a previously saved simulation from history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
