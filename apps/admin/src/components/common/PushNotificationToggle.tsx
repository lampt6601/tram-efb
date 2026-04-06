"use client";

import { BellRing, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePushSubscription } from "@/hooks/usePushSubscription";

/**
 * Toggle component for enabling/disabling push notifications.
 * Shows appropriate state: unsupported, denied, subscribed, unsubscribed.
 */
export function PushNotificationToggle() {
  const { state, loading, subscribe, unsubscribe } = usePushSubscription();

  if (state === "loading") return null;

  if (state === "unsupported") {
    return (
      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 dark:text-slate-500">
        <BellOff className="h-5 w-5 shrink-0" />
        <span>Thiết bị không hỗ trợ thông báo đẩy</span>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 dark:text-slate-500">
        <BellOff className="h-5 w-5 shrink-0" />
        <div>
          <span>Thông báo đã bị chặn</span>
          <p className="mt-0.5 text-xs">Vào Cài đặt thiết bị để bật lại</p>
        </div>
      </div>
    );
  }

  const isSubscribed = state === "subscribed";

  const handleToggle = async () => {
    if (isSubscribed) {
      const ok = await unsubscribe();
      if (ok) toast.success("Đã tắt thông báo đẩy");
    } else {
      const ok = await subscribe();
      if (ok) {
        toast.success("Đã bật thông báo đẩy");
      } else if (Notification.permission === "denied") {
        toast.error("Thông báo bị chặn. Vui lòng cho phép trong cài đặt thiết bị.");
      }
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isSubscribed
          ? "text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      }`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-slate-400" />
      ) : isSubscribed ? (
        <BellRing className="h-5 w-5 shrink-0 text-indigo-500 dark:text-indigo-400" />
      ) : (
        <BellOff className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" />
      )}
      <span>{isSubscribed ? "Thông báo đẩy: Bật" : "Bật thông báo đẩy"}</span>
    </button>
  );
}
