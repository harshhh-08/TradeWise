import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import api from '@/services/api';
import { StockCard } from './StockCard';
import { Skeleton } from '@/components/ui/Skeleton';

const FALLBACK_STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 141.54, change: 4.28, changePercent: 3.12 },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 224.23, change: 4.05, changePercent: 1.84 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 428.15, change: 2.64, changePercent: 0.62 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 186.40, change: 2.12, changePercent: 1.15 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 218.89, change: -2.10, changePercent: -0.95 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 178.35, change: 1.45, changePercent: 0.82 },
];

export function Watchlist() {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchWatchlist() {
      try {
        const res = await api.get('/api/stocks?limit=6');
        if (isMounted) {
          if (res.data?.stocks && Array.isArray(res.data.stocks) && res.data.stocks.length > 0) {
            setStocks(res.data.stocks.slice(0, 6));
          } else {
            setStocks(FALLBACK_STOCKS);
          }
        }
      } catch (_) {
        if (isMounted) setStocks(FALLBACK_STOCKS);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchWatchlist();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-medium text-ink-primary font-sans">
            Market Watch
          </h2>
          <span className="text-xs text-ink-secondary font-sans">
            Mega-Cap Equities
          </span>
        </div>
        <Link
          to="/markets"
          className="text-xs font-sans text-ink-secondary hover:text-ink-primary inline-flex items-center gap-1 transition-colors"
        >
          <span>Full screener</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {stocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      )}
    </div>
  );
}
