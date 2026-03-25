'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read initial dark state from DOM (set by inline script in layout.tsx)
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (sessionStorage.getItem('theme') as Theme) || 'system';
  });
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  // Sync on mount (in case inline script ran)
  useEffect(() => {
    const storedTheme = sessionStorage.getItem('theme') as Theme | null;
    if (storedTheme) setThemeState(storedTheme);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        const shouldBeDark = mediaQuery.matches;
        setIsDark(shouldBeDark);
        applyTheme(shouldBeDark);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    // Store preference
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('theme', newTheme);
    }

    // Determine if dark mode should be active
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark =
      newTheme === 'dark' || (newTheme === 'system' && prefersDark);

    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
  };

  // Always wrap in Provider so useTheme() never throws.
  // Before mount, provide default light-mode values.
  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
