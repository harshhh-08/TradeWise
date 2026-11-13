import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Shield,
  BarChart2,
  Cpu,
  History,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

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
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-(--color-brand) flex items-center justify-center text-white font-mono font-bold text-xs shadow-xs">
              TW
            </div>
            <span className="font-bold font-mono tracking-wider text-xs">TRADEWISE</span>
          </Link>

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left copy (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-(--color-bg-raised) border border-(--color-border) text-[11px] font-mono text-(--color-brand)">
                <span>SIMULATED BROKERAGE ENVIRONMENT</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12] text-(--color-text-primary)">
                The institutional paper trading terminal.
              </h1>

              <p className="text-sm sm:text-base text-(--color-text-muted) leading-relaxed max-w-xl">
                Test equity strategies against real-time NASDAQ and NYSE market feeds. Practice order execution, risk sizing, and historical market regimes with $100,000 in virtual capital.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/register">
                  <Button size="lg" className="px-5 font-semibold" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Open $100k Paper Account
                  </Button>
                </Link>
                <Link to="/markets">
                  <Button variant="secondary" size="lg" className="px-5 font-mono">
                    Explore Screener
                  </Button>
                </Link>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-(--color-text-muted) font-mono">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-(--color-success)" />
                  <span>Real Yahoo &amp; Twelve Data Feeds</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-(--color-success)" />
                  <span>Zero Financial Risk</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview (5 cols) */}
            <div className="lg:col-span-5">
              <div className="rounded-lg border border-(--color-border) bg-(--color-bg-subtle) shadow-xl overflow-hidden">
                {/* Terminal top chrome */}
                <div className="h-9 px-3 bg-(--color-bg-raised) border-b border-(--color-border) flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-(--color-success)" />
                    <span className="font-semibold text-(--color-text-primary)">TICKER SIMULATOR</span>
                  </div>
                  <span className="text-(--color-text-muted)">CASH: $100,000.00</span>
                </div>

                {/* Ticker switch pills */}
                <div className="p-3 border-b border-(--color-border) flex items-center gap-1.5 bg-(--color-bg-base)">
                  {Object.keys(PREVIEW_TICKERS).map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setActiveTicker(sym)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        activeTicker === sym
                          ? 'bg-(--color-brand) text-white'
                          : 'text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-raised)'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>

                {/* Price display & mini sparkline */}
                <div className="p-4 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-lg font-bold font-mono">{activeTicker}</div>
                      <div className="text-[11px] text-(--color-text-muted) truncate max-w-[160px]">
                        {stock.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold font-mono text-(--color-text-primary)">
                        {formatCurrency(stock.price)}
                      </div>
                      <div
                        className={`text-xs font-mono font-semibold ${
                          stock.isPos ? 'text-(--color-success)' : 'text-(--color-error)'
                        }`}
                      >
                        {stock.change}
                      </div>
                    </div>
                  </div>

                  {/* SVG Line Preview */}
                  <div className="h-24 w-full bg-(--color-bg-base) rounded border border-(--color-border) p-2 flex items-center">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke={stock.isPos ? '#10b981' : '#f43f5e'}
                        strokeWidth="2"
                        points={stock.points
                          .map((val, i) => {
                            const min = Math.min(...stock.points);
                            const max = Math.max(...stock.points);
                            const y = 35 - ((val - min) / ((max - min) || 1)) * 30;
                            const x = (i / (stock.points.length - 1)) * 100;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    </svg>
                  </div>

                  {/* Simulated Order Ticket */}
                  <div className="pt-2 border-t border-(--color-border) space-y-2.5">
                    <div className="grid grid-cols-2 gap-1.5 p-0.5 rounded bg-(--color-bg-raised) border border-(--color-border)">
                      <button
                        type="button"
                        onClick={() => setPreviewSide('BUY')}
                        className={`py-1 text-xs font-bold font-mono rounded cursor-pointer ${
                          previewSide === 'BUY'
                            ? 'bg-(--color-success) text-white shadow-xs'
                            : 'text-(--color-text-muted)'
                        }`}
                      >
                        BUY (LONG)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewSide('SELL')}
                        className={`py-1 text-xs font-bold font-mono rounded cursor-pointer ${
                          previewSide === 'SELL'
                            ? 'bg-(--color-error) text-white shadow-xs'
                            : 'text-(--color-text-muted)'
                        }`}
                      >
                        SELL (CLOSE)
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-(--color-text-muted)">Quantity</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewShares((s) => Math.max(5, s - 5))}
                          className="px-2 py-0.5 rounded bg-(--color-bg-raised) border border-(--color-border) text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold">{previewShares}</span>
                        <button
                          type="button"
                          onClick={() => setPreviewShares((s) => s + 5)}
                          className="px-2 py-0.5 rounded bg-(--color-bg-raised) border border-(--color-border) text-xs font-bold"
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
          <div className="flex items-center gap-2">
            <span className="font-bold text-(--color-text-primary)">TRADEWISE</span>
            <span>&bull; Simulated Brokerage Platform</span>
          </div>

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
