import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart2,
  Cpu,
  History,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Logo } from '@/components/layout/Logo';

const BENCHMARKS = [
  { name: 'S&P 500', value: '5,864.67', change: '+0.42%', isPos: true },
  { name: 'NASDAQ', value: '18,290.10', change: '+0.81%', isPos: true },
  { name: 'DOW JONES', value: '43,910.25', change: '+0.18%', isPos: true },
  { name: 'RUSSELL 2000', value: '2,214.30', change: '-0.24%', isPos: false },
  { name: 'CBOE VIX', value: '14.85', change: '-1.45%', isPos: false },
];

const PREVIEW_TICKERS = {
  NVDA: { name: 'NVIDIA Corporation', price: 141.54, change: '+3.12%', isPos: true, points: [136, 137, 136.5, 138, 137.8, 139.5, 140, 141.54] },
  AAPL: { name: 'Apple Inc.', price: 224.23, change: '+1.84%', isPos: true, points: [220, 221, 220.5, 222, 221.8, 223, 223.5, 224.23] },
  TSLA: { name: 'Tesla Inc.', price: 218.89, change: '-0.95%', isPos: false, points: [222, 221, 221.5, 220, 219.5, 220, 219, 218.89] },
  MSFT: { name: 'Microsoft Corporation', price: 428.15, change: '+0.62%', isPos: true, points: [425, 426, 425.8, 426.5, 427, 427.5, 428, 428.15] },
};

