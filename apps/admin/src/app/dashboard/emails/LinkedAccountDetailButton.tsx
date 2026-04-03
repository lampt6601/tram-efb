"use client";

import { useState } from "react";
import { AccountDetailDialog } from "@/components/admin/AccountDetailDialog";
import type { AccountWithEmail } from "@thc-efb/supabase/types";

interface LinkedAccountDetailButtonProps {
  account: AccountWithEmail;
}

export function LinkedAccountDetailButton({ account }: LinkedAccountDetailButtonProps) {
  const [open, setOpen] = useState(false);
  const [adminName, setAdminName] = useState<string>(account.user_id);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleClick = async () => {
    if (!loaded) {
      try {
        const res = await fetch(`/api/account/${account.id}`);
        if (res.ok) {
          const data = await res.json();
          setAdminName(data.adminName);
          setIsSuperAdmin(data.isSuperAdmin);
        }
      } catch {
        // fallback to defaults already set
      }
      setLoaded(true);
    }
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="max-w-[160px] truncate text-left text-xs text-slate-400 transition-colors hover:text-indigo-600 hover:underline dark:text-slate-500 dark:hover:text-indigo-400"
        title={account.title}
      >
        {account.title}
      </button>

      <AccountDetailDialog
        account={account}
        adminName={adminName}
        open={open}
        onOpenChange={(v) => {
          if (!v) setOpen(false);
        }}
        showApproveButton={isSuperAdmin && !account.is_approved && account.status !== "Sold"}
      />
    </>
  );
}
