import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  PieChart,
  BookOpen,
  RotateCcw,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';

const navItems = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Market Quotes', path: '/markets', icon: TrendingUp },
  { label: 'Order Execution', path: '/trade', icon: ArrowLeftRight },
  { label: 'Portfolio & P&L', path: '/portfolio', icon: PieChart },
  { label: 'Curriculum', path: '/learn', icon: BookOpen },
  { label: 'Candle Replay', path: '/replay', icon: RotateCcw },
];

export function Sidebar({ className }) {
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col w-60 border-r border-border-subtle bg-surface shrink-0 select-none z-10',
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border-subtle">
        <Logo size={26} layout="horizontal" />
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-elevated text-ink-secondary border border-border-subtle">
          v2.4
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-sans uppercase tracking-wider text-ink-muted flex items-center justify-between">
          <span>Navigation</span>
          <span className="text-[9px] font-mono">⌘ 1-6</span>
        </div>
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded text-xs font-sans font-medium transition-colors',
                  isActive
                    ? 'bg-elevated text-ink-primary border border-border-strong'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-elevated/50'
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0 text-ink-secondary" />
                <span>{item.label}</span>
              </div>
              <kbd className="hidden group-hover:inline-block text-[9px] font-mono px-1 rounded-sm bg-elevated text-ink-muted border border-border-subtle">
                ⌘{idx + 1}
              </kbd>
            </NavLink>
          );
        })}
      </nav>

      {/* Market Telemetry Footer */}
      <div className="p-3 m-2 rounded bg-canvas border border-border-subtle space-y-2">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-ink-secondary flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-ink-muted" />
            Market Pulse
          </span>
          <span className="inline-flex items-center gap-1.5 text-trade-up text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-border-subtle">
          <span className="text-ink-secondary">S&amp;P 500</span>
          <span className="font-medium text-trade-up tabular-nums">5,864.67 (+0.42%)</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-ink-secondary">NASDAQ</span>
          <span className="font-medium text-trade-up tabular-nums">18,290.10 (+0.81%)</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-ink-secondary">CBOE VIX</span>
          <span className="font-medium text-trade-down tabular-nums">14.85 (-1.45%)</span>
        </div>
      </div>
    </aside>
  );
}
