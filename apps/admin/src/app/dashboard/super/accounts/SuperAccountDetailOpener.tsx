"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PendingAccountDrawer } from "../pending/PendingAccountDrawer";
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

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("detail");
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <PendingAccountDrawer
      account={account}
      adminEmail={adminEmailMap[account.user_id] ?? account.user_id}
      showApproveButton={!account.is_approved && account.status !== "Sold"}
      controlledOpen
      onControlledClose={handleClose}
    />
  );
}
