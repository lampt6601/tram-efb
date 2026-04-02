"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface AdminShellProps {
  children: ReactNode;
  isSuperAdmin?: boolean;
  adminName?: string;
  adminEmail?: string;
  adminAvatarUrl?: string;
}

export function AdminShell({ children, isSuperAdmin = false, adminName = "", adminEmail = "", adminAvatarUrl = "" }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isSuperAdmin={isSuperAdmin}
        adminName={adminName}
        adminEmail={adminEmail}
        adminAvatarUrl={adminAvatarUrl}
      />

      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg bg-white p-2 text-slate-500 shadow-md hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <NotificationBell />
      </div>

      {/* Desktop notification bell */}
      <div className="fixed right-6 top-5 z-30 hidden lg:block">
        <NotificationBell />
      </div>

      {/* Main content — offset by sidebar width on desktop */}
      <main className="p-4 pt-16 lg:ml-64 lg:p-6 lg:pt-6">{children}</main>
    </div>
  );
}
