"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  LayoutDashboard,
  Gamepad2,
  Mail,
  LogOut,
  X,
  ShieldCheck,
  Users,
  Globe,
  ClipboardCheck,
  UserCircle,
  BookOpen,
  SearchCheck,
  Star,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarStats } from "./SidebarStats";

const navItems = [
  { href: "/admin/dashboard", label: "Bảng Điều Khiển", icon: LayoutDashboard },
  { href: "/admin/dashboard/accounts", label: "Tài Khoản", icon: Gamepad2 },
  { href: "/admin/dashboard/requests", label: "Yêu Cầu Tìm Acc", icon: SearchCheck },
  { href: "/admin/dashboard/emails", label: "Email", icon: Mail },
  { href: "/admin/dashboard/profile", label: "Hồ Sơ Cá Nhân", icon: UserCircle },
  { href: "/admin/dashboard/guide", label: "Hướng Dẫn", icon: BookOpen },
];

const superAdminNavItems = [
  { href: "/admin/dashboard/super/revenue", label: "Doanh Thu Shop", icon: ClipboardCheck },
  { href: "/admin/dashboard/super/accounts", label: "Tất Cả Tài Khoản", icon: Globe },
  { href: "/admin/dashboard/super/admins", label: "Quản Lý Admin", icon: Users },
  { href: "/admin/dashboard/super/reviews", label: "Đánh Giá", icon: Star },
  { href: "/admin/dashboard/super/applications", label: "Đơn Đăng Ký CTV", icon: UserPlus },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isSuperAdmin?: boolean;
  adminName?: string;
  adminEmail?: string;
  canViewAllAccounts?: boolean;
}

export function Sidebar({ open, onClose, isSuperAdmin = false, adminName = "", adminEmail = "", canViewAllAccounts = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/admin/dashboard" && pathname.startsWith(href));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-700 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-700">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Gamepad2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Quản Trị <span className="text-indigo-600 dark:text-indigo-400">eFootball</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${isActive(item.href) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}
              />
              {item.label}
            </Link>
          ))}

          {!isSuperAdmin && canViewAllAccounts && (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2 px-3">
                <Globe className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Được Cấp Phép
                </span>
              </div>
              <div className="space-y-1 rounded-xl border border-indigo-100 bg-indigo-50/50 p-1.5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                <Link
                  href="/admin/dashboard/all-accounts"
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive("/admin/dashboard/all-accounts")
                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300"
                      : "text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300"
                  }`}
                >
                  <Globe
                    className={`h-5 w-5 ${isActive("/admin/dashboard/all-accounts") ? "text-indigo-600 dark:text-indigo-400" : "text-indigo-400 dark:text-indigo-500"}`}
                  />
                  Tất Cả Tài Khoản
                </Link>
              </div>
            </div>
          )}

          {isSuperAdmin && (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2 px-3">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Super Admin
                </span>
              </div>
              <div className="space-y-1 rounded-xl border border-amber-100 bg-amber-50/50 p-1.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                {superAdminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                        : "text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-500/20 dark:hover:text-amber-300"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${isActive(item.href) ? "text-amber-600 dark:text-amber-400" : "text-amber-400 dark:text-amber-500"}`}
                    />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="border-t border-slate-200 py-2 dark:border-slate-700">
          <SidebarStats />
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-slate-700">
          {(adminName || adminEmail) && (
            <div className={`mb-3 flex items-center gap-2.5 rounded-lg px-3 py-2 ${isSuperAdmin ? "bg-amber-50 dark:bg-amber-500/10" : "bg-slate-50 dark:bg-slate-800"}`}>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${isSuperAdmin ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400"}`}>
                {(adminName || adminEmail || "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                {adminName && (
                  <p className={`truncate text-xs font-semibold ${isSuperAdmin ? "text-amber-800 dark:text-amber-200" : "text-slate-800 dark:text-slate-200"}`}>{adminName}</p>
                )}
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">{adminEmail}</p>
                {isSuperAdmin && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Owner</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            Đăng Xuất
          </Button>
        </div>
      </aside>
    </>
  );
}
