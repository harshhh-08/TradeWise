import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';

export function WalletBanner({ cash = 100000, invested = 0, dayPnl = 0 }) {
  const totalValue = cash + invested;
  const dayPnlPercent = totalValue > 0 ? (dayPnl / totalValue) * 100 : 0;
  const isUp = dayPnl >= 0;

  return (
    <div className="border border-border-subtle rounded overflow-hidden bg-surface">
      
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border-subtle bg-surface">
        <div className="px-5 py-4">
          <span className="text-xs text-ink-secondary font-sans">Net Liquidation</span>
          <div className="mt-1 flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-semibold text-ink-primary tabular-nums tracking-tight">
              {formatCurrency(totalValue, 'INR')}
            </span>
            <span
              className={`text-xs font-mono tabular-nums ${
                isUp ? 'text-trade-up' : 'text-trade-down'
              }`}
            >
              {isUp ? '+' : ''}
              {dayPnlPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="px-5 py-4">
          <span className="text-xs text-ink-secondary font-sans">Buying Power</span>
          <div className="mt-1 font-mono text-xl font-medium text-ink-primary tabular-nums tracking-tight">
            {formatCurrency(cash, 'INR')}
          </div>
        </div>

        <div className="px-5 py-4">
          <span className="text-xs text-ink-secondary font-sans">Invested Equity</span>
          <div className="mt-1 font-mono text-xl font-medium text-ink-primary tabular-nums tracking-tight">
            {formatCurrency(invested, 'INR')}
          </div>
        </div>

        <div className="px-5 py-4">
          <span className="text-xs text-ink-secondary font-sans">Account Mode</span>
          <div className="mt-1 text-sm font-medium text-ink-primary font-sans">
            1.00x Cash (No Margin)
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountHeader({ cash = 100000, invested = 0, dayPnl = 0 }) {
  return (
    <div className="border border-border-subtle rounded overflow-hidden bg-canvas">
      
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-canvas">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink-primary font-sans">
            Account Overview
          </h1>
          <p className="text-xs text-ink-secondary font-sans">
            Paper Trading Account • INR Cash
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/replay">
            <button className="px-3 py-1.5 text-xs font-medium text-ink-primary bg-surface border border-border-strong rounded hover:bg-elevated transition-colors cursor-pointer">
              Replay Backtest
            </button>
          </Link>
          <Link to="/trade">
            <button className="px-3 py-1.5 text-xs font-medium text-canvas bg-ink-primary rounded hover:bg-zinc-200 transition-colors cursor-pointer">
              New Order
            </button>
          </Link>
        </div>
      </div>

      
      <WalletBanner cash={cash} invested={invested} dayPnl={dayPnl} />
    </div>
  );
}

export default WalletBanner;