export default function Landing() {
  const [activeTicker, setActiveTicker] = useState('NVDA');
  const [previewSide, setPreviewSide] = useState('BUY');
  const [previewShares, setPreviewShares] = useState(25);

  const stock = PREVIEW_TICKERS[activeTicker];
  const orderTotal = previewShares * stock.price;

  return (
    <div className="min-h-svh bg-(--color-bg-base) text-(--color-text-primary) flex flex-col selection:bg-(--color-brand) selection:text-white">
      {/* Benchmark Ticker Strip */}
      <div className="border-b border-(--color-border) bg-(--color-bg-subtle)/70 py-1.5 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[700px] text-[11px] font-mono">
          <div className="flex items-center gap-6">
            {BENCHMARKS.map((b) => (
              <div key={b.name} className="flex items-center gap-2">
                <span className="text-(--color-text-muted)">{b.name}</span>
                <span className="font-semibold text-(--color-text-primary)">{b.value}</span>
                <span className={b.isPos ? 'text-(--color-success)' : 'text-(--color-error)'}>
                  {b.change}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-(--color-text-muted) border-l border-(--color-border) pl-4">
            <span className="w-1.5 h-1.5 rounded-full bg-(--color-success) animate-pulse" />
            <span>US MARKETS OPEN</span>
          </div>
        </div>
      </div>

      {/* Primary Header */}
      <header className="h-14 border-b border-(--color-border) sticky top-0 z-30 bg-(--color-bg-base)/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Logo to="/" size="sm" />

          <nav className="hidden md:flex items-center gap-6 text-xs text-(--color-text-secondary)">
            <Link to="/markets" className="hover:text-(--color-text-primary) transition-colors">
              Market Quotes
            </Link>
            <Link to="/trade" className="hover:text-(--color-text-primary) transition-colors">
              Execution Engine
            </Link>
            <Link to="/replay" className="hover:text-(--color-text-primary) transition-colors">
              Candle Replay
            </Link>
            <Link to="/learn" className="hover:text-(--color-text-primary) transition-colors">
              Curriculum
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">
                Launch Terminal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 pb-16 sm:pt-20 sm:pb-24 border-b border-(--color-border)">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left copy (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Logo variant="banner" size="md" className="rounded-lg border border-(--color-border) shadow-xs" />
                <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded bg-(--color-bg-raised) border border-(--color-border) text-[11px] font-mono text-(--color-brand)">
                  <span>SIMULATED BROKERAGE ENVIRONMENT</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12] text-(--color-text-primary)">
                The institutional paper trading terminal.
              </h1>

              <p className="text-sm sm:text-base text-(--color-text-muted) leading-relaxed max-w-xl">
                Experience real-time equity execution, historical tick replay, and comprehensive portfolio analytics without risking capital. Built with the latency, tools, and visual clarity expected by modern quantitative traders.
              </p>

              {/* Terminal Stats strip */}
              <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg font-mono text-xs">
                <div className="p-3 rounded-lg border border-(--color-border) bg-(--color-bg-subtle)">
                  <div className="text-[10px] text-(--color-text-muted)">STARTING CAPITAL</div>
                  <div className="font-bold text-sm text-(--color-text-primary) mt-0.5">$100,000.00</div>
                </div>
                <div className="p-3 rounded-lg border border-(--color-border) bg-(--color-bg-subtle)">
                  <div className="text-[10px] text-(--color-text-muted)">ORDER TYPES</div>
                  <div className="font-bold text-sm text-(--color-text-primary) mt-0.5">Market &amp; Limit</div>
                </div>
                <div className="p-3 rounded-lg border border-(--color-border) bg-(--color-bg-subtle)">
                  <div className="text-[10px] text-(--color-text-muted)">COMMISSION</div>
                  <div className="font-bold text-sm text-(--color-success) mt-0.5">$0.00 FREE</div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link to="/register">
                  <Button size="lg" className="gap-2">
                    <span>Initialize Trading Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/replay">
                  <Button variant="secondary" size="lg">
                    <span>Historical Replay Engine</span>
                  </Button>
                </Link>
              </div>

              {/* Feature check marks */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-(--color-text-muted)">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-(--color-success)" />
                  Zero Credit Card Required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-(--color-success)" />
                  Real Market Feeds
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-(--color-success)" />
                  Instant Execution
                </span>
              </div>
            </div>

            {/* Right Interactive Mockup (5 cols) */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-(--color-border) bg-(--color-bg-subtle) shadow-2xl overflow-hidden">
                {/* Mock header */}
                <div className="h-10 px-4 border-b border-(--color-border) bg-(--color-bg-base) flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-(--color-success) animate-pulse" />
                    <span className="font-semibold">{activeTicker}</span>
                    <span className="text-(--color-text-muted)">{stock.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold">
                    <span>${stock.price.toFixed(2)}</span>
                    <span className={stock.isPos ? 'text-(--color-success)' : 'text-(--color-error)'}>
                      {stock.change}
                    </span>
                  </div>
                </div>

                {/* Mini ticker select tabs */}
                <div className="flex border-b border-(--color-border) bg-(--color-bg-raised)/40 text-xs font-mono">
                  {Object.keys(PREVIEW_TICKERS).map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setActiveTicker(sym)}
                      className={`flex-1 py-1.5 text-center transition-colors cursor-pointer ${
                        activeTicker === sym
                          ? 'bg-(--color-bg-subtle) font-bold text-(--color-text-primary) border-b-2 border-(--color-brand)'
                          : 'text-(--color-text-muted) hover:text-(--color-text-primary)'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>

                {/* Mock Sparkline Graph */}
                <div className="p-5 space-y-4">
                  <div className="h-28 flex items-end gap-2 pt-2 px-1 border-b border-(--color-border)/50">
                    {stock.points.map((val, idx) => {
                      const min = Math.min(...stock.points);
                      const max = Math.max(...stock.points);
                      const heightPct = Math.max(15, Math.round(((val - min) / (max - min || 1)) * 80 + 15));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full rounded-t transition-all duration-300 ${
                              stock.isPos ? 'bg-(--color-success)/70' : 'bg-(--color-error)/70'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Mock Order Form */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 p-1 rounded-lg bg-(--color-bg-base) border border-(--color-border) text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setPreviewSide('BUY')}
                        className={`py-1 rounded font-bold transition-colors cursor-pointer ${
                          previewSide === 'BUY'
                            ? 'bg-(--color-success) text-white'
                            : 'text-(--color-text-muted)'
                        }`}
                      >
                        BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewSide('SELL')}
                        className={`py-1 rounded font-bold transition-colors cursor-pointer ${
                          previewSide === 'SELL'
                            ? 'bg-(--color-error) text-white'
                            : 'text-(--color-text-muted)'
                        }`}
                      >
                        SELL
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-(--color-text-muted)">Order Volume</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewShares(Math.max(5, previewShares - 5))}
                          className="w-6 h-6 rounded bg-(--color-bg-raised) border border-(--color-border) flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-bold text-(--color-text-primary)">
                          {previewShares} shs
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewShares(previewShares + 5)}
                          className="w-6 h-6 rounded bg-(--color-bg-raised) border border-(--color-border) flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono pt-1">
                      <span className="text-(--color-text-muted)">Order Consideration</span>
                      <span className="font-bold text-(--color-text-primary)">
                        {formatCurrency(orderTotal)}
                      </span>
                    </div>

                    <Link to="/register" className="block pt-1">
                      <Button size="md" className="w-full font-mono text-xs">
                        Execute {previewSide} {previewShares} {activeTicker}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Pillars */}
      <section className="py-16 bg-(--color-bg-subtle)/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-xl space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Engineered for market mechanics, not guesswork.
            </h2>
            <p className="text-xs sm:text-sm text-(--color-text-muted)">
              TradeWise bridges the gap between static textbook finance and live exchange execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-lg border border-(--color-border) bg-(--color-bg-base) space-y-3">
              <div className="w-8 h-8 rounded bg-(--color-bg-raised) text-(--color-brand) border border-(--color-border) flex items-center justify-center font-mono">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-mono">Order Routing Simulation</h3>
              <p className="text-xs text-(--color-text-muted) leading-relaxed">
                Execute Market and Limit orders with instant fill validation against real bid/ask prices and available buying power.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-(--color-border) bg-(--color-bg-base) space-y-3">
              <div className="w-8 h-8 rounded bg-(--color-bg-raised) text-(--color-success) border border-(--color-border) flex items-center justify-center font-mono">
                <History className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-mono">Candle Replay Backtester</h3>
              <p className="text-xs text-(--color-text-muted) leading-relaxed">
                Step through historical price action candle-by-candle with blind future data to test pattern recognition and risk-reward discipline.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-(--color-border) bg-(--color-bg-base) space-y-3">
              <div className="w-8 h-8 rounded bg-(--color-bg-raised) text-(--color-info) border border-(--color-border) flex items-center justify-center font-mono">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-mono">Portfolio Performance Analytics</h3>
              <p className="text-xs text-(--color-text-muted) leading-relaxed">
                Track cost basis, unrealized P&amp;L, asset allocation, and fill history in real time as market quotes fluctuate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-(--color-border) bg-(--color-bg-base) py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-(--color-text-muted)">
          <Logo to="/" size="sm" showSubtitle />

          <div className="flex items-center gap-5">
            <Link to="/markets" className="hover:text-(--color-text-primary)">
              Markets
            </Link>
            <Link to="/trade" className="hover:text-(--color-text-primary)">
              Terminal
            </Link>
            <Link to="/learn" className="hover:text-(--color-text-primary)">
              Curriculum
            </Link>
            <Link to="/register" className="text-(--color-brand) font-semibold hover:underline">
              Launch Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
