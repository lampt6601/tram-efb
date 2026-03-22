"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { PendingAccountDrawer } from "@/app/admin/dashboard/super/pending/PendingAccountDrawer";
import type { AccountWithEmail } from "@/types/database";

interface AccountDetailButtonProps {
  account: AccountWithEmail;
  adminName: string;
}

export function AccountDetailButton({ account, adminName }: AccountDetailButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
      >
        <Eye className="h-3.5 w-3.5" />
        Chi tiết
      </button>
      <PendingAccountDrawer
        account={account}
        adminEmail={adminName}
        controlledOpen={open}
        onControlledClose={() => setOpen(false)}
      />
    </>
  );
}
