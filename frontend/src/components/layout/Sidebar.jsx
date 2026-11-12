import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  PieChart,
  BookOpen,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Markets', path: '/markets', icon: TrendingUp },
  { label: 'Paper Trade', path: '/trade', icon: ArrowLeftRight },
  { label: 'Portfolio', path: '/portfolio', icon: PieChart },
  { label: 'Learn', path: '/learn', icon: BookOpen },
  { label: 'Replay Mode', path: '/replay', icon: RotateCcw },
];

export function Sidebar({ className }) {
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col w-64 border-r border-[var(--color-border)] bg-[var(--color-bg-base)] shrink-0 select-none',
        className
      )}
    >
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-[var(--color-border)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-white font-bold text-base shadow-sm">
          TW
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight text-[var(--color-text-primary)]">
            TradeWise
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] tracking-wider uppercase">
            Paper Trading
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)] font-semibold'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-raised)]'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 m-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-brand)] mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Paper Cash Active</span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          Practice risk-free with virtual capital and real-time market data.
        </p>
      </div>
    </aside>
  );
}

