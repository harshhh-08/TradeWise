import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  PieChart,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Markets', path: '/markets', icon: TrendingUp },
  { label: 'Trade', path: '/trade', icon: ArrowLeftRight },
  { label: 'Portfolio', path: '/portfolio', icon: PieChart },
  { label: 'Learn', path: '/learn', icon: BookOpen },
];

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-[var(--color-bg-base)]/90 backdrop-blur-md border-t border-[var(--color-border)] z-30 flex items-center justify-around px-2">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-lg text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-[var(--color-brand)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

