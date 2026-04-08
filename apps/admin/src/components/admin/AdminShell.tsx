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
}

export function AdminShell({ children, isSuperAdmin = false, isBoardMember = false, adminName = "", adminEmail = "", adminAvatarUrl = "" }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isSuperAdmin={isSuperAdmin}
        isBoardMember={isBoardMember}
        adminName={adminName}
        adminEmail={adminEmail}
        adminAvatarUrl={adminAvatarUrl}
      />

      {/* Main content */}
      <main className="pt-main-mobile p-4 pb-nav-mobile lg:ml-64 lg:p-6 lg:pt-6 lg:pb-6">
        {children}
      </main>

      {/* Bottom navigation */}
      <MobileBottomNav
        isSuperAdmin={isSuperAdmin}
        isBoardMember={isBoardMember}
        adminName={adminName}
        adminEmail={adminEmail}
        adminAvatarUrl={adminAvatarUrl}
      />
    </div>
  );
}
