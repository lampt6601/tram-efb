"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AccountDetailDialog } from "@/components/admin/AccountDetailDialog";
import type { AccountWithEmail } from "@thc-efb/supabase/types";

interface AccountDetailOpenerProps {
  accountId: string;
  accounts: AccountWithEmail[];
  adminName: string;
}

export function AccountDetailOpener({
  accountId,
  accounts,
  adminName,
}: AccountDetailOpenerProps) {
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
      adminName={adminName}
      open
      onOpenChange={handleOpenChange}
    />
  );
}
