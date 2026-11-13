import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatPercent, formatChange } from '@/lib/utils';
import { PortfolioTable } from '@/components/features/PortfolioTable';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
    if (confirm('Reset your simulated portfolio ledger back to $100,000 cash and clear open positions?')) {
      localStorage.removeItem('tradewise_positions');
      localStorage.removeItem('tradewise_trades');
      updateWalletCash(100000);
      setPositions([]);
      setTrades([]);
    }
  };

  const tabs = [
    { id: 'positions', label: 'Open Positions', badge: positions.length },
    { id: 'history', label: 'Execution Ledger', badge: trades.length },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-(--color-border)">
        <div>
          <h1 className="text-lg font-bold font-mono tracking-tight text-(--color-text-primary)">
            PORTFOLIO ACCOUNTING // POSITIONS &amp; P&amp;L
          </h1>
          <p className="text-[11px] font-mono text-(--color-text-muted)">
            Mark-to-market valuations and trade audit log
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/trade">
            <Button size="sm" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
              Order Ticket
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetPortfolio}
            className="text-(--color-text-muted) hover:text-(--color-error) font-mono text-xs"
          >
            Reset Ledger
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <Card className="p-3.5 space-y-0.5">
          <span className="text-[10px] text-(--color-text-muted) uppercase tracking-wider block">
            Net Account Value
          </span>
          <span className="text-xl font-bold text-(--color-text-primary) block">
            {formatCurrency(netPortfolioValue)}
          </span>
          <span className="text-[10px] text-(--color-text-muted)">Cash + Open Holdings</span>
        </Card>

        <Card className="p-3.5 space-y-0.5">
          <span className="text-[10px] text-(--color-text-muted) uppercase tracking-wider block">
            Available Cash
          </span>
          <span className="text-xl font-bold text-(--color-brand) block">
            {formatCurrency(walletBalance)}
          </span>
          <span className="text-[10px] text-(--color-text-muted)">{cashPercent}% of Account</span>
        </Card>

        <Card className="p-3.5 space-y-0.5">
          <span className="text-[10px] text-(--color-text-muted) uppercase tracking-wider block">
            Invested Equity
          </span>
          <span className="text-xl font-bold text-(--color-text-primary) block">
            {formatCurrency(totalStockValue)}
          </span>
          <span className="text-[10px] text-(--color-text-muted)">{positions.length} Active Position(s)</span>
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
            ({formatPercent(unrealizedPnlPercent).text})
          </span>
        </Card>
      </div>

      {/* Allocation Bar */}
      <div className="p-3.5 rounded-lg border border-(--color-border) bg-(--color-bg-subtle) space-y-1.5 font-mono">
        <div className="flex justify-between text-xs">
          <span className="text-(--color-text-muted)">Capital Split</span>
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

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'positions' ? (
        <PortfolioTable positions={positions} marketPrices={SAMPLE_MARKET_PRICES} />
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
                <TableRow key={idx}>
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
                  <TableCell className="text-right">{formatCurrency(trade.price)}</TableCell>
                  <TableCell className="text-right font-bold text-(--color-text-primary)">
                    {formatCurrency(trade.quantity * trade.price)}
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
