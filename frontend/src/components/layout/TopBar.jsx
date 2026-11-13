import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, User as UserIcon, LogOut, Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { Logo } from './Logo';

export function TopBar({ onToggleMobileMenu, isMobileMenuOpen, user, walletBalance, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [marketTime, setMarketTime] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setMarketTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }) + ' ET'
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/markets?q=${encodeURIComponent(query)}`);
    setSearchQuery('');
  };

  return (
    <header className="h-14 border-b border-(--color-border) bg-(--color-bg-base)/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-md text-(--color-text-muted) hover:bg-(--color-bg-raised)"
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile brand logo */}
        <div className="md:hidden">
          <Logo to="/dashboard" size="sm" />
        </div>

        {/* Market Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-(--color-bg-subtle) border border-(--color-border) text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-(--color-success) animate-pulse" />
          <span className="font-semibold text-(--color-text-primary)">MARKET ACTIVE</span>
          <span className="text-(--color-text-muted) border-l border-(--color-border) pl-2">
            {marketTime}
          </span>
        </div>

        {/* Global Search with ⌘K style */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-72 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--color-text-muted)" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticker, company (e.g. AAPL)..."
            className="w-full pl-8 pr-12 py-1.5 rounded-md bg-(--color-bg-subtle) border border-(--color-border) text-xs text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-brand) transition-colors"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-(--color-text-muted) px-1.5 py-0.5 rounded bg-(--color-bg-raised) border border-(--color-border)">
            /
          </kbd>
        </form>
      </div>

      {/* Right side stats & profile */}
      <div className="flex items-center gap-2.5">
        {/* Buying Power */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-(--color-bg-subtle) border border-(--color-border)">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-(--color-text-muted) font-mono uppercase tracking-wider leading-none">
              Buying Power
            </span>
            <span className="text-xs font-bold font-mono text-(--color-text-primary)">
              {formatCurrency(walletBalance ?? 100000)}
            </span>
          </div>
          <Link
            to="/trade"
            className="hidden sm:inline-flex p-1 rounded hover:bg-(--color-bg-raised) text-(--color-brand)"
            title="Execute Order"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 rounded-md text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-raised) transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Account Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-(--color-bg-raised) transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-(--color-bg-raised) border border-(--color-border) text-(--color-text-secondary) font-mono font-semibold flex items-center justify-center text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-(--color-text-primary)">
              {user?.name || 'Trader'}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-52 rounded-lg bg-(--color-bg-subtle) border border-(--color-border) shadow-xl py-1 z-30">
              <div className="px-3.5 py-2.5 border-b border-(--color-border)">
                <p className="text-xs font-semibold text-(--color-text-primary) truncate">
                  {user?.name || 'Demo Trader'}
                </p>
                <p className="text-[11px] text-(--color-text-muted) truncate font-mono">
                  {user?.email || 'trader@tradewise.internal'}
                </p>
                <span className="inline-block mt-1 text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-(--color-bg-raised) text-(--color-brand) border border-(--color-border)">
                  Cash Account
                </span>
              </div>

              <div className="p-1">
                <Link
                  to="/portfolio"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-1.5 text-xs text-(--color-text-secondary) hover:bg-(--color-bg-raised) rounded"
                >
                  <span>Holdings</span>
                  <span className="text-[10px] font-mono text-(--color-text-muted)">Portfolio</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onLogout) onLogout();
                    else navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-(--color-error) hover:bg-(--color-error-subtle) rounded text-left mt-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
