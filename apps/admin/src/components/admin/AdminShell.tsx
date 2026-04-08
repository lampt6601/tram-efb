"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
interface AdminShellProps {
  children: ReactNode;
  isSuperAdmin?: boolean;
  isBoardMember?: boolean;
  adminName?: string;
  adminEmail?: string;
  adminAvatarUrl?: string;
  /** When true, runs in Telegram Mini App mode: no sidebar, TMA-optimized layout */
  isTma?: boolean;
}

export function AdminShell({ children, isSuperAdmin = false, isBoardMember = false, adminName = "", adminEmail = "", adminAvatarUrl = "", isTma = false }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {!isTma && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isSuperAdmin={isSuperAdmin}
          isBoardMember={isBoardMember}
          adminName={adminName}
          adminEmail={adminEmail}
          adminAvatarUrl={adminAvatarUrl}
        />
      )}

      {/* Main content */}
      <main className={isTma
        ? "p-4 pb-nav-mobile"
        : "pt-main-mobile p-4 pb-nav-mobile lg:ml-64 lg:p-6 lg:pt-6 lg:pb-6"
      }>
        {children}
      </main>

      {/* Bottom navigation */}
      <MobileBottomNav
        isSuperAdmin={isSuperAdmin}
        isBoardMember={isBoardMember}
        adminName={adminName}
        adminEmail={adminEmail}
        adminAvatarUrl={adminAvatarUrl}
        isTma={isTma}
      />
    </div>
  );
}
