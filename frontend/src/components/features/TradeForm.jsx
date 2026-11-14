import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { SearchCombobox } from './SearchCombobox';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export function TradeForm({ initialSymbol, onTradeExecuted }) {
  const [searchParams] = useSearchParams();
  const symbolParam = initialSymbol || searchParams.get('symbol') || 'RELIANCE.NS';

  const [symbol, setSymbol] = useState(symbolParam.toUpperCase());
  const [currency, setCurrency] = useState('INR');
  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('MARKET');
  const [timeInForce, setTimeInForce] = useState('DAY');
  const [limitPrice, setLimitPrice] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [userHoldings, setUserHoldings] = useState([]);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const { walletBalance, updateWalletCash } = useAuth();

  const fetchStockQuote = useCallback(async (sym) => {
    if (!sym) return;
    setIsLoadingPrice(true);
    try {
      const res = await api.get(`/api/stocks/${sym}`);
      if (res.data?.stock) {
        const p = Number(res.data.stock.price) || 0;
        setCurrentPrice(p);
        setCurrency(res.data.stock.currency || 'INR');
        setLimitPrice(p.toFixed(2));
      }
    } catch (err) {
      console.warn('Could not fetch quote for', sym, err.message);
    } finally {
      setIsLoadingPrice(false);
    }
  }, []);

  const fetchUserHoldings = useCallback(async () => {
    try {
      const res = await api.get('/api/portfolio');
      if (res.data?.portfolio?.holdings) {
        setUserHoldings(res.data.portfolio.holdings);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (symbolParam) {
      const upper = symbolParam.toUpperCase();
      setSymbol(upper);
      fetchStockQuote(upper);
    }
    fetchUserHoldings();
  }, [symbolParam, fetchStockQuote, fetchUserHoldings]);

  const handleStockSelect = (stock) => {
    if (!stock?.symbol) return;
    const s = stock.symbol.toUpperCase();
    setSymbol(s);
    if (stock.price) {
      setCurrentPrice(Number(stock.price));
      setCurrency(stock.currency || 'INR');
      setLimitPrice(Number(stock.price).toFixed(2));
    } else {
      fetchStockQuote(s);
    }
    setMessage(null);
  };

  const executionPrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : currentPrice;
  const totalCost = (parseInt(quantity, 10) || 0) * executionPrice;
  const remainingCash = side === 'BUY' ? walletBalance - totalCost : walletBalance + totalCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid share quantity.' });
      return;
    }

    if (side === 'BUY' && totalCost > walletBalance) {
      const errText = `Insufficient funds. Needed ${formatCurrency(totalCost, currency)}, available ${formatCurrency(walletBalance, 'INR')}.`;
      setMessage({ type: 'error', text: errText });
      toast.error('Insufficient buying power.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        symbol,
        side,
        quantity: qty,
        type: orderType,
        limitPrice: orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : undefined,
      };

      const res = await api.post('/api/orders', payload);
      if (res.data?.success) {
        const serverTrade = res.data.trade;
        const serverWallet = res.data.wallet;

        if (serverWallet?.cash !== undefined) {
          updateWalletCash(serverWallet.cash);
        }

        const successMsg = res.data.message || `Order filled: ${side} ${qty} shares of ${symbol} @ ${formatCurrency(serverTrade?.price || executionPrice, currency)}.`;
        setMessage({
          type: 'success',
          text: successMsg,
        });
        toast.success(successMsg);

        await fetchUserHoldings();
        if (onTradeExecuted) {
          onTradeExecuted(res.data);
        }
      } else {
        throw new Error(res.data?.message || 'Order failed');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to place order';
      setMessage({
        type: 'error',
        text: errMsg,
      });
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickQty = (q) => {
    setQuantity(q);
  };

  const handleMaxQty = () => {
    if (side === 'BUY') {
      const maxShares = Math.floor(walletBalance / (executionPrice || 1));
      setQuantity(Math.max(1, maxShares));
    } else {
      const holding = userHoldings.find((h) => h.symbol === symbol);
      setQuantity(holding ? holding.quantity : 0);
    }
  };

  return (
    <Card className="p-5">
      <CardHeader className="p-0 pb-3 border-b border-border-subtle mb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[13px] font-medium text-ink-primary font-sans flex items-center gap-2">
            <ArrowLeftRight className="w-3.5 h-3.5 text-ink-secondary" />
            <span>Order Ticket</span>
          </CardTitle>
          <span className="text-[11px] font-sans text-ink-muted">
            Paper Trading • Cash Account
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {message && (
          <div
            className={`p-3 rounded text-xs font-mono flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-(--color-success-subtle) border border-(--color-success)/30 text-(--color-success)'
                : 'bg-(--color-error-subtle) border border-(--color-error)/30 text-(--color-error)'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="block text-[11px] font-mono text-(--color-text-muted) uppercase tracking-wider">
              Asset Symbol
            </label>
            <SearchCombobox
              placeholder="Search Indian or US equities (e.g. RELIANCE, TCS, INFY)..."
              onSelectStock={handleStockSelect}
            />
            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <span className="font-bold text-(--color-text-primary)">{symbol}</span>
              <span className="text-(--color-text-muted)">
                Last Price:{' '}
                {isLoadingPrice ? (
                  <span className="text-ink-muted">Fetching live quote...</span>
                ) : (
                  <strong className="text-(--color-text-primary)">{formatCurrency(currentPrice, currency)}</strong>
                )}
              </span>
            </div>
          </div>

          
          <div className="grid grid-cols-2 p-0.5 rounded bg-canvas border border-border-subtle">
            <button
              type="button"
              onClick={() => {
                setSide('BUY');
                setMessage(null);
              }}
              className={`py-1.5 text-xs font-medium font-sans rounded cursor-pointer transition-colors ${
                side === 'BUY'
                  ? 'bg-trade-up text-white'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => {
                setSide('SELL');
                setMessage(null);
              }}
              className={`py-1.5 text-xs font-medium font-sans rounded cursor-pointer transition-colors ${
                side === 'SELL'
                  ? 'bg-trade-down text-white'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Sell
            </button>
          </div>

          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-(--color-text-muted) uppercase tracking-wider">
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full h-8 rounded bg-(--color-bg-base) border border-(--color-border) px-2.5 text-xs font-mono text-(--color-text-primary) focus:outline-none focus:border-(--color-brand)"
              >
                <option value="MARKET">Market (Instant Fill)</option>
                <option value="LIMIT">Limit</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-(--color-text-muted) uppercase tracking-wider">
                Duration (TIF)
              </label>
              <select
                value={timeInForce}
                onChange={(e) => setTimeInForce(e.target.value)}
                className="w-full h-8 rounded bg-(--color-bg-base) border border-(--color-border) px-2.5 text-xs font-mono text-(--color-text-primary) focus:outline-none focus:border-(--color-brand)"
              >
                <option value="DAY">Day Only</option>
                <option value="GTC">Good &apos;Til Cancelled (GTC)</option>
              </select>
            </div>
          </div>

          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-(--color-text-muted)">
              <span className="uppercase tracking-wider">Quantity</span>
              <div className="flex items-center gap-1">
                {[10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleQuickQty(num)}
                    className="px-1.5 py-0.5 rounded bg-(--color-bg-raised) border border-(--color-border) text-[10px] hover:text-(--color-text-primary) cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleMaxQty}
                  className="px-1.5 py-0.5 rounded bg-(--color-bg-raised) border border-(--color-border) text-[10px] text-(--color-brand) font-bold cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            <Input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="font-mono"
              required
            />
          </div>

          {orderType === 'LIMIT' && (
            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-(--color-text-muted) uppercase tracking-wider">
                Limit Price ({currency})
              </label>
              <Input
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder="0.00"
                className="font-mono"
                required
              />
            </div>
          )}

          
          <div className="rounded bg-canvas border border-border-subtle p-3 space-y-1.5 text-xs font-sans">
            <div className="flex justify-between text-ink-secondary">
              <span>Unit Fill Quote</span>
              <span className="font-mono tabular-nums text-ink-primary">{formatCurrency(executionPrice, currency)}</span>
            </div>
            <div className="flex justify-between text-ink-secondary">
              <span>Exchange Fee / Routing</span>
              <span className="font-mono tabular-nums text-trade-up">₹0.00</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-border-subtle font-medium text-ink-primary">
              <span>Estimated Order Value</span>
              <span className="font-mono tabular-nums">{formatCurrency(totalCost, currency)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-ink-secondary pt-0.5">
              <span>Est. Cash Remaining</span>
              <span className={`font-mono tabular-nums ${remainingCash < 0 ? 'text-trade-down' : 'text-ink-primary'}`}>
                {formatCurrency(remainingCash, 'INR')}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isLoadingPrice || currentPrice <= 0}
            variant={side === 'BUY' ? 'success' : 'danger'}
            className="w-full text-xs h-9 font-medium"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5 justify-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Routing to Matching Engine...
              </span>
            ) : (
              `Transmit ${side === 'BUY' ? 'Buy' : 'Sell'} Order • ${quantity || 0} ${symbol}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
