"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPanel } from "./NotificationPanel";
import { AccountDetailDialog } from "@/components/admin/AccountDetailDialog";
import type { AccountWithEmail } from "@thc-efb/supabase/types";

interface DialogState {
  account: AccountWithEmail;
  adminName: string;
  isSuperAdmin: boolean;
}

interface NotificationBellProps {
  isSuperAdmin?: boolean;
}

export function NotificationBell({ isSuperAdmin = false }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleNotificationClick = async (notifId: string, accountId: string, url: string) => {
    setOpen(false);
    // Try to open inline dialog for account notifications
    try {
      const res = await fetch(`/api/account/${accountId}`);
      if (res.ok) {
        const data = await res.json();
        setDialog({
          account: data.account,
          adminName: data.adminName,
          isSuperAdmin: data.isSuperAdmin,
        });
        setDialogOpen(true);
        return;
      }
    } catch {
      // fallback below
    }
    // Fallback: navigate to /noti page (e.g. non-account notifications)
    window.location.href = url;
  };

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-black/5 transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          aria-label="Thông báo"
        >
          <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <NotificationPanel
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClose={() => setOpen(false)}
            onNotificationClick={handleNotificationClick}
          />
        )}
      </div>

      {dialog && (
        <AccountDetailDialog
          account={dialog.account}
          adminName={dialog.adminName}
          open={dialogOpen}
          onOpenChange={(newOpen) => {
            if (!newOpen) {
              setDialogOpen(false);
              setTimeout(() => setDialog(null), 350);
            }
          }}
          showApproveButton={dialog.isSuperAdmin}
        />
      )}
    </>
  );
}
