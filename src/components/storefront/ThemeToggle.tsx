'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
}

const defaultClass = "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 transition-colors hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10";

export function ThemeToggle({ className }: ThemeToggleProps = {}) {
  const { isDark, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const btnClass = className ?? defaultClass;

  // Render a placeholder with same dimensions during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className={btnClass}
        aria-label="Chuyển chế độ sáng/tối"
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={btnClass}
      aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-yellow-400 transition-transform" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform" />
      )}
    </button>
  );
}
