import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { AccountHeader } from '@/components/features/WalletBanner';
import { Watchlist } from '@/components/features/Watchlist';
import { RecentTrades } from '@/components/features/RecentTrades';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RotateCcw, BookOpen, ArrowUpRight, LineChart } from 'lucide-react';

export default function Dashboard() {
  const { walletBalance, updateWalletCash } = useAuth();
  const [trades, setTrades] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [portRes, tradeRes] = await Promise.all([
        api.get('/api/portfolio'),
        api.get('/api/trades?limit=5'),
      ]);

      if (portRes.data?.success && portRes.data.portfolio) {
        setPortfolio(portRes.data.portfolio);
        if (portRes.data.portfolio.availableCash !== undefined) {
          updateWalletCash(portRes.data.portfolio.availableCash);
        }
      }

      if (tradeRes.data?.success && Array.isArray(tradeRes.data.trades)) {
        setTrades(tradeRes.data.trades);
      }
    } catch (err) {
      console.warn('Dashboard data fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [updateWalletCash]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const cash = portfolio?.availableCash ?? (walletBalance ?? 100000);
  const invested = portfolio?.totalStockValue ?? 0;
  const unrealizedPnl = portfolio?.totalUnrealizedPnl ?? 0;

  return (
    <div className="space-y-4">
      
      <AccountHeader
        cash={cash}
        invested={invested}
        dayPnl={unrealizedPnl}
      />

      
      <Watchlist />

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentTrades trades={trades} isLoading={isLoading} />
        </div>

        <div className="space-y-4">
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[13px] font-medium text-ink-primary font-sans flex items-center gap-1.5">
                <LineChart className="w-3.5 h-3.5 text-ink-secondary" />
                <span>Strategy Backtester</span>
              </CardTitle>
              <span className="text-[11px] font-mono text-trade-up">ACTIVE</span>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Test dual-SMA crossover rules across NSE equity regimes with risk metrics and equity curves.
              </p>
              <Link to="/backtest" className="block">
                <Button size="sm" variant="secondary" className="w-full">
                  Launch Backtesting Engine
                </Button>
              </Link>
            </CardContent>
          </Card>

          
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
