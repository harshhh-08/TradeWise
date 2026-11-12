import { Link, Outlet } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Zap, BookOpen } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-svh flex bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      {/* Brand panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-linear-to-br from-[var(--color-bg-subtle)] via-[var(--color-bg-base)] to-[var(--color-bg-subtle)] border-r border-[var(--color-border)] relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-brand)] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            TW
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">TradeWise</h1>
            <p className="text-xs text-[var(--color-text-muted)]">Risk-Free Paper Trading & Learning</p>
          </div>
        </div>

        <div className="space-y-6 max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Master the market before risking real money.
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            Get $100,000 in virtual trading capital. Test your strategies with live market data, interactive lessons, and historical replay.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <TrendingUp className="w-4 h-4 text-[var(--color-success)] mb-2" />
              <div className="text-xs font-semibold">Live Quotes</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">Real market feeds</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <Zap className="w-4 h-4 text-[var(--color-brand)] mb-2" />
              <div className="text-xs font-semibold">$100k Virtual Cash</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">Zero financial risk</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <BookOpen className="w-4 h-4 text-[var(--color-info)] mb-2" />
              <div className="text-xs font-semibold">Bite-sized Lessons</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">Quizzes with feedback</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <ShieldCheck className="w-4 h-4 text-[var(--color-warning)] mb-2" />
              <div className="text-xs font-semibold">Replay Mode</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">Practice any era</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-[var(--color-text-muted)] flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} TradeWise. Built for learners.</span>
          <Link to="/" className="text-[var(--color-brand)] hover:underline">
            Back to Home
          </Link>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-white font-bold text-sm">
              TW
            </div>
            <span className="font-bold tracking-tight text-base">TradeWise</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}

