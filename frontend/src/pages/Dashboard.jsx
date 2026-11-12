import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { WalletBanner } from '@/components/features/WalletBanner';
import { Watchlist } from '@/components/features/Watchlist';
import { RecentTrades } from '@/components/features/RecentTrades';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, RotateCcw, ArrowRight, Award } from 'lucide-react';

export default function Dashboard() {
  const { user, walletBalance } = useAuth();
  const [trades, setTrades] = useState([]);
  const [investedValue, setInvestedValue] = useState(0);

  // Load local paper trades if any
  useEffect(() => {
    try {
      const savedTrades = localStorage.getItem('tradewise_trades');
      if (savedTrades) {
        const parsed = JSON.parse(savedTrades);
        setTrades(parsed);
      }

      const savedPositions = localStorage.getItem('tradewise_positions');
      if (savedPositions) {
        const parsedPos = JSON.parse(savedPositions);
        const totalInvested = parsedPos.reduce(
          (sum, pos) => sum + (pos.quantity * pos.avgCost || 0),
          0
        );
        setInvestedValue(totalInvested);
      }
    } catch (_) {}
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Welcome back, {user?.name || 'Trader'}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Simulated portfolio overview and active equity feeds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/learn">
            <Button variant="outline" size="sm" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
              Lessons
            </Button>
          </Link>
          <Link to="/replay">
            <Button variant="secondary" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Replay Simulator
            </Button>
          </Link>
        </div>
      </div>

      {/* Wallet Banner */}
      <WalletBanner
        cash={walletBalance}
        invested={investedValue}
        dayPnl={investedValue > 0 ? investedValue * 0.0184 : 0}
      />

      {/* Watchlist */}
      <Watchlist />

      {/* Two Column Section: Recent Trades + Learning Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTrades trades={trades} />
        </div>

        <div className="space-y-6">
          {/* Learning Progress Widget */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-brand)]">
                <Award className="w-4 h-4" />
                <span>Knowledge Accelerator</span>
              </div>
              <CardTitle className="text-sm mt-1">Trading Curriculum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Take bite-sized modules on candlestick charts, equity valuation, and risk management.
              </p>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--color-text-secondary)] font-medium">Curriculum Progress</span>
                  <span className="font-mono font-semibold text-[var(--color-brand)]">2 / 5 Complete</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--color-bg-raised)] overflow-hidden">
                  <div className="h-full bg-[var(--color-brand)] rounded-full w-[40%]" />
                </div>
              </div>

              <Link to="/learn" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Continue Lesson 3
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Replay Mode Callout */}
          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-linear-to-br from-[var(--color-bg-subtle)] to-[var(--color-bg-raised)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
              <RotateCcw className="w-4 h-4 text-[var(--color-brand)]" />
              <span>Historical Candle Replay</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Step through historical price action candle-by-candle and practice entries with zero future knowledge.
            </p>
            <Link to="/replay" className="block">
              <Button size="sm" variant="secondary" className="w-full">
                Launch Replay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
