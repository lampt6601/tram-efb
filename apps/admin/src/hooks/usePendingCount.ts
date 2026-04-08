"use client";

import { useEffect, useState } from "react";

interface UsePendingCountResult {
  count: number;
  loading: boolean;
}

export function usePendingCount(enabled: boolean): UsePendingCountResult {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const updateBadge = (value: number) => {
      const navAny = navigator as any;
      if (value > 0 && "setAppBadge" in navigator && typeof navAny.setAppBadge === "function") {
        navAny.setAppBadge(value);
      } else if (
        value === 0 &&
        "clearAppBadge" in navigator &&
        typeof navAny.clearAppBadge === "function"
      ) {
        navAny.clearAppBadge();
      }
    };

    const fetchCount = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/pending-count");
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { count?: number };
        if (cancelled) return;
        const nextCount = typeof data.count === "number" ? data.count : 0;
        setCount(nextCount);
        updateBadge(nextCount);
      } catch {
        // ignore network errors
      } finally {
        if (!cancelled) {
          setLoading(false);
          timeoutId = setTimeout(fetchCount, 5 * 60 * 1000);
        }
      }
    };

    fetchCount();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [enabled]);

  return { count, loading: enabled && loading };
}

