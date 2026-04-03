"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";

export interface FilterField {
  /** URL search param key (e.g. "q", "status", "sort") */
  key: string;
  /** Default value — when the filter equals this, it's omitted from the URL */
  defaultValue: string;
}

export interface UseUrlFiltersReturn {
  /** Current local values keyed by field key */
  values: Record<string, string>;
  /** Set a single filter's local value */
  setValue: (key: string, value: string) => void;
  /** Push local values to the URL */
  applyFilters: () => void;
  /** Reset all filters to defaults and clear the URL */
  clearAll: () => void;
  /** Keyboard handler — applies filters on Enter */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** True if any URL param differs from its default */
  hasActiveFilters: boolean;
  /** True if any local value differs from the current URL value */
  hasUnsavedChanges: boolean;
  /** True while the router transition is pending */
  isPending: boolean;
}

export function useUrlFilters(fields: FilterField[]): UseUrlFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read current URL values
  const currentValues: Record<string, string> = {};
  for (const f of fields) {
    currentValues[f.key] = searchParams.get(f.key) ?? f.defaultValue;
  }

  // Local state — one state object for all fields
  const [localValues, setLocalValues] = useState(currentValues);

  // Sync local state when URL changes externally
  useEffect(() => {
    setLocalValues((prev) => {
      const next: Record<string, string> = {};
      let changed = false;
      for (const f of fields) {
        const urlVal = searchParams.get(f.key) ?? f.defaultValue;
        next[f.key] = urlVal;
        if (prev[f.key] !== urlVal) changed = true;
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setValue = useCallback((key: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    for (const f of fields) {
      const val = localValues[f.key];
      if (val && val !== f.defaultValue) {
        params.set(f.key, val);
      }
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname, localValues]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") applyFilters();
    },
    [applyFilters],
  );

  const clearAll = useCallback(() => {
    const defaults: Record<string, string> = {};
    for (const f of fields) {
      defaults[f.key] = f.defaultValue;
    }
    setLocalValues(defaults);
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname]);

  let hasActiveFilters = false;
  let hasUnsavedChanges = false;
  for (const f of fields) {
    if (currentValues[f.key] !== f.defaultValue) hasActiveFilters = true;
    if (localValues[f.key] !== currentValues[f.key]) hasUnsavedChanges = true;
  }

  return {
    values: localValues,
    setValue,
    applyFilters,
    clearAll,
    handleKeyDown,
    hasActiveFilters,
    hasUnsavedChanges,
    isPending,
  };
}
