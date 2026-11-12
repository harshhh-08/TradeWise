import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowLeftRight,
  Filter,
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
  { symbol: 'AAPL', name: 'Apple Inc.', price: 224.23, change: 4.05, changePercent: 1.84, volume: 48920100, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 141.54, change: 4.28, changePercent: 3.12, volume: 82190000, sector: 'Semiconductors' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 428.15, change: 2.64, changePercent: 0.62, volume: 19800000, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 186.40, change: 2.12, changePercent: 1.15, volume: 34100000, sector: 'Consumer Cyclical' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 218.89, change: -2.10, changePercent: -0.95, volume: 62400000, sector: 'Automotive' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 178.35, change: 1.45, changePercent: 0.82, volume: 22400000, sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 582.40, change: 8.20, changePercent: 1.43, volume: 14500000, sector: 'Communication' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 154.20, change: -3.80, changePercent: -2.41, volume: 41200000, sector: 'Semiconductors' },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 720.60, change: 12.40, changePercent: 1.75, volume: 8200000, sector: 'Communication' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 222.10, change: -1.25, changePercent: -0.56, volume: 11300000, sector: 'Financial' },
];

const FILTER_TABS = [
  { id: 'all', label: 'All Equities' },
  { id: 'gainers', label: 'Top Gainers' },
  { id: 'losers', label: 'Top Losers' },
  { id: 'tech', label: 'Technology' },
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

  // Apply in-memory filter
  const filteredStocks = stocks.filter((stock) => {
    if (activeFilter === 'gainers') return (stock.changePercent ?? 0) > 0;
    if (activeFilter === 'losers') return (stock.changePercent ?? 0) < 0;
    if (activeFilter === 'tech') {
      return (
        stock.sector?.toLowerCase().includes('tech') ||
        ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'META', 'AMD'].includes(stock.symbol)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Market Quotes
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Real-time equity feeds powered by Twelve Data and Yahoo Finance.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <SearchCombobox placeholder="Search stock symbol..." />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={FILTER_TABS}
        activeTab={activeFilter}
        onChange={setActiveFilter}
      />

      {/* Table container */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
            No stocks found matching the current filter.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Last Price</TableHead>
                <TableHead className="text-right">24h Change</TableHead>
                <TableHead className="text-right hidden md:table-cell">Volume</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map((stock) => {
                const isPos = (stock.changePercent ?? 0) >= 0;
                return (
                  <TableRow key={stock.symbol}>
                    <TableCell>
                      <Link
                        to={`/stocks/${stock.symbol}`}
                        className="flex items-center gap-2.5 hover:text-[var(--color-brand)] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-raised)] font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-[var(--color-border)] group-hover:border-[var(--color-brand)]/40">
                          {stock.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <span className="font-bold font-mono text-xs block text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)]">
                            {stock.symbol}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-muted)] block truncate max-w-[180px]">
                            {stock.name || stock.symbol}
                          </span>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(stock.price || 0)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div
                        className={`inline-flex items-center gap-1 font-mono font-semibold text-xs ${
                          isPos ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                        }`}
                      >
                        {isPos ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>{formatPercent(stock.changePercent || 0).text}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-mono text-[var(--color-text-muted)] hidden md:table-cell">
                      {formatCompact(stock.volume || 12000000)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/stocks/${stock.symbol}`}>
                          <Button size="sm" variant="ghost" leftIcon={<BarChart3 className="w-3.5 h-3.5" />}>
                            Chart
                          </Button>
                        </Link>
                        <Link to={`/trade?symbol=${stock.symbol}`}>
                          <Button size="sm" variant="secondary" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
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
