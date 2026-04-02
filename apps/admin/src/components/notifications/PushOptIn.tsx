"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@thc-efb/ui/button";

export function PushOptIn() {
  const [permission, setPermission] = useState<NotificationPermission | "loading">("loading");
  const [dismissed, setDismissed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("denied");
      return;
    }
    setPermission(Notification.permission);
    // Check if already dismissed this session
    if (sessionStorage.getItem("push-opt-in-dismissed")) {
      setDismissed(true);
    }
  }, []);

  const subscribe = async () => {
    setSubscribing(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        const json = subscription.toJSON();
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: json.keys,
          }),
        });
      }
    } catch {
      // ignore
    } finally {
      setSubscribing(false);
    }
  };

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("push-opt-in-dismissed", "1");
  };

  // Don't show if: already granted/denied, dismissed, or not supported
  if (
    permission === "loading" ||
    permission === "granted" ||
    permission === "denied" ||
    dismissed
  ) {
    return null;
  }

  return (
    <div className="relative mx-4 mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
      <button
        onClick={dismiss}
        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        aria-label="Đóng"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
          <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Bật thông báo đẩy
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Nhận thông báo khi có đơn mới, yêu cầu mua acc, đánh giá mới.
          </p>
          <Button
            onClick={subscribe}
            size="sm"
            className="mt-2"
            disabled={subscribing}
          >
            {subscribing ? "Đang bật..." : "Bật thông báo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
