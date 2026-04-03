"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
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
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
          THC <span className="text-indigo-600 dark:text-indigo-400">Admin</span>
        </span>
        <NotificationBell isSuperAdmin={isSuperAdmin} />
      </div>

      {/* Desktop notification bell */}
      <div className="fixed right-6 top-5 z-30 hidden lg:block">
        <NotificationBell isSuperAdmin={isSuperAdmin} />
      </div>

      {/* Main content — offset by sidebar width on desktop, padded for bottom nav on mobile */}
      <main className="p-4 pt-16 pb-24 lg:ml-64 lg:p-6 lg:pt-6 lg:pb-6">{children}</main>

      {/* Mobile bottom navigation */}
      <MobileBottomNav
        isSuperAdmin={isSuperAdmin}
        adminName={adminName}
        adminEmail={adminEmail}
        adminAvatarUrl={adminAvatarUrl}
      />
    </div>
  );
}
