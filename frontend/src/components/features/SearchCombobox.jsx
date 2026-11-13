import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import api from '@/services/api';
import { formatCurrency, formatPercent } from '@/lib/utils';

export function SearchCombobox({ onSelectStock, placeholder = 'Search by ticker or company name...' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/api/stocks?search=${encodeURIComponent(query.trim())}&limit=8`);
        if (res.data?.stocks) {
          setResults(res.data.stocks);
          setIsOpen(true);
        }
      } catch (err) {
        // Fallback filter
        const mockMatches = [
          { symbol: 'AAPL', name: 'Apple Inc.', price: 224.23, changePercent: 1.84 },
          { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 141.54, changePercent: 3.12 },
          { symbol: 'TSLA', name: 'Tesla Inc.', price: 218.89, changePercent: -0.95 },
          { symbol: 'MSFT', name: 'Microsoft Corporation', price: 428.15, changePercent: 0.62 },
          { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 186.40, changePercent: 1.15 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 178.35, changePercent: 0.82 },
        ].filter(
          (s) =>
            s.symbol.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(mockMatches);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (stock) => {
    setIsOpen(false);
    setQuery('');
    if (onSelectStock) {
      onSelectStock(stock);
    } else {
      navigate(`/stocks/${stock.symbol}`);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-(--color-text-muted) pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-10 rounded-xl bg-(--color-bg-subtle) border border-(--color-border) text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand) transition-colors shadow-xs"
        />
        {isLoading && (
          <Loader2 className="absolute right-3.5 w-4 h-4 text-(--color-text-muted) animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-(--color-bg-base) border border-(--color-border) shadow-xl z-30 max-h-80 overflow-y-auto divide-y divide-(--color-border)">
          {results.map((stock) => {
            const isPos = (stock.changePercent ?? 0) >= 0;
            return (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => handleSelect(stock)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-(--color-bg-raised) text-left transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-sm text-(--color-text-primary)">
                      {stock.symbol}
                    </span>
                    <span className="text-xs text-(--color-text-muted) truncate max-w-[200px]">
                      {stock.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono text-xs font-semibold text-(--color-text-primary)">
                      {formatCurrency(stock.price || 0)}
                    </div>
                    <div
                      className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-medium ${
                        isPos ? 'text-(--color-success)' : 'text-(--color-error)'
                      }`}
                    >
                      {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      <span>{formatPercent(stock.changePercent || 0).text}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-(--color-text-muted) shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
