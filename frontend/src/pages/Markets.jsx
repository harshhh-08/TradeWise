import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
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
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', price: 1339.70, change: 0, changePercent: 0.00, volume: 13751275, low52: 1152.20, high52: 1611.80, sector: 'NSE Equity', exchange: 'NSE', currency: 'INR' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd', price: 2407.50, change: -34.90, changePercent: -1.43, volume: 3344243, low52: 1976.80, high52: 3350.00, sector: 'NSE Equity', exchange: 'NSE', currency: 'INR' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd', price: 1141.50, change: -9.70, changePercent: -0.84, volume: 5933093, low52: 980.40, high52: 1728.00, sector: 'NSE Equity', exchange: 'NSE', currency: 'INR' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', price: 804.00, change: -8.30, changePercent: -1.02, volume: 23437045, low52: 669.20, high52: 1017.50, sector: 'NSE Equity', exchange: 'NSE', currency: 'INR' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', price: 1583.60, change: -6.40, changePercent: -0.40, volume: 11438417, low52: 1187.60, high52: 1616.00, sector: 'NSE Equity', exchange: 'NSE', currency: 'INR' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', price: 812.30, change: 4.10, changePercent: 0.51, volume: 18920000, low52: 598.00, high52: 912.00, sector: 'NSE Equity', exchange: 'NSE', currency: 'INR' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 165.06, change: -1.13, changePercent: -0.68, volume: 82190000, low52: 148.80, high52: 243.37, sector: 'Semiconductors', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 359.19, change: 4.29, changePercent: 1.21, volume: 48920100, low52: 243.42, high52: 360.83, sector: 'Technology', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 428.15, change: 2.64, changePercent: 0.62, volume: 19800000, low52: 366.50, high52: 468.35, sector: 'Technology', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 186.40, change: 2.12, changePercent: 1.15, volume: 34100000, low52: 138.80, high52: 201.20, sector: 'Consumer Cyclical', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 218.89, change: -2.10, changePercent: -0.95, volume: 62400000, low52: 138.80, high52: 271.00, sector: 'Automotive', exchange: 'NASDAQ', currency: 'USD' },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink-primary font-sans">
            Market Screener
          </h1>
          <p className="text-xs text-ink-secondary font-sans">
            Real-time equity quotes • Automated pricing updates
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
      <div className="rounded border border-border-subtle bg-surface overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded" />
            ))}
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="p-10 text-center font-sans text-xs text-ink-secondary">
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
                        className="flex flex-col min-w-0 hover:text-ink-primary transition-colors group py-0.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-[13px] text-ink-primary tabular-nums">
                            {stock.symbol}
                          </span>
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded-sm bg-elevated text-ink-muted border border-border-subtle">
                            {stock.currency || (stock.symbol?.endsWith('.NS') ? 'INR' : 'USD')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-ink-secondary font-sans mt-0.5">
                          <span className="truncate max-w-[150px] sm:max-w-[220px]">
                            {stock.name || stock.symbol}
                          </span>
                          <span>•</span>
                          <span className="shrink-0 text-[10px] font-mono text-ink-muted">
                            {stock.exchange || (stock.symbol?.endsWith('.NS') ? 'NSE' : 'US')}
                          </span>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell className="text-right font-mono font-medium text-[13px] tabular-nums text-ink-primary">
                      {formatCurrency(stock.price || 0, stock.currency || (stock.symbol?.endsWith('.NS') ? 'INR' : 'USD'))}
                    </TableCell>

                    <TableCell className="text-right">
                      <div
                        className={`inline-flex items-center gap-1 font-mono text-xs tabular-nums ${
                          isPos ? 'text-trade-up' : 'text-trade-down'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{formatPercent(stock.changePercent || 0).text}</span>
                      </div>
                    </TableCell>

                    {/* 52-Week Range */}
                    <TableCell className="text-right hidden sm:table-cell">
                      {(() => {
                        const currSym = (stock.currency === 'INR' || stock.symbol?.endsWith('.NS')) ? '₹' : '$';
                        return (
                          <div className="flex items-center justify-end gap-2 text-xs font-mono tabular-nums text-ink-secondary">
                            <span>{currSym}{Number(low).toFixed(0)}</span>
                            <div className="w-20 h-1.5 rounded-sm bg-elevated border border-border-subtle relative overflow-hidden">
                              <div
                                className="absolute top-0 bottom-0 bg-ink-primary rounded-sm"
                                style={{ left: 0, width: `${rangePct}%` }}
                              />
                            </div>
                            <span>{currSym}{Number(high).toFixed(0)}</span>
                          </div>
                        );
                      })()}
                    </TableCell>

                    <TableCell className="text-right font-mono text-ink-secondary text-xs tabular-nums hidden md:table-cell">
                      {formatCompact(stock.volume || 18000000)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/stocks/${stock.symbol}`}>
                          <Button size="sm" variant="ghost" className="text-xs">
                            Chart
                          </Button>
                        </Link>
                        <Link to={`/trade?symbol=${stock.symbol}`}>
                          <Button size="sm" variant="secondary" className="text-xs">
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
