import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

/**
 * TradeWise Theme Provider — Exclusively Obsidian Pro
 * All other themes have been disabled. The application runs strictly
 * on the Obsidian Pro financial terminal specification.
 */
export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement;
    // Purge any legacy theme classes
    root.classList.remove('bordo', 'bordo-dark', 'cool-horizon');
    root.classList.add('dark');
    localStorage.setItem('tw-theme', 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
