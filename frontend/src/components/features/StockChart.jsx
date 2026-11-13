import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatCurrency, formatCompact } from '@/lib/utils';

export function StockChart({ data = [], isPositive = true, onTimeframeChange, timeframe = '1D' }) {
  const [chartMode, setChartMode] = useState('area'); // 'area' | 'bar'
  const TIMEFRAMES = ['1D', '5D', '1M', '6M', '1Y', 'ALL'];

  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)';

  const prices = data.map((d) => d.close || d.price || 0);
  const minPrice = prices.length ? Math.min(...prices) * 0.996 : 0;
  const maxPrice = prices.length ? Math.max(...prices) * 1.004 : 100;

  return (
    <div className="space-y-3">
      {/* Chart Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-(--color-border)">
        <div className="flex items-center gap-1 bg-(--color-bg-base) p-0.5 rounded border border-(--color-border)">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => onTimeframeChange && onTimeframeChange(tf)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-(--color-brand) text-white shadow-xs'
                  : 'text-(--color-text-muted) hover:text-(--color-text-primary)'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-(--color-text-muted)">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setChartMode('area')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                chartMode === 'area'
                  ? 'bg-(--color-bg-raised) text-(--color-text-primary) font-bold'
                  : 'hover:text-(--color-text-primary)'
              }`}
            >
              Area
            </button>
            <button
              type="button"
              onClick={() => setChartMode('bar')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                chartMode === 'bar'
                  ? 'bg-(--color-bg-raised) text-(--color-text-primary) font-bold'
                  : 'hover:text-(--color-text-primary)'
              }`}
            >
              Volume / Delta
            </button>
          </div>
          <span className="hidden sm:inline border-l border-(--color-border) pl-3">
            LOGARITHMIC SCALE: OFF
          </span>
        </div>
      </div>

      {/* Chart Display */}
      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#757d91' }}
                minTickGap={45}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#757d91' }}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                orientation="right"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded border border-(--color-border) bg-(--color-bg-subtle)/95 backdrop-blur-md p-2.5 shadow-xl space-y-1 font-mono text-xs">
                        <div className="text-[10px] text-(--color-text-muted)">
                          {d.date}
                        </div>
                        <div className="text-sm font-bold text-(--color-text-primary)">
                          {formatCurrency(d.close || d.price)}
                        </div>
                        {d.open && (
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-(--color-text-muted) pt-1 border-t border-(--color-border)">
                            <span>Open: ${Number(d.open).toFixed(2)}</span>
                            <span>High: ${Number(d.high).toFixed(2)}</span>
                            <span>Low: ${Number(d.low).toFixed(2)}</span>
                            <span>Vol: {formatCompact(d.volume || 0)}</span>
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
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#757d91' }} minTickGap={45} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#757d91' }} orientation="right" tickFormatter={(v) => formatCompact(v)} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded border border-(--color-border) bg-(--color-bg-subtle) p-2 text-xs font-mono">
                        <div>{d.date}</div>
                        <div className="font-bold">Vol: {Number(d.volume || 0).toLocaleString()}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="volume" fill="var(--color-brand)" opacity={0.6} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
