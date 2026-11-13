import { Link, Outlet } from 'react-router-dom';
import { Activity, Shield, Terminal, ArrowUpRight } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-svh flex bg-(--color-bg-base) text-(--color-text-primary) selection:bg-(--color-brand) selection:text-white">
      {/* Brand panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-(--color-bg-subtle) border-r border-(--color-border) relative overflow-hidden">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-(--color-brand) flex items-center justify-center text-white font-mono font-bold text-xs shadow-xs">
              TW
            </div>
            <span className="font-bold font-mono tracking-wider text-xs">TRADEWISE</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-(--color-success) px-2 py-0.5 rounded bg-(--color-bg-raised) border border-(--color-border)">
            <span className="w-1.5 h-1.5 rounded-full bg-(--color-success) animate-pulse" />
            <span>LIVE DATA FEED</span>
          </div>
        </div>

        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-(--color-brand)">
              Paper Trading Environment
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Institutional-grade market practice. Zero financial exposure.
            </h2>
          </div>

          <div className="rounded-lg border border-(--color-border) bg-(--color-bg-base) p-4 space-y-3 font-mono text-xs">
            <div className="text-[10px] text-(--color-text-muted) uppercase tracking-wider border-b border-(--color-border) pb-2">
              Default Account Provisioning
            </div>
            <div className="flex justify-between py-1">
              <span className="text-(--color-text-muted)">Initial Buying Power</span>
              <span className="font-bold text-(--color-text-primary)">$100,000.00 USD</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-(--color-text-muted)">Execution Model</span>
              <span className="font-semibold text-(--color-text-primary)">Market &amp; Limit Sim</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-(--color-text-muted)">Exchange Feeds</span>
              <span className="font-semibold text-(--color-text-primary)">NASDAQ / NYSE Equities</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-(--color-text-muted)">Commission Schedule</span>
              <span className="text-(--color-success)">$0.00 (Zero Fee)</span>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-(--color-text-muted) flex items-center justify-between pt-6 border-t border-(--color-border)">
          <span>&copy; {new Date().getFullYear()} TradeWise.</span>
          <Link to="/" className="text-(--color-brand) hover:underline inline-flex items-center gap-1">
            <span>Terminal Home</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-6 h-6 rounded bg-(--color-brand) flex items-center justify-center text-white font-mono font-bold text-xs">
              TW
            </div>
            <span className="font-bold font-mono tracking-wider text-xs">TRADEWISE</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
