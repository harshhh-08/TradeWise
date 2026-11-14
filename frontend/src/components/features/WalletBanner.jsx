import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowLeftRight, ShieldCheck, Zap, Layers } from 'lucide-react';
import { formatCurrency, formatChange, formatPercent } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function WalletBanner({ cash = 100000, invested = 0, dayPnl = 0 }) {
  const totalValue = cash + invested;
  const dayPnlPercent = totalValue ? (dayPnl / totalValue) * 100 : 0;
  const pnlMeta = formatChange(dayPnl);

  const cashRatio = totalValue ? Math.round((cash / totalValue) * 100) : 100;
  const equityRatio = 100 - cashRatio;

  return (
    <div className="card-worldclass rounded-2xl border border-(--color-border) bg-(--color-bg-subtle) p-6 shadow-md relative overflow-hidden space-y-5">
      {/* Background ambient lighting streak */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-(--color-brand)/10 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Net Value & Day's Return */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-(--color-text-muted) flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-(--color-brand)" />
              Simulated Account Net Liquidation Value
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-(--color-brand-subtle) text-(--color-brand) border border-(--color-brand)/20 font-bold">
              USD CASH ACCOUNT
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-(--color-text-primary) tabular">
              {formatCurrency(totalValue)}
            </span>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold shadow-xs ${
                  pnlMeta.isPositive
                    ? 'bg-(--color-success-subtle) text-(--color-success) border border-(--color-success)/25'
                    : 'bg-(--color-error-subtle) text-(--color-error) border border-(--color-error)/25'
                }`}
              >
                {pnlMeta.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{pnlMeta.text}</span>
                <span>({formatPercent(dayPnlPercent).text})</span>
              </span>
              <span className="text-[11px] font-mono text-(--color-text-muted)">Today's Return</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Order Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/trade">
            <Button size="lg" className="shadow-[0_4px_20px_-4px_var(--color-brand)]" leftIcon={<ArrowLeftRight className="w-4 h-4" />}>
              Order Ticket
            </Button>
          </Link>
          <Link to="/markets">
            <Button variant="secondary" size="lg" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              Market Screener
            </Button>
          </Link>
        </div>
      </div>

      {/* Allocation Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-(--color-text-muted)">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-(--color-brand)" />
            Asset Allocation: Cash ({cashRatio}%) vs Equity ({equityRatio}%)
          </span>
          <span className="text-(--color-text-secondary) font-semibold">1.00x Buying Power</span>
        </div>
        <div className="w-full h-2 rounded-full bg-(--color-bg-raised) overflow-hidden flex border border-(--color-border)">
          <div
            className="h-full bg-(--color-brand) transition-all duration-500 rounded-l-full"
            style={{ width: `${cashRatio}%` }}
            title={`Cash: ${cashRatio}%`}
          />
          <div
            className="h-full bg-(--color-success) transition-all duration-500 rounded-r-full"
            style={{ width: `${equityRatio}%` }}
            title={`Equity: ${equityRatio}%`}
          />
        </div>
      </div>

      {/* Metric row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-(--color-border) text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-(--color-bg-raised)/50 border border-(--color-border)/60">
          <span className="text-[11px] text-(--color-text-muted) block">Available Buying Power</span>
          <span className="text-sm font-bold text-(--color-text-primary) block mt-1 tabular">
            {formatCurrency(cash)}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-(--color-bg-raised)/50 border border-(--color-border)/60">
          <span className="text-[11px] text-(--color-text-muted) block">Active Portfolio Equity</span>
          <span className="text-sm font-bold text-(--color-text-primary) block mt-1 tabular">
            {formatCurrency(invested)}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-(--color-bg-raised)/50 border border-(--color-border)/60">
          <span className="text-[11px] text-(--color-text-muted) block">Margin &amp; Leverage</span>
          <span className="text-sm font-bold text-(--color-brand) block mt-1">
            Cash Only (Zero Debt)
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-(--color-bg-raised)/50 border border-(--color-border)/60">
          <span className="text-[11px] text-(--color-text-muted) block">Execution Latency</span>
          <span className="text-sm font-bold text-(--color-success) flex items-center gap-1 mt-1">
            <Zap className="w-3.5 h-3.5 fill-(--color-success)" />
            &lt; 5ms (Simulated)
          </span>
        </div>
      </div>
    </div>
  );
}
