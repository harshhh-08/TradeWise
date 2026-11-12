import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { WalletBanner } from '@/components/features/WalletBanner';
import { Watchlist } from '@/components/features/Watchlist';
import { RecentTrades } from '@/components/features/RecentTrades';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, RotateCcw, ArrowRight, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user, walletBalance } = useAuth();
  const [trades, setTrades] = useState([]);
  const [investedValue, setInvestedValue] = useState(0);

  useEffect(() => {
    try {
      const savedTrades = localStorage.getItem('tradewise_trades');
      if (savedTrades) {
        setTrades(JSON.parse(savedTrades));
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
    <div className="space-y-5">
      {/* Dashboard Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-lg font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
            ACCOUNT OVERVIEW // {user?.name?.toUpperCase() || 'TRADER'}
          </h1>
          <p className="text-[11px] font-mono text-[var(--color-text-muted)]">
            Simulated NASDAQ / NYSE Brokerage Account &bull; USD Cash
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/trade">
            <Button size="sm">
              Execute Order
            </Button>
          </Link>
          <Link to="/replay">
            <Button variant="secondary" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Replay Backtest
            </Button>
          </Link>
        </div>
      </div>

      {/* Wallet Banner */}
      <WalletBanner
        cash={walletBalance}
        invested={investedValue}
        dayPnl={investedValue > 0 ? investedValue * 0.0142 : 0}
      />

      {/* Watchlist */}
      <Watchlist />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentTrades trades={trades} />
        </div>

        <div className="space-y-5">
          {/* Candle Replay Backtester card */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                <span>Candle Replay Mode</span>
              </span>
              <span className="text-[10px] text-[var(--color-success)]">READY</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Step forward candle-by-candle through historical market regimes with zero future bias to test your entries.
            </p>
            <Link to="/replay" className="block pt-1">
              <Button size="sm" variant="secondary" className="w-full font-mono">
                Launch Replay Engine
              </Button>
            </Link>
          </Card>

          {/* Education Curriculum Card */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                <span>Trading Curriculum</span>
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)]">2 / 5</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Order mechanics, candlestick interpretation, and portfolio risk management modules.
            </p>
            <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-raised)] overflow-hidden">
              <div className="h-full bg-[var(--color-brand)] rounded-full w-[40%]" />
            </div>
            <Link to="/learn" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                <span>Resume Lesson 3</span>
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
