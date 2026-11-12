import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatPercent, formatChange } from '@/lib/utils';
import { PortfolioTable } from '@/components/features/PortfolioTable';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';

const SAMPLE_MARKET_PRICES = {
  AAPL: 224.23,
  NVDA: 141.54,
  MSFT: 428.15,
  AMZN: 186.40,
  TSLA: 218.89,
  GOOGL: 178.35,
  META: 582.40,
  AMD: 154.20,
};

export default function Portfolio() {
  const { walletBalance, updateWalletCash } = useAuth();
  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [activeTab, setActiveTab] = useState('positions');

  useEffect(() => {
    try {
      const savedPos = localStorage.getItem('tradewise_positions');
      if (savedPos) setPositions(JSON.parse(savedPos));

      const savedTrades = localStorage.getItem('tradewise_trades');
      if (savedTrades) setTrades(JSON.parse(savedTrades));
    } catch (_) {}
  }, []);

  // Compute portfolio metrics
  const totalStockValue = positions.reduce((sum, pos) => {
    const cur = SAMPLE_MARKET_PRICES[pos.symbol] || pos.avgCost * 1.02;
    return sum + pos.quantity * cur;
  }, 0);

  const totalCostBasis = positions.reduce((sum, pos) => sum + pos.quantity * pos.avgCost, 0);
  const unrealizedPnl = totalStockValue - totalCostBasis;
  const unrealizedPnlPercent = totalCostBasis ? (unrealizedPnl / totalCostBasis) * 100 : 0;
  const netPortfolioValue = walletBalance + totalStockValue;

  const cashPercent = netPortfolioValue ? Math.round((walletBalance / netPortfolioValue) * 100) : 100;
  const stockPercent = 100 - cashPercent;

  const handleResetPortfolio = () => {
    if (confirm('Reset your paper trading account back to $100,000 cash and clear all positions?')) {
      localStorage.removeItem('tradewise_positions');
      localStorage.removeItem('tradewise_trades');
      updateWalletCash(100000);
      setPositions([]);
      setTrades([]);
    }
  };

  const tabs = [
    { id: 'positions', label: 'Holdings', badge: positions.length },
    { id: 'history', label: 'Trade History', badge: trades.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Portfolio & Holdings
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Track your open equity positions, cash balances, and trade execution logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/trade">
            <Button size="sm" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
              Place Trade
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetPortfolio}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
          >
            Reset Account
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Net Portfolio Value</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--color-text-primary)] block">
            {formatCurrency(netPortfolioValue)}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">Cash + Market Value</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Buying Power</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--color-brand)] block">
            {formatCurrency(walletBalance)}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">Available Cash ({cashPercent}%)</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Equity Value</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--color-text-primary)] block">
            {formatCurrency(totalStockValue)}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">{positions.length} Active Asset(s)</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Total Unrealized P&L</span>
          <div
            className={`text-xl sm:text-2xl font-bold font-mono flex items-center gap-1 ${
              unrealizedPnl >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
            }`}
          >
            {unrealizedPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>{formatChange(unrealizedPnl).text}</span>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)]">
            ({formatPercent(unrealizedPnlPercent).text})
          </span>
        </Card>
      </div>

      {/* Asset Allocation Bar */}
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-[var(--color-text-secondary)]">Asset Allocation</span>
          <span className="text-[var(--color-text-muted)] font-mono">
            {stockPercent}% Equities / {cashPercent}% Cash
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[var(--color-bg-raised)] overflow-hidden flex">
          <div
            className="h-full bg-[var(--color-brand)] transition-all duration-300"
            style={{ width: `${stockPercent}%` }}
          />
          <div
            className="h-full bg-[var(--color-success)]/70 transition-all duration-300"
            style={{ width: `${cashPercent}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'positions' ? (
        <PortfolioTable positions={positions} marketPrices={SAMPLE_MARKET_PRICES} />
      ) : trades.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] text-xs text-[var(--color-text-muted)]">
          No executed trade history recorded yet.
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Exec Price</TableHead>
                <TableHead className="text-right">Total Consideration</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Badge variant={trade.side === 'BUY' ? 'success' : 'error'} size="sm">
                      {trade.side}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono font-bold">{trade.symbol}</TableCell>
                  <TableCell className="text-right font-mono">{trade.quantity}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(trade.price)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(trade.quantity * trade.price)}
                  </TableCell>
                  <TableCell className="text-right text-[var(--color-text-muted)] font-mono text-[11px]">
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
