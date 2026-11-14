import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AccountHeader } from '@/components/features/WalletBanner';
import { Watchlist } from '@/components/features/Watchlist';
import { RecentTrades } from '@/components/features/RecentTrades';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RotateCcw, BookOpen, ArrowUpRight } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Docked Account Header & Edge-to-Edge KPI Strip */}
      <AccountHeader
        cash={walletBalance ?? 100000}
        invested={investedValue}
        dayPnl={investedValue > 0 ? investedValue * 0.0142 : 0}
      />

      {/* Market Watch Strip */}
      <Watchlist />

      {/* Main Grid: Ledger & Execution Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentTrades trades={trades} />
        </div>

        <div className="space-y-4">
          {/* Candle Replay Backtester card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[13px] font-medium text-ink-primary font-sans flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-ink-secondary" />
                <span>Candle Replay</span>
              </CardTitle>
              <span className="text-[11px] font-mono text-trade-up">ACTIVE</span>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Step forward candle-by-candle through historical market regimes with zero future bias to validate your trading rules.
              </p>
              <Link to="/replay" className="block">
                <Button size="sm" variant="secondary" className="w-full">
                  Launch Replay Engine
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Curriculum & Knowledge Base */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[13px] font-medium text-ink-primary font-sans flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-ink-secondary" />
                <span>Curriculum</span>
              </CardTitle>
              <Link to="/learn" className="text-xs text-ink-secondary hover:text-ink-primary inline-flex items-center gap-1">
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Review core mechanics of bid-ask spread liquidity, order book dynamics, and disciplined risk-to-reward position sizing.
              </p>
              <Link to="/learn" className="block">
                <Button size="sm" variant="secondary" className="w-full">
                  Open Curriculum
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
