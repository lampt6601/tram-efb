"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AccountDetailDialog } from "@/components/admin/AccountDetailDialog";
import type { AccountWithEmail } from "@thc-efb/supabase/types";

interface SuperAccountDetailOpenerProps {
  accountId: string;
  accounts: AccountWithEmail[];
  adminEmailMap: Record<string, string>;
}

export function SuperAccountDetailOpener({
  accountId,
  accounts,
  adminEmailMap,
}: SuperAccountDetailOpenerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const account = accounts.find((a) => a.id === accountId);
  if (!account) return null;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("detail");
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    }
  };

  return (
    <AccountDetailDialog
      account={account}
      adminName={adminEmailMap[account.user_id] ?? account.user_id}
      open
      onOpenChange={handleOpenChange}
      showApproveButton
    />
  );
}
