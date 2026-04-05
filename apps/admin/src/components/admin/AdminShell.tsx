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
  /** When true, runs in Telegram Mini App mode: no sidebar, TMA-optimized layout */
  isTma?: boolean;
}

export function AdminShell({ children, isSuperAdmin = false, adminName = "", adminEmail = "", adminAvatarUrl = "", isTma = false }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {!isTma && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isSuperAdmin={isSuperAdmin}
          adminName={adminName}
          adminEmail={adminEmail}
          adminAvatarUrl={adminAvatarUrl}
        />
      )}

      {/* Notification bell — hidden in TMA (Telegram handles notifications) */}
      {!isTma && (
        <>
          {/* Mobile notification bell — top-safe clears iOS status bar */}
          <div className="top-safe fixed right-4 top-4 z-30 lg:hidden">
            <NotificationBell isSuperAdmin={isSuperAdmin} />
          </div>
          {/* Desktop notification bell */}
          <div className="fixed right-6 top-5 z-30 hidden lg:block">
            <NotificationBell isSuperAdmin={isSuperAdmin} />
          </div>
        </>
      )}

      {/* Main content */}
      <main className={isTma
        ? "p-4 pb-24"
        : "pt-main-mobile p-4 pb-24 lg:ml-64 lg:p-6 lg:pt-6 lg:pb-6"
      }>
        {children}
      </main>

      {/* Bottom navigation */}
      <MobileBottomNav
        isSuperAdmin={isSuperAdmin}
        adminName={adminName}
        adminEmail={adminEmail}
        adminAvatarUrl={adminAvatarUrl}
        isTma={isTma}
      />
    </div>
  );
}
