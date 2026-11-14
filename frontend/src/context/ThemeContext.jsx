import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

/**
 * TradeWise Theme Provider
 * Supports:
 * - 'light': Ivory Mist (warm off-white/ivory surfaces, pitch-black typography, crisp hairlines)
 * - 'dark': Obsidian Pro (true pitch charcoal & neutral obsidian, zero blue tint)
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('tw-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) {}
    // Default to light (Ivory Mist)
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('bordo', 'bordo-dark', 'cool-horizon');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem('tw-theme', theme);
    } catch (_) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
