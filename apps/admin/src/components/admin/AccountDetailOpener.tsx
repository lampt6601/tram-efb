"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AccountDetailDialog } from "@/components/admin/AccountDetailDialog";
import type { AccountWithEmail } from "@thc-efb/supabase/types";

interface AccountDetailOpenerProps {
  accountId: string;
  accounts: AccountWithEmail[];
  /** Direct admin name — used when only one admin context */
  adminName?: string;
  /** Admin name lookup map — used when multiple admins (e.g. super-admin view) */
  adminNameMap?: Record<string, string>;
  showApproveButton?: boolean;
}

export function AccountDetailOpener({
  accountId,
  accounts,
  adminName,
  adminNameMap,
  showApproveButton,
}: AccountDetailOpenerProps) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const account = accounts.find((a) => a.id === accountId);
  if (!account) return null;

  const resolvedAdminName =
    adminName ?? adminNameMap?.[account.user_id] ?? account.user_id;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(false);
    if (!newOpen) {
      // Close animation runs immediately; navigate after it completes
      setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("detail");
        const qs = params.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
      }, 350);
    }
  };

  return (
    <AccountDetailDialog
      account={account}
      adminName={resolvedAdminName}
      open={open}
      onOpenChange={handleOpenChange}
      showApproveButton={showApproveButton}
    />
  );
}
