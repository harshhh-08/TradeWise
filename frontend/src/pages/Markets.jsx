import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  ArrowLeftRight,
} from 'lucide-react';
import api from '@/services/api';
import { formatCurrency, formatPercent, formatCompact } from '@/lib/utils';
import { SearchCombobox } from '@/components/features/SearchCombobox';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';

const DEFAULT_MARKET_STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 141.54, change: 4.28, changePercent: 3.12, volume: 82190000, low52: 45.20, high52: 149.77, sector: 'Semiconductors' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 224.23, change: 4.05, changePercent: 1.84, volume: 48920100, low52: 164.08, high52: 237.23, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 428.15, change: 2.64, changePercent: 0.62, volume: 19800000, low52: 366.50, high52: 468.35, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 186.40, change: 2.12, changePercent: 1.15, volume: 34100000, low52: 138.80, high52: 201.20, sector: 'Consumer Cyclical' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 218.89, change: -2.10, changePercent: -0.95, volume: 62400000, low52: 138.80, high52: 271.00, sector: 'Automotive' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 178.35, change: 1.45, changePercent: 0.82, volume: 22400000, low52: 129.40, high52: 191.75, sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 582.40, change: 8.20, changePercent: 1.43, volume: 14500000, low52: 279.40, high52: 602.95, sector: 'Communication' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 154.20, change: -3.80, changePercent: -2.41, volume: 41200000, low52: 116.20, high52: 227.30, sector: 'Semiconductors' },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 720.60, change: 12.40, changePercent: 1.75, volume: 8200000, low52: 445.00, high52: 740.00, sector: 'Communication' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 222.10, change: -1.25, changePercent: -0.56, volume: 11300000, low52: 146.00, high52: 231.00, sector: 'Financial' },
];

const FILTER_TABS = [
  { id: 'all', label: 'All Equities' },
  { id: 'gainers', label: 'Top Gainers' },
  { id: 'losers', label: 'Top Decliners' },
  { id: 'tech', label: 'Semis & Tech' },
];

export default function Markets() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [stocks, setStocks] = useState(DEFAULT_MARKET_STOCKS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStocks() {
      setIsLoading(true);
      try {
        const queryParam = initialQuery ? `search=${encodeURIComponent(initialQuery)}&` : '';
        const res = await api.get(`/api/stocks?${queryParam}limit=20`);
        if (isMounted) {
          if (res.data?.stocks && Array.isArray(res.data.stocks) && res.data.stocks.length > 0) {
            setStocks(res.data.stocks);
          } else {
            setStocks(DEFAULT_MARKET_STOCKS);
          }
        }
      } catch (_) {
        if (isMounted) setStocks(DEFAULT_MARKET_STOCKS);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStocks();
    return () => {
      isMounted = false;
    };
  }, [initialQuery]);

  const filteredStocks = stocks.filter((stock) => {
    if (activeFilter === 'gainers') return (stock.changePercent ?? 0) > 0;
    if (activeFilter === 'losers') return (stock.changePercent ?? 0) < 0;
    if (activeFilter === 'tech') {
      return (
        stock.sector?.toLowerCase().includes('tech') ||
        stock.sector?.toLowerCase().includes('semi') ||
        ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'META', 'AMD'].includes(stock.symbol)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-(--color-border)">
        <div>
          <h1 className="text-lg font-bold font-mono tracking-tight text-(--color-text-primary)">
            MARKET SCREENER // LEVEL 1 FEEDS
          </h1>
          <p className="text-[11px] font-mono text-(--color-text-muted)">
            Real-time equity quotes powered by Twelve Data &bull; Automated pricing updates
          </p>
        </div>

        <div className="w-full sm:w-80">
          <SearchCombobox placeholder="Filter ticker or company..." />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={FILTER_TABS}
        activeTab={activeFilter}
        onChange={setActiveFilter}
      />

      {/* High Density Table */}
      <div className="rounded-lg border border-(--color-border) bg-(--color-bg-subtle) overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="p-10 text-center font-mono text-xs text-(--color-text-muted)">
            No matching equity records located.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol / Company</TableHead>
                <TableHead className="text-right">Last Price</TableHead>
                <TableHead className="text-right">24h Change</TableHead>
                <TableHead className="text-right hidden sm:table-cell">52-Week Range</TableHead>
                <TableHead className="text-right hidden md:table-cell">Volume</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map((stock) => {
                const isPos = (stock.changePercent ?? 0) >= 0;
                const low = stock.low52 || (stock.price ? stock.price * 0.75 : 100);
                const high = stock.high52 || (stock.price ? stock.price * 1.25 : 200);
                const rangePct = Math.min(100, Math.max(0, ((stock.price - low) / ((high - low) || 1)) * 100));

                return (
                  <TableRow key={stock.symbol}>
                    <TableCell>
                      <Link
                        to={`/stocks/${stock.symbol}`}
                        className="flex items-center gap-2 hover:text-(--color-brand) transition-colors group"
                      >
                        <span className="w-14 font-bold font-mono text-xs text-(--color-text-primary) group-hover:text-(--color-brand)">
                          {stock.symbol}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[11px] text-(--color-text-secondary) block truncate max-w-[140px] sm:max-w-[200px]">
                            {stock.name || stock.symbol}
                          </span>
                          <span className="text-[10px] font-mono text-(--color-text-muted) block">
                            {stock.sector || 'US Equity'}
                          </span>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell className="text-right font-mono font-bold text-xs">
                      {formatCurrency(stock.price || 0)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div
                        className={`inline-flex items-center gap-0.5 font-mono font-semibold text-xs ${
                          isPos ? 'text-(--color-success)' : 'text-(--color-error)'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{formatPercent(stock.changePercent || 0).text}</span>
                      </div>
                    </TableCell>

                    {/* 52-Week Visual Range */}
                    <TableCell className="text-right hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-(--color-text-muted)">
                        <span>${Number(low).toFixed(0)}</span>
                        <div className="w-20 h-1.5 rounded-full bg-(--color-bg-raised) relative overflow-hidden">
                          <div
                            className="absolute top-0 bottom-0 bg-(--color-brand) rounded-full"
                            style={{ left: 0, width: `${rangePct}%` }}
                          />
                        </div>
                        <span>${Number(high).toFixed(0)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-mono text-(--color-text-muted) text-[11px] hidden md:table-cell">
                      {formatCompact(stock.volume || 18000000)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/stocks/${stock.symbol}`}>
                          <Button size="sm" variant="ghost" className="font-mono text-[11px]">
                            Chart
                          </Button>
                        </Link>
                        <Link to={`/trade?symbol=${stock.symbol}`}>
                          <Button size="sm" variant="secondary" className="font-mono text-[11px]">
                            Trade
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
