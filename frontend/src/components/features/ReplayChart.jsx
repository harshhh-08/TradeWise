import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { formatCurrency, formatCompact, cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export function ReplayChart({ candles = [], visibleCount = 0, className }) {
  const [viewMode, setViewMode] = useState('candle'); // 'candle' | 'line'

  // Progressively revealed candles up to visibleCount
  const visibleCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    const count = visibleCount > 0 ? Math.min(visibleCount, candles.length) : candles.length;
    return candles.slice(0, count);
  }, [candles, visibleCount]);

  // Price calculations for YAxis domain
  const { minPrice, maxPrice, latestCandle } = useMemo(() => {
    if (visibleCandles.length === 0) {
      return { minPrice: 0, maxPrice: 100, latestCandle: null };
    }

    const lows = visibleCandles.map((c) => c.low ?? c.close);
    const highs = visibleCandles.map((c) => c.high ?? c.close);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const padding = (max - min) * 0.08 || 5;

    return {
      minPrice: Math.max(0, +(min - padding).toFixed(2)),
      maxPrice: +(max + padding).toFixed(2),
      latestCandle: visibleCandles[visibleCandles.length - 1],
    };
  }, [visibleCandles]);

  if (!candles || candles.length === 0) {
    return (
      <Card className={cn('h-80 flex items-center justify-center p-6 text-xs text-(--color-text-muted)', className)}>
        No candle data available for replay session.
      </Card>
    );
  }

  // Pre-calculate candle bar metrics for custom shape rendering
  const chartData = visibleCandles.map((c, index) => {
    const isUp = (c.close ?? 0) >= (c.open ?? 0);
    const bodyBottom = Math.min(c.open, c.close);
    const bodyHeight = Math.max(Math.abs(c.close - c.open), 0.1);
    return {
      ...c,
      index,
      isUp,
      bodyBottom,
      bodyHeight,
      color: isUp ? '#10b981' : '#f43f5e',
    };
  });

  const isCurrentPositive = latestCandle ? (latestCandle.close >= latestCandle.open) : true;
  const currentPriceColor = isCurrentPositive ? 'text-(--color-success)' : 'text-(--color-error)';

  return (
    <div className={cn('space-y-3 font-mono', className)}>
      {/* Top chart telemetry bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-(--color-border) text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight text-(--color-text-primary)">
              {latestCandle ? formatCurrency(latestCandle.close) : '--'}
            </span>
            {latestCandle && (
              <span className={cn('text-xs font-semibold', currentPriceColor)}>
                {latestCandle.close >= latestCandle.open ? '+' : ''}
                {(latestCandle.close - latestCandle.open).toFixed(2)} (
                {(((latestCandle.close - latestCandle.open) / latestCandle.open) * 100).toFixed(2)}%)
              </span>
            )}
          </div>
          <span className="hidden sm:inline-block text-[11px] text-(--color-text-muted) border-l border-(--color-border) pl-3">
            Revealed: {visibleCandles.length} / {candles.length} candles
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-(--color-bg-base) p-0.5 rounded border border-(--color-border) text-[10px]">
          <button
            type="button"
            onClick={() => setViewMode('candle')}
            className={cn(
              'px-2 py-1 rounded transition-colors cursor-pointer',
              viewMode === 'candle'
                ? 'bg-(--color-bg-raised) text-(--color-text-primary) font-bold'
                : 'text-(--color-text-muted) hover:text-(--color-text-primary)'
            )}
          >
            Candlestick
          </button>
          <button
            type="button"
            onClick={() => setViewMode('line')}
            className={cn(
              'px-2 py-1 rounded transition-colors cursor-pointer',
              viewMode === 'line'
                ? 'bg-(--color-bg-raised) text-(--color-text-primary) font-bold'
                : 'text-(--color-text-muted) hover:text-(--color-text-primary)'
            )}
          >
            Line
          </button>
        </div>
      </div>

      {/* Recharts Display Surface */}
      <div className="h-80 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255, 255, 255, 0.05)"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#757d91' }}
              minTickGap={35}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#757d91' }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                const isGain = d.close >= d.open;
                const delta = d.close - d.open;
                const pct = ((delta / d.open) * 100).toFixed(2);

                return (
                  <div className="rounded-lg border border-(--color-border) bg-(--color-bg-subtle)/95 backdrop-blur-md p-3 shadow-2xl space-y-1.5 text-xs font-mono min-w-[180px]">
                    <div className="flex items-center justify-between text-[10px] text-(--color-text-muted) pb-1 border-b border-(--color-border)">
                      <span>{d.displayDate || d.date}</span>
                      <span className={cn('font-bold', isGain ? 'text-(--color-success)' : 'text-(--color-error)')}>
                        {isGain ? 'BULLISH' : 'BEARISH'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-0.5">
                      <span className="text-[11px] text-(--color-text-muted)">Close:</span>
                      <span className="text-sm font-bold text-(--color-text-primary)">
                        {formatCurrency(d.close)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-(--color-text-muted) pt-1 border-t border-(--color-border)">
                      <div>Open: <span className="text-(--color-text-primary)">${d.open.toFixed(2)}</span></div>
                      <div>High: <span className="text-(--color-text-primary)">${d.high.toFixed(2)}</span></div>
                      <div>Low: <span className="text-(--color-text-primary)">${d.low.toFixed(2)}</span></div>
                      <div>Vol: <span className="text-(--color-text-primary)">{formatCompact(d.volume)}</span></div>
                    </div>

                    <div className="text-[10px] pt-1 border-t border-(--color-border) flex justify-between">
                      <span className="text-(--color-text-muted)">Day Change:</span>
                      <span className={isGain ? 'text-(--color-success)' : 'text-(--color-error)'}>
                        {isGain ? '+' : ''}{delta.toFixed(2)} ({isGain ? '+' : ''}{pct}%)
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            {viewMode === 'candle' ? (
              /* Candlestick Bar representation with green for up, red for down */
              <Bar
                dataKey="close"
                name="Price"
                isAnimationActive={false}
                shape={(props) => {
                  const { x, y, width, payload } = props;
                  if (!payload || x === undefined || y === undefined) return null;

                  const isUp = payload.close >= payload.open;
                  const color = isUp ? '#10b981' : '#f43f5e';
                  const candleWidth = Math.max(Math.min(width * 0.75, 14), 3);
                  const centerX = x + width / 2;

                  // Proportional wick estimation from high/low relative to close bar
                  const priceRange = maxPrice - minPrice || 1;
                  const highPx = ((maxPrice - payload.high) / priceRange) * 260 + 10;
                  const lowPx = ((maxPrice - payload.low) / priceRange) * 260 + 10;
                  const openPx = ((maxPrice - payload.open) / priceRange) * 260 + 10;
                  const closePx = ((maxPrice - payload.close) / priceRange) * 260 + 10;

                  const topBody = Math.min(openPx, closePx);
                  const bodyHeight = Math.max(Math.abs(closePx - openPx), 2);

                  return (
                    <g key={`candle-${payload.index}`}>
                      {/* Upper & lower wick line */}
                      <line
                        x1={centerX}
                        y1={highPx}
                        x2={centerX}
                        y2={lowPx}
                        stroke={color}
                        strokeWidth={1.5}
                      />
                      {/* Real body */}
                      <rect
                        x={centerX - candleWidth / 2}
                        y={topBody}
                        width={candleWidth}
                        height={bodyHeight}
                        fill={color}
                        stroke={color}
                        rx={1}
                      />
                    </g>
                  );
                }}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.index}`} fill={entry.color} />
                ))}
              </Bar>
            ) : (
              /* Continuous Line representation */
              <Line
                type="monotone"
                dataKey="close"
                stroke={isCurrentPositive ? '#10b981' : '#f43f5e'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ReplayChart;
