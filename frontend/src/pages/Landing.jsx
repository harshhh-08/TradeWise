import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Shield,
  BookOpen,
  History,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BarChart3,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const MARKET_TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: '$224.23', change: '+1.84%', positive: true },
  { symbol: 'NVDA', name: 'Nvidia Corp.', price: '$141.54', change: '+3.12%', positive: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: '$218.89', change: '-0.95%', positive: false },
  { symbol: 'MSFT', name: 'Microsoft', price: '$428.15', change: '+0.62%', positive: true },
  { symbol: 'AMZN', name: 'Amazon.com', price: '$186.40', change: '+1.15%', positive: true },
];

export default function Landing() {
  return (
    <div className="min-h-svh bg-[var(--color-bg-base)] text-[var(--color-text-primary)] flex flex-col">
      {/* Navigation */}
      <header className="h-16 border-b border-[var(--color-border)] sticky top-0 z-30 bg-[var(--color-bg-base)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              TW
            </div>
            <span className="font-bold tracking-tight text-base">TradeWise</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[var(--color-text-muted)]">
            <a href="#features" className="hover:text-[var(--color-text-primary)] transition-colors">
              Features
            </a>
            <Link to="/markets" className="hover:text-[var(--color-text-primary)] transition-colors">
              Live Markets
            </Link>
            <Link to="/learn" className="hover:text-[var(--color-text-primary)] transition-colors">
              Lessons
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-subtle)] border border-[var(--color-brand)]/20 text-[var(--color-brand)] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Risk-Free Paper Trading & Market Education</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-[var(--color-text-primary)]">
            Learn to trade. <br className="hidden sm:inline" />
            <span className="text-[var(--color-brand)]">Risk nothing.</span> Master the markets.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed">
            TradeWise gives you $100,000 in virtual capital backed by live market feeds,
            interactive financial quizzes, and historical candle replay. Build confidence before your first real trade.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Trading with $100k
              </Button>
            </Link>
            <Link to="/markets" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore Live Quotes
              </Button>
            </Link>
          </div>

          <div className="pt-6 flex items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
              <span>No credit card needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
              <span>Real Yahoo / Twelve Data feeds</span>
            </div>
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
              <span>Interactive curriculum</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live ticker bar */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-3">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[640px] gap-6">
            {MARKET_TICKERS.map((ticker) => (
              <Link
                key={ticker.symbol}
                to={`/stocks/${ticker.symbol}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="font-bold text-xs font-mono">{ticker.symbol}</span>
                <span className="text-xs text-[var(--color-text-muted)] font-mono">{ticker.price}</span>
                <span
                  className={`text-xs font-mono font-medium ${
                    ticker.positive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                  }`}
                >
                  {ticker.change}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Terminal Showcase */}
      <section className="py-16 bg-[var(--color-bg-base)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-[var(--color-text-muted)]">
                  tradewise-terminal // AAPL — 1D
                </span>
              </div>
              <div className="text-xs font-mono text-[var(--color-success)]">
                ● Market Data Connected
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-mono">AAPL &bull; Apple Inc.</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">NASDAQ &bull; USD</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold font-mono text-[var(--color-text-primary)]">
                      $224.23
                    </div>
                    <div className="text-xs font-mono font-semibold text-[var(--color-success)]">
                      +$4.05 (+1.84%) Today
                    </div>
                  </div>
                </div>

                {/* Simulated Chart Line */}
                <div className="h-44 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border)] p-4 flex flex-col justify-end">
                  <div className="flex items-end gap-1.5 h-28 w-full">
                    {[35, 42, 38, 55, 60, 52, 68, 74, 70, 85, 82, 95, 90, 100].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-[var(--color-brand)]/30 hover:bg-[var(--color-brand)] rounded-t transition-all"
                          style={{ height: `${h}%` }}
                        />
                      )
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)] font-mono">
                    <span>09:30 AM</span>
                    <span>11:30 AM</span>
                    <span>01:30 PM</span>
                    <span>04:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Order Slip Preview */}
              <div className="p-4 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border)] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Quick Trade Ticket
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="py-1.5 text-center text-xs font-bold rounded-lg bg-[var(--color-success)] text-white">
                    BUY
                  </div>
                  <div className="py-1.5 text-center text-xs font-semibold rounded-lg bg-[var(--color-bg-raised)] text-[var(--color-text-muted)]">
                    SELL
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)]">Shares</span>
                    <span className="font-mono font-semibold">50</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)]">Order Type</span>
                    <span className="font-semibold">Market</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)]">Est. Cost</span>
                    <span className="font-mono font-semibold">$11,211.50</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--color-text-muted)]">Cash Balance</span>
                    <span className="font-mono font-semibold text-[var(--color-brand)]">$100,000.00</span>
                  </div>
                </div>
                <Link to="/register" className="block pt-2">
                  <Button size="sm" className="w-full">
                    Open Free Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section id="features" className="py-20 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to master equities</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Designed from the ground up for aspiring traders and long-term investors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border)] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-subtle)] text-[var(--color-brand)] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold">Risk-Free Paper Portfolio</h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Execute market and limit orders with $100,000 in simulated purchasing power. Track your unrealized P&L, holdings, and order history without risking capital.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border)] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-success-subtle)] text-[var(--color-success)] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold">Interactive Lessons & Quizzes</h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Learn fundamental analysis, candlestick charting patterns, order mechanics, and risk management with bite-sized lessons and instant quiz feedback.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border)] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-info-subtle)] text-[var(--color-info)] flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold">Candle Replay Simulator</h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Travel back in time to past market crashes and bull runs. Step forward candle-by-candle to practice entries, stop-losses, and profit targets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-bg-base)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--color-brand)] flex items-center justify-center text-white font-bold text-xs">
              TW
            </div>
            <span className="font-semibold text-[var(--color-text-primary)]">TradeWise</span>
            <span>&bull; Educational stock simulator</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/markets" className="hover:text-[var(--color-text-primary)]">
              Markets
            </Link>
            <Link to="/learn" className="hover:text-[var(--color-text-primary)]">
              Curriculum
            </Link>
            <Link to="/register" className="text-[var(--color-brand)] hover:underline font-semibold">
              Get Started Free
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
