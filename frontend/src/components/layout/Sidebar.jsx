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
        'hidden md:flex flex-col w-56 border-r border-[var(--color-border)] bg-[var(--color-bg-base)] shrink-0 select-none',
        className
      )}
    >
      {/* Brand */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[var(--color-brand)] flex items-center justify-center text-white font-mono font-bold text-xs shadow-xs">
            TW
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs font-mono tracking-wider text-[var(--color-text-primary)]">
              TRADEWISE
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--color-bg-raised)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
          v1.0
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
          Terminal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors relative',
                  isActive
                    ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] font-semibold shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-[var(--color-brand)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-raised)]/60'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Terminal Telemetry / Benchmark */}
      <div className="p-3 m-2 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-[var(--color-text-muted)]">SYSTEM FEED</span>
          <span className="inline-flex items-center gap-1 text-[var(--color-success)] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
            LIVE
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[var(--color-border)]">
          <span className="text-[var(--color-text-secondary)]">S&amp;P 500</span>
          <span className="font-semibold text-[var(--color-success)]">+0.42%</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[var(--color-text-secondary)]">NASDAQ</span>
          <span className="font-semibold text-[var(--color-success)]">+0.81%</span>
        </div>
      </div>
    </aside>
  );
}
