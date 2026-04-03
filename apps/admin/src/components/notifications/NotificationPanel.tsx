"use client";

import {
  ShoppingCart,
  UserPlus,
  CheckCircle,
  Plus,
  Bell,
} from "lucide-react";
import type { Notification } from "@/hooks/useNotifications";

const TYPE_ICONS: Record<string, typeof Bell> = {
  sell_request: ShoppingCart,
  application: UserPlus,
  account_approved: CheckCircle,
  account_created: Plus,
};

function navigateTo(url: string, onClose: () => void) {
  onClose();
  if (url.startsWith("http")) {
    window.open(url, "_blank");
  } else {
    window.location.href = url;
  }
}


function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (ids: string[]) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
  /** If provided, called for account notifications (accountId in data) instead of navigating */
  onNotificationClick?: (notifId: string, accountId: string, url: string) => void;
}

export function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
  onNotificationClick,
}: NotificationPanelProps) {
  const hasUnread = notifications.some((n) => !n.is_read);

  const handleRowClick = (notification: Notification) => {
    if (!notification.is_read) {
      onMarkAsRead([notification.id]);
    }
    const url = notification.data?.url as string | undefined;
    const accountId = notification.data?.accountId as string | undefined;
    if (accountId && url && onNotificationClick) {
      onClose();
      onNotificationClick(notification.id, accountId, url);
      return;
    }
    if (url) {
      navigateTo(url, onClose);
    }
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900 sm:w-96">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Thông báo
        </h3>
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            Chưa có thông báo
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = TYPE_ICONS[notification.type] || Bell;

            return (
              <div
                key={notification.id}
                role="button"
                tabIndex={0}
                onClick={() => handleRowClick(notification)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRowClick(notification);
                }}
                className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                  !notification.is_read
                    ? "bg-indigo-50/50 dark:bg-indigo-500/5"
                    : ""
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    !notification.is_read
                      ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                      : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      !notification.is_read
                        ? "font-medium text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-500">
                      {notification.body}
                    </p>
                  )}
                  <span className="mt-1 block text-xs text-slate-400 dark:text-slate-600">
                    {timeAgo(notification.created_at)}
                  </span>
                </div>
                {!notification.is_read && (
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
