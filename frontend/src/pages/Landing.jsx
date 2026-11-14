import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart2,
  Cpu,
  History,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();
  const [activeTicker, setActiveTicker] = useState('NVDA');
  const [previewSide, setPreviewSide] = useState('BUY');
  const [previewShares, setPreviewShares] = useState(25);

  const stock = PREVIEW_TICKERS[activeTicker];
  const orderTotal = previewShares * stock.price;

  return (
    <div className="min-h-svh bg-canvas text-ink-primary flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Benchmark Ticker Strip */}
      <div className="border-b border-border-subtle bg-surface py-2 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[700px] text-xs">
          <div className="flex items-center gap-6">
            {BENCHMARKS.map((b) => (
              <div key={b.name} className="flex items-center gap-2">
                <span className="text-ink-secondary font-sans">{b.name}</span>
                <span className="font-medium text-ink-primary font-mono tabular-nums">{b.value}</span>
                <span className={`font-mono text-xs tabular-nums ${b.isPos ? 'text-trade-up' : 'text-trade-down'}`}>
                  {b.change}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-secondary border-l border-border-subtle pl-4 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-ink-primary">US Markets Open</span>
          </div>
        </div>
      </div>

      {/* Primary Header */}
      <header className="h-14 border-b border-border-subtle sticky top-0 z-30 bg-surface">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size={26} layout="horizontal" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-ink-secondary font-medium">
            <Link to="/markets" className="hover:text-ink-primary transition-colors">
              Market Quotes
            </Link>
            <Link to="/trade" className="hover:text-ink-primary transition-colors">
              Execution Engine
            </Link>
            <Link to="/replay" className="hover:text-ink-primary transition-colors">
              Candle Replay
            </Link>
            <Link to="/learn" className="hover:text-ink-primary transition-colors">
              Curriculum
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded border border-border-subtle bg-canvas text-ink-secondary hover:text-ink-primary hover:bg-elevated transition-colors cursor-pointer flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Ivory Mist (Light Mode)' : 'Switch to Obsidian Pro (Dark Mode)'}
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-ink-primary" />
              )}
            </button>
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
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-mono uppercase tracking-widest text-ink-muted">
                INSTITUTIONAL BROKERAGE SIMULATOR
              </div>

              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] text-ink-primary font-sans">
                The terminal for elite market execution.
              </h1>

              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-xl font-sans">
                Test equity strategies against real-time NASDAQ and NYSE market feeds. Practice order execution, risk sizing, and historical market regimes with $100,000 in virtual capital.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/register">
                  <button className="px-4 py-2 text-xs font-medium text-canvas bg-ink-primary rounded hover:bg-zinc-200 transition-colors inline-flex items-center gap-2 cursor-pointer">
                    <span>Open $100k Paper Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <Link to="/markets">
                  <button className="px-4 py-2 text-xs font-medium text-ink-primary bg-surface border border-border-strong rounded hover:bg-elevated transition-colors cursor-pointer">
                    Explore Screener
                  </button>
                </Link>
              </div>

              <div className="pt-2 flex items-center gap-6 text-xs text-ink-secondary font-sans">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-trade-up" />
                  <span>Real market feeds</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-trade-up" />
                  <span>Zero capital risk</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview */}
            <div className="lg:col-span-5">
              <div className="rounded border border-border-subtle bg-surface overflow-hidden">
                {/* Terminal top chrome */}
                <div className="h-10 px-4 bg-surface border-b border-border-subtle flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium text-ink-primary">Live Simulator</span>
                  </div>
                  <span className="font-mono text-xs text-ink-secondary tabular-nums">
                    Buying Power: $100,000.00
                  </span>
                </div>

                {/* Ticker switch tabs */}
                <div className="flex items-center border-b border-border-subtle bg-canvas">
                  {Object.keys(PREVIEW_TICKERS).map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setActiveTicker(sym)}
                      className={`flex-1 py-2 text-xs font-mono tabular-nums transition-colors cursor-pointer border-r last:border-r-0 border-border-subtle ${
                        activeTicker === sym
                          ? 'bg-surface text-ink-primary font-medium'
                          : 'text-ink-muted hover:text-ink-primary hover:bg-elevated'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>

                {/* Price display & mini sparkline */}
                <div className="p-5 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-xl font-medium font-mono tracking-tight text-ink-primary tabular-nums">
                        {activeTicker}
                      </div>
                      <div className="text-xs text-ink-secondary truncate max-w-[160px] font-sans">
                        {stock.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold font-mono text-ink-primary tabular-nums">
                        {formatCurrency(stock.price)}
                      </div>
                      <div
                        className={`text-xs font-mono tabular-nums ${
                          stock.isPos ? 'text-trade-up' : 'text-trade-down'
                        }`}
                      >
                        {stock.change}
                      </div>
                    </div>
                  </div>

                  {/* SVG Line Preview */}
                  <div className="h-28 w-full bg-canvas rounded-sm border border-border-subtle p-3 flex items-center overflow-hidden relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke={stock.isPos ? '#10B981' : '#EF4444'}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={stock.points
                          .map((val, i) => {
                            const min = Math.min(...stock.points);
                            const max = Math.max(...stock.points);
                            const y = 32 - ((val - min) / ((max - min) || 1)) * 24;
                            const x = (i / (stock.points.length - 1)) * 100;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    </svg>
                  </div>

                  {/* Simulated Order Ticket */}
                  <div className="pt-2 border-t border-border-subtle space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewSide('BUY')}
                        className={`py-1.5 text-xs font-medium font-mono rounded cursor-pointer transition-colors ${
                          previewSide === 'BUY'
                            ? 'bg-trade-up text-white'
                            : 'bg-elevated text-ink-secondary border border-border-subtle'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewSide('SELL')}
                        className={`py-1.5 text-xs font-medium font-mono rounded cursor-pointer transition-colors ${
                          previewSide === 'SELL'
                            ? 'bg-trade-down text-white'
                            : 'bg-elevated text-ink-secondary border border-border-subtle'
                        }`}
                      >
                        Sell
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-ink-secondary">Shares</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewShares((s) => Math.max(5, s - 5))}
                          className="w-6 h-6 flex items-center justify-center rounded bg-elevated border border-border-subtle text-xs text-ink-primary hover:bg-zinc-800"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-mono text-xs tabular-nums text-ink-primary">
                          {previewShares}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewShares((s) => s + 5)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-elevated border border-border-subtle text-xs text-ink-primary hover:bg-zinc-800"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-ink-secondary font-sans">Order Consideration</span>
                      <span className="font-medium font-mono text-ink-primary tabular-nums">
                        {formatCurrency(orderTotal)}
                      </span>
                    </div>

                    <Link to="/register" className="block pt-1">
                      <button className="w-full py-2 text-xs font-medium text-canvas bg-ink-primary rounded hover:bg-zinc-200 transition-colors cursor-pointer">
                        Transmit {previewSide === 'BUY' ? 'Buy' : 'Sell'} Order
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Pillars - Docked Grid */}
      <section className="border-b border-border-subtle bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-xl space-y-2 mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink-primary font-sans">
              Engineered for market mechanics.
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed font-sans">
              Built for traders who value speed, data accuracy, and realistic execution constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-subtle border border-border-subtle rounded overflow-hidden bg-canvas">
            <div className="p-6 space-y-3 bg-surface">
              <div className="w-8 h-8 rounded bg-elevated border border-border-subtle text-ink-primary flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-ink-primary font-sans">Order Routing Simulation</h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Execute Market and Limit orders with instant fill validation against real bid/ask prices and available buying power.
              </p>
            </div>

            <div className="p-6 space-y-3 bg-surface">
              <div className="w-8 h-8 rounded bg-elevated border border-border-subtle text-ink-primary flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-ink-primary font-sans">Candle Replay Backtester</h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Step through historical price action candle-by-candle with blind future data to test pattern recognition and risk-reward discipline.
              </p>
            </div>

            <div className="p-6 space-y-3 bg-surface">
              <div className="w-8 h-8 rounded bg-elevated border border-border-subtle text-ink-primary flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-ink-primary font-sans">Portfolio Performance Analytics</h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Track cost basis, unrealized P&amp;L, asset allocation, and fill history in real time as market quotes fluctuate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border-subtle bg-canvas py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-secondary font-sans">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink-primary font-mono">TradeWise</span>
            <span>• Simulated Brokerage Platform</span>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/markets" className="hover:text-ink-primary transition-colors">
              Markets
            </Link>
            <Link to="/trade" className="hover:text-ink-primary transition-colors">
              Terminal
            </Link>
            <Link to="/learn" className="hover:text-ink-primary transition-colors">
              Curriculum
            </Link>
            <Link to="/register" className="text-ink-primary font-medium hover:underline">
              Launch Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
