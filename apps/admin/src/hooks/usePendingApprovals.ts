"use client";

import { useState, useCallback } from "react";

export interface PendingAccount {
  id: string;
  title: string;
  selling_price: number | null;
  primary_image_url: string | null;
  status: string;
  user_id: string;
  created_at: string;
  admin_name: string;
}

/**
 * Hook to fetch accounts pending super-admin approval.
 * Unlike useNotifications, this fetches FRESH data every time `refresh()` is called
 * (e.g. when the bell is opened) rather than polling on interval.
 */
export function usePendingApprovals() {
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pending-approvals", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setAccounts(data.accounts || []);
      setCount(data.count || 0);

      // Update app badge with pending count
      if ("setAppBadge" in navigator) {
        if (data.count > 0) {
          navigator.setAppBadge(data.count);
        } else {
          navigator.clearAppBadge();
        }
      }
    } catch {
      // ignore network errors
    } finally {
      setLoading(false);
    }
  }, []);

  /** Remove an account from local state after approval (optimistic update) */
  const removeAccount = useCallback((accountId: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    setCount((prev) => {
      const newCount = Math.max(0, prev - 1);

      // Update PWA app icon badge (iOS 16.4+, Chrome 113+)
      if ("setAppBadge" in navigator) {
        if (newCount > 0) navigator.setAppBadge(newCount);
        else navigator.clearAppBadge();
      }

      return newCount;
    });
  }, []);

  return { accounts, count, loading, refresh, removeAccount };
}
