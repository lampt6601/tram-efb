"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { usePendingApprovals } from "@/hooks/usePendingApprovals";
import { PendingApprovalsPanel } from "./PendingApprovalsPanel";
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
  const { accounts, count, loading, refresh, removeAccount } =
    usePendingApprovals();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch pending approvals on mount + every 60s for badge count
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Refresh data every time the panel opens
  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) refresh(); // fresh data on open
      return next;
    });
  }, [refresh]);

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

  const handleViewAccount = async (accountId: string) => {
    setOpen(false);
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
      // fallback
    }
    window.location.href = `/dashboard/super/accounts?highlight=${accountId}`;
  };

  const handleApproved = (accountId: string) => {
    removeAccount(accountId);
  };

  const handleRejected = (accountId: string) => {
    removeAccount(accountId);
  };

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={handleToggle}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-black/5 transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          aria-label={`${count} tài khoản chờ duyệt`}
        >
          <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>

        {open && (
          <PendingApprovalsPanel
            accounts={accounts}
            loading={loading}
            onClose={() => setOpen(false)}
            onViewAccount={handleViewAccount}
            onApproved={handleApproved}
            onRejected={handleRejected}
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
