import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { formatCurrency, formatChange, formatPercent } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function WalletBanner({ cash = 100000, invested = 0, dayPnl = 0 }) {
  const totalValue = cash + invested;
  const dayPnlPercent = totalValue ? (dayPnl / totalValue) * 100 : 0;
  const pnlMeta = formatChange(dayPnl);

  const cashRatio = totalValue ? Math.round((cash / totalValue) * 100) : 100;
  const equityRatio = 100 - cashRatio;

  return (
    <div className="rounded-lg border border-(--color-border) bg-(--color-bg-subtle) p-5 shadow-xs space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Net Value & Day's Return */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-(--color-text-muted)">
              Simulated Account Net Value
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-(--color-bg-raised) text-(--color-brand) border border-(--color-border)">
              USD CASH
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-(--color-text-primary)">
              {formatCurrency(totalValue)}
            </span>

            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                  pnlMeta.isPositive
                    ? 'bg-(--color-success-subtle) text-(--color-success)'
                    : 'bg-(--color-error-subtle) text-(--color-error)'
                }`}
              >
                {pnlMeta.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{pnlMeta.text}</span>
                <span>({formatPercent(dayPnlPercent).text})</span>
              </span>
              <span className="text-[11px] font-mono text-(--color-text-muted)">Session</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Order Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/trade">
            <Button size="md" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
              Order Ticket
            </Button>
          </Link>
          <Link to="/markets">
            <Button variant="outline" size="md" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              Market Screener
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-(--color-border) text-xs font-mono">
        <div>
          <span className="text-[11px] text-(--color-text-muted) block">Available Cash</span>
          <span className="font-bold text-(--color-text-primary) block mt-0.5">
            {formatCurrency(cash)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-(--color-text-muted) block">Invested Equity</span>
          <span className="font-bold text-(--color-text-primary) block mt-0.5">
            {formatCurrency(invested)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-(--color-text-muted) block">Portfolio Leverage</span>
          <span className="font-bold text-(--color-brand) block mt-0.5">
            1.00x (Cash)
          </span>
        </div>
        <div>
          <span className="text-[11px] text-(--color-text-muted) block">Cash / Equity Split</span>
          <span className="font-bold text-(--color-text-secondary) block mt-0.5">
            {cashRatio}% / {equityRatio}%
          </span>
        </div>
      </div>
    </div>
  );
}
