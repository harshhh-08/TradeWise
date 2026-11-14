import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, User as UserIcon, LogOut, Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

export function TopBar({ onToggleMobileMenu, isMobileMenuOpen, user, walletBalance, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [marketTime, setMarketTime] = useState('');
  const navigate = useNavigate();

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
    <header className="h-14 border-b border-border-subtle bg-surface sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded text-ink-muted hover:bg-elevated"
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Market Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-canvas border border-border-subtle text-xs font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-ink-primary">Market Active</span>
          <span className="text-ink-muted border-l border-border-subtle pl-2 font-mono text-[11px]">
            {marketTime}
          </span>
        </div>

        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-72 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticker, company (e.g. AAPL)..."
            className="w-full pl-8 pr-12 py-1.5 rounded bg-canvas border border-border-subtle text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-border-strong transition-colors"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-ink-muted px-1 py-0.5 rounded-sm bg-elevated border border-border-subtle">
            /
          </kbd>
        </form>
      </div>

      {/* Right side stats & profile */}
      <div className="flex items-center gap-2.5">
        {/* Buying Power */}
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-canvas border border-border-subtle">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-ink-secondary font-sans uppercase tracking-wider leading-none">
              Buying Power
            </span>
            <span className="text-xs font-medium font-mono text-ink-primary tabular-nums mt-0.5">
              {formatCurrency(walletBalance ?? 100000)}
            </span>
          </div>
          <Link
            to="/trade"
            className="hidden sm:inline-flex p-1 rounded text-ink-secondary hover:text-ink-primary hover:bg-elevated transition-colors"
            title="Execute Order"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Theme Toggle (Ivory Mist / Obsidian Pro) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded border border-border-subtle bg-canvas text-ink-secondary hover:text-ink-primary hover:bg-elevated transition-colors cursor-pointer flex items-center justify-center"
          title={theme === 'dark' ? 'Switch to Ivory Mist (Light Mode)' : 'Switch to Obsidian Pro (Dark Mode)'}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-ink-primary" />
          )}
        </button>

        {/* User Account Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded hover:bg-elevated transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded bg-elevated border border-border-strong text-ink-secondary font-mono font-medium flex items-center justify-center text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-ink-primary font-sans">
              {user?.name || 'Trader'}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-52 rounded bg-surface border border-border-strong py-1 z-30">
              <div className="px-3.5 py-2.5 border-b border-border-subtle">
                <p className="text-xs font-medium text-ink-primary truncate font-sans">
                  {user?.name || 'Demo Trader'}
                </p>
                <p className="text-[11px] text-ink-secondary truncate font-mono mt-0.5">
                  {user?.email || 'trader@tradewise.internal'}
                </p>
                <span className="inline-block mt-1.5 text-[10px] font-sans px-1.5 py-0.5 rounded-sm bg-elevated text-ink-secondary border border-border-subtle">
                  Cash Account
                </span>
              </div>

              <div className="p-1">
                <Link
                  to="/portfolio"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-1.5 text-xs text-ink-secondary hover:text-ink-primary hover:bg-elevated rounded transition-colors"
                >
                  <span>Holdings</span>
                  <span className="text-[10px] font-mono text-ink-muted">Portfolio</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onLogout) onLogout();
                    else navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-trade-down hover:bg-red-500/10 rounded text-left mt-0.5 transition-colors cursor-pointer"
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
