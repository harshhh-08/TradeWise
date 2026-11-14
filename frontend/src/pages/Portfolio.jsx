import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatPercent, formatChange } from '@/lib/utils';
import { PortfolioTable } from '@/components/features/PortfolioTable';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';

export default function Portfolio() {
  const { updateWalletCash } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [trades, setTrades] = useState([]);
  const [activeTab, setActiveTab] = useState('positions');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolio = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [portRes, tradeRes] = await Promise.all([
        api.get('/api/portfolio'),
        api.get('/api/trades?limit=50'),
      ]);

      if (portRes.data?.success && portRes.data.portfolio) {
        setPortfolioData(portRes.data.portfolio);
        if (portRes.data.portfolio.availableCash !== undefined) {
          updateWalletCash(portRes.data.portfolio.availableCash);
        }
      }
      if (tradeRes.data?.success && Array.isArray(tradeRes.data.trades)) {
        setTrades(tradeRes.data.trades);
      }
    } catch (err) {
      console.error('Portfolio fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  }, [updateWalletCash]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const availableCash = portfolioData?.availableCash ?? 100000;
  const totalStockValue = portfolioData?.totalStockValue ?? 0;
  const totalInvestedValue = portfolioData?.totalInvestedValue ?? 0;
  const netPortfolioValue = portfolioData?.totalPortfolioValue ?? availableCash;
  const unrealizedPnl = portfolioData?.totalUnrealizedPnl ?? 0;
  const unrealizedPnlPercent = portfolioData?.totalUnrealizedPnlPercent ?? 0;
  const realizedPnl = portfolioData?.totalRealizedPnl ?? 0;
  const holdings = portfolioData?.holdings || [];

  const cashPercent = netPortfolioValue > 0 ? Math.round((availableCash / netPortfolioValue) * 100) : 100;
  const stockPercent = Math.max(0, 100 - cashPercent);

  const tabs = [
    { id: 'positions', label: 'Open Positions', badge: holdings.length },
    { id: 'history', label: 'Execution Ledger', badge: trades.length },
  ];

  if (isLoading && !portfolioData) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-(--color-border)">
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-(--color-border)">
        <div>
          <h1 className="text-lg font-bold font-mono tracking-tight text-(--color-text-primary)">
            PORTFOLIO ACCOUNTING
          </h1>
          <p className="text-[11px] font-mono text-(--color-text-muted)">
            Live mark-to-market valuations from PostgreSQL &amp; NSE market quotes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchPortfolio}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="text-ink-secondary hover:text-ink-primary font-mono text-xs"
          >
            Refresh
          </Button>
          <Link to="/trade">
            <Button size="sm" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
              Order Ticket
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded text-xs font-mono flex items-center justify-between bg-(--color-error-subtle) border border-(--color-error)/30 text-(--color-error)">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="xs" variant="secondary" onClick={fetchPortfolio}>
            Retry
          </Button>
        </div>
      )}

      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <Card className="p-3.5 space-y-0.5">
          <span className="text-[10px] text-(--color-text-muted) uppercase tracking-wider block">
            Net Account Value
          </span>
          <span className="text-xl font-bold text-(--color-text-primary) block">
            {formatCurrency(netPortfolioValue, 'INR')}
          </span>
          <span className="text-[10px] text-(--color-text-muted)">Cash + Open Holdings</span>
        </Card>

        <Card className="p-3.5 space-y-0.5">
          <span className="text-[10px] text-(--color-text-muted) uppercase tracking-wider block">
            Available Cash
          </span>
          <span className="text-xl font-bold text-(--color-brand) block">
            {formatCurrency(availableCash, 'INR')}
          </span>
          <span className="text-[10px] text-(--color-text-muted)">{cashPercent}% of Account</span>
        </Card>

        <Card className="p-3.5 space-y-0.5">
          <span className="text-[10px] text-(--color-text-muted) uppercase tracking-wider block">
            Invested Equity
          </span>
          <span className="text-xl font-bold text-(--color-text-primary) block">
            {formatCurrency(totalStockValue, 'INR')}
          </span>
          <span className="text-[10px] text-(--color-text-muted)">{holdings.length} Active Position(s)</span>
        </Card>

        <Card className="p-3.5 space-y-0.5">
          <span className="text-[10px] text-(--color-text-muted) uppercase tracking-wider block">
            Unrealized Return
          </span>
          <div
            className={`text-xl font-bold flex items-center gap-1 ${
              unrealizedPnl >= 0 ? 'text-(--color-success)' : 'text-(--color-error)'
            }`}
          >
            {unrealizedPnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{formatChange(unrealizedPnl).text}</span>
          </div>
          <span className="text-[10px] text-(--color-text-muted)">
            ({formatPercent(unrealizedPnlPercent).text}) &bull; Realized: {formatCurrency(realizedPnl, 'INR')}
          </span>
        </Card>
      </div>

      
      <div className="p-3.5 rounded-lg border border-(--color-border) bg-(--color-bg-subtle) space-y-1.5 font-mono">
        <div className="flex justify-between text-xs">
          <span className="text-(--color-text-muted)">Capital Allocation</span>
          <span className="text-(--color-text-primary) font-bold">
            {stockPercent}% Equities &bull; {cashPercent}% Cash
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-(--color-bg-raised) overflow-hidden flex">
          <div
            className="h-full bg-(--color-brand) transition-all duration-300"
            style={{ width: `${stockPercent}%` }}
          />
          <div
            className="h-full bg-(--color-success)/80 transition-all duration-300"
            style={{ width: `${cashPercent}%` }}
          />
        </div>
      </div>

      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      
      {activeTab === 'positions' ? (
        <PortfolioTable positions={holdings} />
      ) : trades.length === 0 ? (
        <div className="p-8 text-center rounded-lg border border-(--color-border) bg-(--color-bg-subtle) font-mono text-xs text-(--color-text-muted)">
          No executed trade records found in audit ledger.
        </div>
      ) : (
        <div className="rounded-lg border border-(--color-border) bg-(--color-bg-subtle) overflow-hidden shadow-xs font-mono">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Side</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Consideration</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade, idx) => (
                <TableRow key={trade.id || idx}>
                  <TableCell>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        trade.side === 'BUY'
                          ? 'bg-(--color-success-subtle) text-(--color-success)'
                          : 'bg-(--color-error-subtle) text-(--color-error)'
                      }`}
                    >
                      {trade.side}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-(--color-text-primary)">{trade.symbol}</TableCell>
                  <TableCell className="text-right">{trade.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(trade.price, 'INR')}</TableCell>
                  <TableCell className="text-right font-bold text-(--color-text-primary)">
                    {formatCurrency(trade.quantity * trade.price, 'INR')}
                  </TableCell>
                  <TableCell className="text-right text-(--color-text-muted) text-[10px]">
                    {new Date(trade.executedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
