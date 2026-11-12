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
      <div className="p-8 text-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-2.5 font-mono">
        <div className="w-9 h-9 rounded bg-[var(--color-bg-raised)] text-[var(--color-text-muted)] flex items-center justify-center mx-auto">
          <PieChart className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-[var(--color-text-primary)]">
            NO OPEN POSITIONS
          </h3>
          <p className="text-[11px] text-[var(--color-text-muted)] max-w-sm mx-auto">
            100% Cash Allocation. Transmit an equity order to establish an open holding.
          </p>
        </div>
        <Link to="/markets" className="inline-block pt-1">
          <Button size="sm" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
            Open Screener
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Avg Price</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Position Value</TableHead>
            <TableHead className="text-right">Unrealized P&amp;L</TableHead>
            <TableHead className="text-right">Action</TableHead>
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
                    {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{formatChange(pnl).text}</span>
                    <span className="text-[10px]">({formatPercent(pnlPercent).text})</span>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <Link to={`/trade?symbol=${pos.symbol}`}>
                    <Button size="sm" variant="outline" className="font-mono text-[11px]">
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
