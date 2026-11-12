import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowLeftRight, PieChart } from 'lucide-react';
import { formatCurrency, formatPercent, formatChange } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';

export function PortfolioTable({ positions = [], marketPrices = {} }) {
  if (!positions || positions.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] space-y-3">
        <div className="w-12 h-12 rounded-full bg-[var(--color-bg-raised)] text-[var(--color-text-muted)] flex items-center justify-center mx-auto">
          <PieChart className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            No active positions
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
            You are currently holding 100% cash. Search equities on the Markets page or place a paper trade to start building your simulated portfolio.
          </p>
        </div>
        <Link to="/markets" className="inline-block pt-2">
          <Button size="sm" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
            Find Stocks to Trade
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Avg Cost</TableHead>
            <TableHead className="text-right">Market Price</TableHead>
            <TableHead className="text-right">Position Value</TableHead>
            <TableHead className="text-right">Unrealized P&L</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((pos) => {
            const currentPrice = marketPrices[pos.symbol] || pos.avgCost * 1.025;
            const marketValue = pos.quantity * currentPrice;
            const totalCost = pos.quantity * pos.avgCost;
            const pnl = marketValue - totalCost;
            const pnlPercent = totalCost ? (pnl / totalCost) * 100 : 0;
            const isPos = pnl >= 0;

            return (
              <TableRow key={pos.symbol}>
                <TableCell>
                  <Link
                    to={`/stocks/${pos.symbol}`}
                    className="font-bold font-mono text-xs text-[var(--color-text-primary)] hover:text-[var(--color-brand)] transition-colors"
                  >
                    {pos.symbol}
                  </Link>
                </TableCell>

                <TableCell className="text-right font-mono font-medium">
                  {pos.quantity}
                </TableCell>

                <TableCell className="text-right font-mono text-[var(--color-text-muted)]">
                  {formatCurrency(pos.avgCost)}
                </TableCell>

                <TableCell className="text-right font-mono font-semibold">
                  {formatCurrency(currentPrice)}
                </TableCell>

                <TableCell className="text-right font-mono font-bold">
                  {formatCurrency(marketValue)}
                </TableCell>

                <TableCell className="text-right">
                  <div
                    className={`inline-flex items-center gap-1 font-mono font-semibold text-xs ${
                      isPos ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                    }`}
                  >
                    {isPos ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>{formatChange(pnl).text}</span>
                    <span className="text-[10px]">({formatPercent(pnlPercent).text})</span>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <Link to={`/trade?symbol=${pos.symbol}`}>
                    <Button size="sm" variant="outline">
                      Trade
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
