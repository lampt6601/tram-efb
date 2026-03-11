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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin/dashboard", label: "Bảng Điều Khiển", icon: LayoutDashboard },
  { href: "/admin/dashboard/accounts", label: "Tài Khoản", icon: Gamepad2 },
  { href: "/admin/dashboard/emails", label: "Email", icon: Mail },
];

const superAdminNavItems = [
  { href: "/admin/dashboard/super/accounts", label: "Tất Cả Tài Khoản", icon: Globe },
  { href: "/admin/dashboard/super/admins", label: "Quản Lý Admin", icon: Users },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isSuperAdmin?: boolean;
}

export function Sidebar({ open, onClose, isSuperAdmin = false }: SidebarProps) {
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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Gamepad2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">
              Quản Trị <span className="text-indigo-600">eFootball</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600"
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
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${isActive(item.href) ? "text-indigo-600" : "text-slate-400"}`}
              />
              {item.label}
            </Link>
          ))}

          {isSuperAdmin && (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2 px-3">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                  Super Admin
                </span>
              </div>
              <div className="space-y-1 rounded-xl border border-amber-100 bg-amber-50/50 p-1.5">
                {superAdminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-amber-100 text-amber-800"
                        : "text-amber-700 hover:bg-amber-100 hover:text-amber-900"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${isActive(item.href) ? "text-amber-600" : "text-amber-400"}`}
                    />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="border-t border-slate-200 p-4">
          {isSuperAdmin && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-700">
                Owner / Super Admin
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            Đăng Xuất
          </Button>
        </div>
      </aside>
    </>
  );
}
