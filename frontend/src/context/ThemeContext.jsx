import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

/**
 * ThemeProvider — wraps the app and manages light/dark mode.
 *
 * Strategy:
 *  1. On mount, reads saved preference from localStorage.
 *  2. Falls back to OS preference via matchMedia.
 *  3. Applies/removes the `.dark` class on <html>.
 *  4. Exposes `theme` ("dark" | "light"), `toggleTheme`, and `setTheme`.
 *
 * Usage:
 *   <ThemeProvider defaultTheme="dark">
 *     <App />
 *   </ThemeProvider>
 *
 *   const { theme, toggleTheme } = useTheme();
 */
export function ThemeProvider({ children, defaultTheme = 'dark' }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return defaultTheme;
    const stored = localStorage.getItem('tw-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    // OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('tw-theme', theme);
  }, [theme]);

  // Sync with OS changes at runtime (when user hasn't set a preference)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const stored = localStorage.getItem('tw-theme');
      // Only follow OS if user hasn't manually set a preference
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = (next) => {
    setThemeState(next);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Access the current theme and toggle function anywhere in the tree. */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}

