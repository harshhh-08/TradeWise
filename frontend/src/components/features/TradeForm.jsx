import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
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
  const [stockName, setStockName] = useState('Apple Inc.');
  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('MARKET');
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
    setStockName(stock.name || stock.symbol);
    const p = stock.price || SAMPLE_PRICES[stock.symbol] || 150;
    setCurrentPrice(p);
    setLimitPrice(p.toFixed(2));
    setMessage(null);
  };

  const executionPrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : currentPrice;
  const totalCost = (parseInt(quantity, 10) || 0) * executionPrice;

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

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4 border-b border-[var(--color-border)] mb-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-[var(--color-brand)]" />
            <span>Virtual Trade Ticket</span>
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-brand)] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero Real Risk</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-5">
        {message && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
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
          {/* Asset Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
              Select Equity
            </label>
            <SearchCombobox
              placeholder="Search ticker (e.g. NVDA, AAPL, TSLA)..."
              onSelectStock={handleStockSelect}
            />
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <span className="font-bold font-mono text-[var(--color-text-primary)]">{symbol}</span>
              <span className="text-[var(--color-text-muted)] font-mono">
                Market: {formatCurrency(currentPrice)}
              </span>
            </div>
          </div>

          {/* Buy / Sell Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => {
                setSide('BUY');
                setMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                side === 'BUY'
                  ? 'bg-[var(--color-success)] text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              BUY (Go Long)
            </button>
            <button
              type="button"
              onClick={() => {
                setSide('SELL');
                setMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                side === 'SELL'
                  ? 'bg-[var(--color-error)] text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              SELL (Liquidate)
            </button>
          </div>

          {/* Order Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full h-9 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] px-3 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)]"
              >
                <option value="MARKET">Market Order</option>
                <option value="LIMIT">Limit Order</option>
              </select>
            </div>

            <Input
              label="Shares Quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          {orderType === 'LIMIT' && (
            <Input
              label="Limit Price ($)"
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="e.g. 220.00"
              required
            />
          )}

          {/* Summary Box */}
          <div className="rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] p-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Executed Unit Price</span>
              <span className="text-[var(--color-text-primary)]">{formatCurrency(executionPrice)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Commission</span>
              <span className="text-[var(--color-success)]">$0.00 (Commission-Free)</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[var(--color-border)] font-bold text-sm text-[var(--color-text-primary)]">
              <span>Total Estimated Value</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[var(--color-text-muted)]">Available Buying Power:</span>
            <span className="font-mono font-bold text-[var(--color-brand)]">
              {formatCurrency(walletBalance)}
            </span>
          </div>

          <Button
            type="submit"
            variant={side === 'BUY' ? 'success' : 'danger'}
            className="w-full py-2.5"
            size="lg"
            leftIcon={<ArrowLeftRight className="w-4 h-4" />}
          >
            Confirm {side} {quantity || 0} {symbol}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
