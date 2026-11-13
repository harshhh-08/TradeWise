import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ShieldAlert,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';

export function ReplayTradePanel({
  currentPrice = 0,
  cash = 100000,
  positions = [],
  onTrade,
  symbol = 'AAPL',
  currentDate = '',
  className,
}) {
  const [tradeType, setTradeType] = useState('BUY'); // 'BUY' | 'SELL'
  const [quantity, setQuantity] = useState('10');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Find position for current symbol
  const currentPosition = positions.find((p) => p.symbol === symbol) || {
    symbol,
    quantity: 0,
    avgPrice: 0,
  };

  const parsedQty = parseInt(quantity, 10) || 0;
  const isPriceValid = typeof currentPrice === 'number' && currentPrice > 0;
  const estimatedAmount = isPriceValid && parsedQty > 0 ? parsedQty * currentPrice : 0;

  // Position calculations
  const positionMarketValue = currentPosition.quantity * (currentPrice || currentPosition.avgPrice);
  const positionCostBasis = currentPosition.quantity * currentPosition.avgPrice;
  const positionUnrealizedPnl = positionMarketValue - positionCostBasis;
  const positionUnrealizedPct = positionCostBasis > 0 ? (positionUnrealizedPnl / positionCostBasis) * 100 : 0;

  // Max quantities
  const maxBuyQty = isPriceValid ? Math.floor(cash / currentPrice) : 0;
  const maxSellQty = currentPosition.quantity;

  const handleQuickQty = (amount) => {
    setErrorMsg('');
    setSuccessMsg('');
    setQuantity(String(Math.max(1, amount)));
  };

  const handleMaxQty = () => {
    setErrorMsg('');
    setSuccessMsg('');
    const maxAllowed = tradeType === 'BUY' ? maxBuyQty : maxSellQty;
    setQuantity(String(Math.max(1, maxAllowed || 1)));
  };

  const handlePlaceOrder = (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // 1. Validate price
    if (!isPriceValid) {
      setErrorMsg('Cannot trade: current market quote is unavailable or invalid.');
      return;
    }

    // 2. Validate quantity is a positive whole number
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      setErrorMsg('Quantity must be a positive whole number greater than 0.');
      return;
    }

    // 3. Buy validation
    if (tradeType === 'BUY') {
      if (estimatedAmount > cash) {
        setErrorMsg(
          `Insufficient virtual cash. Needed ${formatCurrency(estimatedAmount)}, but available cash is ${formatCurrency(cash)}.`
        );
        return;
      }
    }

    // 4. Sell validation
    if (tradeType === 'SELL') {
      if (parsedQty > currentPosition.quantity) {
        setErrorMsg(
          `Insufficient holdings. Cannot sell ${parsedQty} shares. You currently hold ${currentPosition.quantity} shares of ${symbol}.`
        );
        return;
      }
    }

    // 5. Execute trade callback
    if (onTrade) {
      const executed = onTrade({
        type: tradeType,
        symbol,
        quantity: parsedQty,
        price: currentPrice,
        date: currentDate,
      });

      if (executed?.success) {
        const actionWord = tradeType === 'BUY' ? 'Bought' : 'Sold';
        setSuccessMsg(
          `${actionWord} ${parsedQty} ${symbol} @ ${formatCurrency(currentPrice)} on ${currentDate}.`
        );
      } else if (executed?.message) {
        setErrorMsg(executed.message);
      }
    }
  };

  return (
    <Card className={cn('p-4 space-y-4 bg-[var(--color-bg-subtle)] border-[var(--color-border)] font-mono', className)}>
      {/* Header */}
      <CardHeader className="p-0 pb-3 border-b border-[var(--color-border)] flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-[var(--color-brand)]" />
          <CardTitle className="text-xs uppercase tracking-wider font-bold">
            Simulated Trade Terminal
          </CardTitle>
        </div>
        <Badge variant="brand" size="sm">
          {symbol}
        </Badge>
      </CardHeader>

      {/* Buy / Sell Toggle Switch */}
      <div className="grid grid-cols-2 p-1 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => {
            setTradeType('BUY');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={cn(
            'py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer',
            tradeType === 'BUY'
              ? 'bg-[var(--color-success)] text-white shadow-xs'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          )}
        >
          BUY {symbol}
        </button>
        <button
          type="button"
          onClick={() => {
            setTradeType('SELL');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={cn(
            'py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer',
            tradeType === 'SELL'
              ? 'bg-[var(--color-error)] text-white shadow-xs'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          )}
        >
          SELL {symbol}
        </button>
      </div>

      {/* Order Entry Form */}
      <form onSubmit={handlePlaceOrder} className="space-y-3.5">
        <div className="space-y-1.5">
          <Input
            label="Share Quantity"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            placeholder="e.g. 10"
            className="font-mono text-xs"
          />

          {/* Quick preset buttons */}
          <div className="flex items-center gap-1.5 pt-1 text-[10px]">
            {[1, 5, 10, 25, 50, 100].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleQuickQty(q)}
                className="px-2 py-0.5 rounded bg-[var(--color-bg-raised)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] transition-colors cursor-pointer"
              >
                +{q}
              </button>
            ))}
            <button
              type="button"
              onClick={handleMaxQty}
              className="px-2 py-0.5 rounded bg-[var(--color-brand-subtle)] border border-[var(--color-brand)]/30 text-[var(--color-brand)] font-bold hover:bg-[var(--color-brand)] hover:text-white transition-colors cursor-pointer ml-auto"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Pricing & Estimation Breakdown */}
        <div className="p-3 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border)] space-y-1.5 text-xs">
          <div className="flex justify-between text-[var(--color-text-muted)]">
            <span>Execution Price</span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {isPriceValid ? formatCurrency(currentPrice) : 'Invalid'}
            </span>
          </div>

          <div className="flex justify-between text-[var(--color-text-muted)]">
            <span>Transaction Type</span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {tradeType === 'BUY' ? 'Market Buy Order' : 'Market Sell Order'}
            </span>
          </div>

          <div className="flex justify-between text-[var(--color-text-muted)]">
            <span>Replay Execution Date</span>
            <span className="text-[var(--color-text-secondary)]">
              {currentDate || 'Current Candle'}
            </span>
          </div>

          <div className="pt-2 border-t border-[var(--color-border)] flex justify-between font-bold">
            <span className="text-[var(--color-text-secondary)]">
              {tradeType === 'BUY' ? 'Estimated Cost' : 'Estimated Proceeds'}
            </span>
            <span className={tradeType === 'BUY' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-success)]'}>
              {formatCurrency(estimatedAmount)}
            </span>
          </div>
        </div>

        {/* Available Virtual Cash indicator */}
        <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] px-0.5">
          <span>Available Cash</span>
          <span className="font-semibold text-[var(--color-brand)]">
            {formatCurrency(cash)}
          </span>
        </div>

        {/* Validation Error Message */}
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-[var(--color-error-subtle)] border border-[var(--color-error)]/30 text-[var(--color-error)] text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Success Confirmation Message */}
        {successMsg && (
          <div className="p-2.5 rounded-lg bg-[var(--color-success-subtle)] border border-[var(--color-success)]/30 text-[var(--color-success)] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Order Placement Button */}
        <Button
          type="submit"
          variant={tradeType === 'BUY' ? 'success' : 'danger'}
          className="w-full text-xs font-bold py-2 shadow-xs"
        >
          Place {tradeType} Order &bull; {parsedQty} {symbol}
        </Button>
      </form>

      {/* Position Status Widget */}
      <CardContent className="p-0 pt-3 border-t border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-[var(--color-brand)]" />
            <span>Position: {symbol}</span>
          </div>
          <span className="text-[var(--color-text-primary)]">
            {currentPosition.quantity} shares
          </span>
        </div>

        {currentPosition.quantity > 0 ? (
          <div className="p-2.5 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border)] space-y-1 text-[11px]">
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Avg Purchase Price</span>
              <span className="text-[var(--color-text-primary)] font-semibold">
                {formatCurrency(currentPosition.avgPrice)}
              </span>
            </div>
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Market Holding Value</span>
              <span className="text-[var(--color-text-primary)] font-semibold">
                {formatCurrency(positionMarketValue)}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">Unrealized P&amp;L</span>
              <span
                className={cn(
                  'font-bold flex items-center gap-0.5',
                  positionUnrealizedPnl >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                )}
              >
                {positionUnrealizedPnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatCurrency(positionUnrealizedPnl)} ({formatPercent(positionUnrealizedPct).text})
              </span>
            </div>
          </div>
        ) : (
          <div className="p-2 rounded bg-[var(--color-bg-base)] text-[10px] text-[var(--color-text-muted)] text-center">
            No active holdings for {symbol} in this session.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ReplayTradePanel;
