"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountDetailDialog } from "@/components/admin/AccountDetailDialog";
import type { AccountWithEmail } from "@thc-efb/supabase/types";

interface NotiDetailClientProps {
  account: AccountWithEmail;
  adminName: string;
  showApproveButton?: boolean;
}

export function NotiDetailClient({
  account,
  adminName,
  showApproveButton,
}: NotiDetailClientProps) {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setOpen(false);
      setTimeout(() => {
        // Go back to the page that linked here (notification panel).
        // Fallback to dashboard if opened cold (e.g. from push notification).
        if (window.history.length > 2) {
          router.back();
        } else {
          router.replace("/dashboard");
        }
      }, 350);
    }
  };

  return (
    <AccountDetailDialog
      account={account}
      adminName={adminName}
      open={open}
      onOpenChange={handleOpenChange}
      showApproveButton={showApproveButton}
    />
  );
}
