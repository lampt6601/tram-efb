"use client";

import { useState, useEffect, useCallback } from "react";

export interface NavigateAction {
  id: string;
  label: string;
  url: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> & {
    url?: string;
    navigateActions?: NavigateAction[];
  };
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);

      // Update app badge
      if ("setAppBadge" in navigator) {
        if (data.unreadCount > 0) {
          navigator.setAppBadge(data.unreadCount);
        } else {
          navigator.clearAppBadge();
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(
    async (ids: string[]) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - ids.length));

      // Update badge
      const newCount = Math.max(0, unreadCount - ids.length);
      if ("setAppBadge" in navigator) {
        if (newCount > 0) navigator.setAppBadge(newCount);
        else navigator.clearAppBadge();
      }
    },
    [unreadCount]
  );

  const markAllAsRead = useCallback(async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    if ("clearAppBadge" in navigator) {
      navigator.clearAppBadge();
    }
  }, []);

  // Initial fetch + poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
