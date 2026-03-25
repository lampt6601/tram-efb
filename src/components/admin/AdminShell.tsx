"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/storefront/ThemeToggle";

interface AdminShellProps {
  children: ReactNode;
  isSuperAdmin?: boolean;
  adminName?: string;
  adminEmail?: string;
  canViewAllAccounts?: boolean;
}

export function AdminShell({ children, isSuperAdmin = false, adminName = "", adminEmail = "", canViewAllAccounts = false }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isSuperAdmin={isSuperAdmin}
        adminName={adminName}
        adminEmail={adminEmail}
        canViewAllAccounts={canViewAllAccounts}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto">
            <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
