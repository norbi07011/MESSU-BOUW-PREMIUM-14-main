/**
 * THEME CONTEXT - Tylko jasny motyw (Light Mode)
 */

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { Theme } from '@/lib/theme';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme: Theme = 'light'; // Zawsze jasny motyw

  // Zastosuj light mode do <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'dark-purple', 'dark-cyan', 'dark-emerald', 'dark-blue');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    
    // Usuń z localStorage stare ustawienia
    localStorage.removeItem('messu-theme');
  }, []);

  const toggleTheme = () => {
    // Brak akcji - motyw zablokowany na light
  };

  const setTheme = (newTheme: Theme) => {
    // Brak akcji - motyw zablokowany na light
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
