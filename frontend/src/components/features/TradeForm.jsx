import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { SearchCombobox } from './SearchCombobox';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const SAMPLE_PRICES = {
  AAPL: 224.23,
  NVDA: 141.54,
  MSFT: 428.15,
  AMZN: 186.40,
  TSLA: 218.89,
  GOOGL: 178.35,
  META: 582.40,
  AMD: 154.20,
};

export function TradeForm({ initialSymbol, onTradeExecuted }) {
  const [searchParams] = useSearchParams();
  const symbolParam = initialSymbol || searchParams.get('symbol') || 'AAPL';

  const [symbol, setSymbol] = useState(symbolParam.toUpperCase());
  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('MARKET');
  const [timeInForce, setTimeInForce] = useState('DAY');
  const [limitPrice, setLimitPrice] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [currentPrice, setCurrentPrice] = useState(SAMPLE_PRICES[symbolParam.toUpperCase()] || 150);
  const [message, setMessage] = useState(null);

  const { walletBalance, updateWalletCash } = useAuth();

  useEffect(() => {
    if (symbolParam) {
      setSymbol(symbolParam.toUpperCase());
      const p = SAMPLE_PRICES[symbolParam.toUpperCase()] || 150;
      setCurrentPrice(p);
      setLimitPrice(p.toFixed(2));
    }
  }, [symbolParam]);

  const handleStockSelect = (stock) => {
    setSymbol(stock.symbol);
    const p = stock.price || SAMPLE_PRICES[stock.symbol] || 150;
    setCurrentPrice(p);
    setLimitPrice(p.toFixed(2));
    setMessage(null);
  };

  const executionPrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : currentPrice;
  const totalCost = (parseInt(quantity, 10) || 0) * executionPrice;
  const remainingCash = side === 'BUY' ? walletBalance - totalCost : walletBalance + totalCost;

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid share quantity.' });
      return;
    }

    if (side === 'BUY') {
      if (totalCost > walletBalance) {
        const errText = `Insufficient funds. Needed ${formatCurrency(totalCost)}, available ${formatCurrency(walletBalance)}.`;
        setMessage({ type: 'error', text: errText });
        toast.error('Insufficient buying power.');
        return;
      }
      updateWalletCash(walletBalance - totalCost);
    } else {
      // Selling: check position
      const positions = JSON.parse(localStorage.getItem('tradewise_positions') || '[]');
      const pos = positions.find((p) => p.symbol === symbol);
      if (!pos || pos.quantity < qty) {
        const errText = `Cannot sell ${qty} shares of ${symbol}. You only hold ${pos?.quantity || 0} shares.`;
        setMessage({ type: 'error', text: errText });
        toast.error('Cannot sell more shares than you hold.');
        return;
      }
      updateWalletCash(walletBalance + totalCost);
    }

    // Record trade
    const trades = JSON.parse(localStorage.getItem('tradewise_trades') || '[]');
    const tradeRecord = {
      symbol,
      side,
      orderType,
      quantity: qty,
      price: executionPrice,
      executedAt: new Date().toISOString(),
    };
    localStorage.setItem('tradewise_trades', JSON.stringify([tradeRecord, ...trades]));

    // Update positions
    const positions = JSON.parse(localStorage.getItem('tradewise_positions') || '[]');
    const posIndex = positions.findIndex((p) => p.symbol === symbol);

    if (side === 'BUY') {
      if (posIndex >= 0) {
        const cur = positions[posIndex];
        const newQty = cur.quantity + qty;
        const newAvg = (cur.quantity * cur.avgCost + totalCost) / newQty;
        positions[posIndex] = { ...cur, quantity: newQty, avgCost: newAvg };
      } else {
        positions.push({ symbol, quantity: qty, avgCost: executionPrice });
      }
    } else if (posIndex >= 0) {
      const cur = positions[posIndex];
      const newQty = cur.quantity - qty;
      if (newQty <= 0) {
        positions.splice(posIndex, 1);
      } else {
        positions[posIndex] = { ...cur, quantity: newQty };
      }
    }
    localStorage.setItem('tradewise_positions', JSON.stringify(positions));

    const successMsg = `Order filled: ${side} ${qty} shares of ${symbol} @ ${formatCurrency(executionPrice)}.`;
    setMessage({
      type: 'success',
      text: successMsg,
    });
    toast.success(`${side} order executed for ${qty} ${symbol}!`);

    if (onTradeExecuted) onTradeExecuted(tradeRecord);
  };

  const handleQuickQty = (q) => {
    setQuantity(q);
  };

  const handleMaxQty = () => {
    if (side === 'BUY') {
      const maxShares = Math.floor(walletBalance / (executionPrice || 1));
      setQuantity(Math.max(1, maxShares));
    } else {
      const positions = JSON.parse(localStorage.getItem('tradewise_positions') || '[]');
      const pos = positions.find((p) => p.symbol === symbol);
      setQuantity(pos ? pos.quantity : 0);
    }
  };

  return (
    <Card className="p-5">
      <CardHeader className="p-0 pb-3 border-b border-[var(--color-border)] mb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono uppercase tracking-wider flex items-center gap-2">
            <ArrowLeftRight className="w-3.5 h-3.5 text-[var(--color-brand)]" />
            <span>Order Ticket</span>
          </CardTitle>
          <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
            ACCOUNT // CASH SIM
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {message && (
          <div
            className={`p-3 rounded text-xs font-mono flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-[var(--color-success-subtle)] border border-[var(--color-success)]/30 text-[var(--color-success)]'
                : 'bg-[var(--color-error-subtle)] border border-[var(--color-error)]/30 text-[var(--color-error)]'
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
          {/* Equity lookup */}
          <div className="space-y-1">
            <label className="block text-[11px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
              Asset Symbol
            </label>
            <SearchCombobox
              placeholder="Search ticker (e.g. NVDA, AAPL, TSLA)..."
              onSelectStock={handleStockSelect}
            />
            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <span className="font-bold text-[var(--color-text-primary)]">{symbol}</span>
              <span className="text-[var(--color-text-muted)]">
                Last: <strong className="text-[var(--color-text-primary)]">{formatCurrency(currentPrice)}</strong>
              </span>
            </div>
          </div>

          {/* Buy / Sell Tab Segment */}
          <div className="grid grid-cols-2 p-0.5 rounded bg-[var(--color-bg-base)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => {
                setSide('BUY');
                setMessage(null);
              }}
              className={`py-1.5 text-xs font-bold font-mono rounded cursor-pointer transition-colors ${
                side === 'BUY'
                  ? 'bg-[var(--color-success)] text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              BUY (LONG)
            </button>
            <button
              type="button"
              onClick={() => {
                setSide('SELL');
                setMessage(null);
              }}
              className={`py-1.5 text-xs font-bold font-mono rounded cursor-pointer transition-colors ${
                side === 'SELL'
                  ? 'bg-[var(--color-error)] text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              SELL (CLOSE)
            </button>
          </div>

          {/* Order Type & Time In Force */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full h-8 rounded bg-[var(--color-bg-base)] border border-[var(--color-border)] px-2.5 text-xs font-mono text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)]"
              >
                <option value="MARKET">Market</option>
                <option value="LIMIT">Limit</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
                Duration (TIF)
              </label>
              <select
                value={timeInForce}
                onChange={(e) => setTimeInForce(e.target.value)}
                className="w-full h-8 rounded bg-[var(--color-bg-base)] border border-[var(--color-border)] px-2.5 text-xs font-mono text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)]"
              >
                <option value="DAY">Day Only</option>
                <option value="GTC">Good &apos;Til Cancelled (GTC)</option>
              </select>
            </div>
          </div>

          {/* Shares Input with Quick presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
              <span className="uppercase tracking-wider">Quantity</span>
              <div className="flex items-center gap-1">
                {[10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleQuickQty(num)}
                    className="px-1.5 py-0.2 rounded bg-[var(--color-bg-raised)] border border-[var(--color-border)] text-[10px] hover:text-[var(--color-text-primary)] cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleMaxQty}
                  className="px-1.5 py-0.2 rounded bg-[var(--color-bg-raised)] border border-[var(--color-border)] text-[10px] text-[var(--color-brand)] font-bold cursor-pointer"
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
              <label className="block text-[11px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
                Limit Price ($)
              </label>
              <Input
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder="220.00"
                className="font-mono"
                required
              />
            </div>
          )}

          {/* Institutional Cost Breakdown */}
          <div className="rounded bg-[var(--color-bg-base)] border border-[var(--color-border)] p-3 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Unit Fill Quote</span>
              <span className="text-[var(--color-text-primary)]">{formatCurrency(executionPrice)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Exchange Fee / Routing</span>
              <span className="text-[var(--color-success)]">$0.00</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-[var(--color-border)] font-bold text-[var(--color-text-primary)]">
              <span>Order Value</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] pt-0.5">
              <span>Est. Cash Remaining</span>
              <span className={remainingCash < 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-brand)]'}>
                {formatCurrency(remainingCash)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            variant={side === 'BUY' ? 'success' : 'danger'}
            className="w-full font-mono text-xs h-9 font-bold"
          >
            TRANSMIT {side} ORDER &bull; {quantity || 0} {symbol}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
