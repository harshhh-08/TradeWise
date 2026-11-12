import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, ArrowUpRight, ArrowLeftRight, Sparkles } from 'lucide-react';
import { formatCurrency, formatChange, formatPercent } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function WalletBanner({ cash = 100000, invested = 0, dayPnl = 1245.50 }) {
  const totalValue = cash + invested;
  const dayPnlPercent = (dayPnl / (totalValue || 1)) * 100;
  const pnlMeta = formatChange(dayPnl);

  return (
    <div className="rounded-2xl bg-linear-to-r from-[var(--color-bg-subtle)] via-[var(--color-bg-base)] to-[var(--color-bg-subtle)] border border-[var(--color-border)] p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Values */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            <Wallet className="w-4 h-4 text-[var(--color-brand)]" />
            <span>Virtual Portfolio Summary</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div>
              <span className="text-xs text-[var(--color-text-muted)] block">Net Portfolio Value</span>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-[var(--color-text-primary)]">
                {formatCurrency(totalValue)}
              </span>
            </div>

            <div className="flex items-center gap-2 pb-1">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${
                  pnlMeta.isPositive
                    ? 'bg-[var(--color-success-subtle)] text-[var(--color-success)]'
                    : 'bg-[var(--color-error-subtle)] text-[var(--color-error)]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{pnlMeta.text}</span>
                <span>({formatPercent(dayPnlPercent).text})</span>
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">Today</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-[var(--color-border)] text-xs">
            <div>
              <span className="text-[var(--color-text-muted)]">Available Cash</span>
              <p className="font-mono font-semibold text-[var(--color-text-primary)] mt-0.5">
                {formatCurrency(cash)}
              </p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Invested Capital</span>
              <p className="font-mono font-semibold text-[var(--color-text-primary)] mt-0.5">
                {formatCurrency(invested)}
              </p>
            </div>
            <div className="hidden sm:block">
              <span className="text-[var(--color-text-muted)]">Simulated Margin</span>
              <p className="font-mono font-semibold text-[var(--color-brand)] mt-0.5">
                1.0x (Cash Account)
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-center">
          <Link to="/trade">
            <Button
              className="w-full justify-center"
              leftIcon={<ArrowLeftRight className="w-4 h-4" />}
            >
              Paper Trade
            </Button>
          </Link>
          <Link to="/markets">
            <Button
              variant="outline"
              className="w-full justify-center"
              rightIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              Explore Markets
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
