"use client";

import { useState } from "react";
import { PendingAccountDrawer } from "@/app/dashboard/super/pending/PendingAccountDrawer";
import type { AccountWithEmail } from "@thc-efb/supabase/types";

interface LinkedAccountDetailButtonProps {
  account: AccountWithEmail;
}

export function LinkedAccountDetailButton({
  account,
}: LinkedAccountDetailButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="max-w-[160px] truncate text-left text-xs text-slate-400 transition-colors hover:text-indigo-600 hover:underline dark:text-slate-500 dark:hover:text-indigo-400"
        title={account.title}
      >
        {account.title}
      </button>
      <PendingAccountDrawer
        account={account}
        adminEmail="Bạn"
        controlledOpen={open}
        onControlledClose={() => setOpen(false)}
      />
    </>
  );
}
