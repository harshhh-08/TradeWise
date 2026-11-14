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
        'hidden md:flex flex-col w-60 border-r border-(--color-border) bg-(--color-bg-base)/95 backdrop-blur-md shrink-0 select-none z-10',
        className
      )}
    >
      {/* Brand */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-(--color-border)">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-(--color-brand) flex items-center justify-center text-white font-mono font-bold text-xs shadow-[0_2px_10px_var(--color-brand-subtle),inset_0_1px_0_rgba(255,255,255,0.35)]">
            TW
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs font-mono tracking-wider text-(--color-text-primary) flex items-center gap-1.5">
              TRADEWISE
              <span className="w-1.5 h-1.5 rounded-full bg-(--color-success) beacon-live" />
            </span>
            <span className="text-[9px] font-mono text-(--color-text-muted) tracking-tight">
              TERMINAL // PRO
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-(--color-bg-raised) text-(--color-brand) font-semibold border border-(--color-border)">
          v2.4
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-(--color-text-muted) flex items-center justify-between">
          <span>Navigation</span>
          <span className="text-[9px] opacity-60">SHORTCUTS</span>
        </div>
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all relative group',
                  isActive
                    ? 'accent-bar bg-(--color-bg-raised) text-(--color-text-primary) font-semibold shadow-xs'
                    : 'text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-raised)/60'
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              <kbd className="hidden group-hover:inline-block text-[9px] font-mono px-1 rounded bg-(--color-bg-subtle) text-(--color-text-muted) border border-(--color-border)">
                ⌘{idx + 1}
              </kbd>
            </NavLink>
          );
        })}
      </nav>

      {/* Terminal Telemetry / Benchmark */}
      <div className="p-3 m-2.5 rounded-xl bg-(--color-bg-subtle) border border-(--color-border) shadow-xs space-y-2 card-worldclass">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-(--color-text-muted) flex items-center gap-1">
            <Activity className="w-3 h-3 text-(--color-brand)" />
            MARKET PULSE
          </span>
          <span className="inline-flex items-center gap-1.5 text-(--color-success) font-medium text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-(--color-success) beacon-live" />
            LIVE
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-(--color-border)">
          <span className="text-(--color-text-secondary)">S&amp;P 500</span>
          <span className="font-semibold text-(--color-success)">5,864.67 (+0.42%)</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-(--color-text-secondary)">NASDAQ</span>
          <span className="font-semibold text-(--color-success)">18,290.10 (+0.81%)</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-(--color-text-secondary)">CBOE VIX</span>
          <span className="font-semibold text-(--color-error)">14.85 (-1.45%)</span>
        </div>
      </div>
    </aside>
  );
}
