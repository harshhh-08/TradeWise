import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wallet, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export function TopBar({ onToggleMobileMenu, isMobileMenuOpen, user, walletBalance, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/markets?q=${encodeURIComponent(query)}`);
    setSearchQuery('');
  };

  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-raised)]"
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-64 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stock symbol (e.g. AAPL)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)] transition-colors"
          />
        </form>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
          <Wallet className="w-4 h-4 text-[var(--color-brand)]" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-[var(--color-text-muted)] font-medium leading-none">
              Buying Power
            </span>
            <span className="text-xs font-semibold font-mono text-[var(--color-text-primary)]">
              {formatCurrency(walletBalance ?? 100000)}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-raised)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand)] font-semibold flex items-center justify-center text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-[var(--color-text-primary)]">
              {user?.name || 'Trader'}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border)] shadow-lg py-1 z-30">
              <div className="px-3 py-2 border-b border-[var(--color-border)]">
                <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                  {user?.name || 'Demo Account'}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                  {user?.email || 'trader@tradewise.internal'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  if (onLogout) onLogout();
                  else navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-error)] hover:bg-[var(--color-error-subtle)] text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

