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

      {/* Mobile notification bell — top-safe clears iOS status bar */}
      <div className="top-safe fixed right-4 top-4 z-30 lg:hidden">
        <NotificationBell isSuperAdmin={isSuperAdmin} />
      </div>

      {/* Desktop notification bell */}
      <div className="fixed right-6 top-5 z-30 hidden lg:block">
        <NotificationBell isSuperAdmin={isSuperAdmin} />
      </div>

      {/* Main content — pt accounts for top bar height + safe area on mobile */}
      <main className="pt-main-mobile p-4 pb-24 lg:ml-64 lg:p-6 lg:pt-6 lg:pb-6">{children}</main>

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
