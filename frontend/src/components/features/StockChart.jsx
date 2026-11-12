import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export function StockChart({ data = [], isPositive = true, onTimeframeChange, timeframe = '1D' }) {
  const TIMEFRAMES = ['1D', '1W', '1M', '1Y'];

  const strokeColor = isPositive ? '#10b981' : '#ef4444';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';

  const prices = data.map((d) => d.close || d.price || 0);
  const minPrice = prices.length ? Math.min(...prices) * 0.995 : 0;
  const maxPrice = prices.length ? Math.max(...prices) * 1.005 : 100;

  return (
    <div className="space-y-4">
      {/* Timeframe controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[var(--color-bg-subtle)] p-1 rounded-lg border border-[var(--color-border)]">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => onTimeframeChange && onTimeframeChange(tf)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-[var(--color-brand)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="text-[11px] font-mono text-[var(--color-text-muted)]">
          Volume / Price Weighted
        </div>
      </div>

      {/* Recharts Area */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#8b95a8' }}
              minTickGap={40}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#8b95a8' }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              orientation="right"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)]/95 backdrop-blur-md p-3 shadow-xl space-y-1 text-xs">
                      <div className="text-[11px] text-[var(--color-text-muted)] font-mono">
                        {d.date}
                      </div>
                      <div className="text-base font-bold font-mono text-[var(--color-text-primary)]">
                        {formatCurrency(d.close || d.price)}
                      </div>
                      {d.open && (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border)] font-mono">
                          <span>Open: ${Number(d.open).toFixed(2)}</span>
                          <span>High: ${Number(d.high).toFixed(2)}</span>
                          <span>Low: ${Number(d.low).toFixed(2)}</span>
                          <span>Vol: {Number(d.volume || 0).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
