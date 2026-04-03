"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@thc-efb/supabase/browser";
import {
  LayoutDashboard,
  Gamepad2,
  SearchCheck,
  Tag,
  Mail,
  UserCircle,
  BookOpen,
  ClipboardCheck,
  Globe,
  Users,
  UserPlus,
  Settings,
  MoreHorizontal,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@thc-efb/ui/drawer";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  superAdmin?: boolean;
}

const adminPrimaryItems: NavItem[] = [
  { href: "/dashboard", label: "Trang Chủ", icon: LayoutDashboard },
  { href: "/dashboard/accounts", label: "Tài Khoản", icon: Gamepad2 },
  { href: "/dashboard/requests", label: "Tìm Acc", icon: SearchCheck },
  { href: "/dashboard/sell-requests", label: "Thu Mua", icon: Tag },
];

const adminOverflowItems: NavItem[] = [
  { href: "/dashboard/emails", label: "Email", icon: Mail },
  { href: "/dashboard/profile", label: "Hồ Sơ", icon: UserCircle },
  { href: "/dashboard/guide", label: "Hướng Dẫn", icon: BookOpen },
];

const superAdminPrimaryItems: NavItem[] = [
  { href: "/dashboard", label: "Trang Chủ", icon: LayoutDashboard },
  { href: "/dashboard/super/revenue", label: "Doanh Thu", icon: ClipboardCheck },
  { href: "/dashboard/super/accounts", label: "Tất Cả", icon: Globe },
  { href: "/dashboard/super/admins", label: "Admins", icon: Users },
];

const superAdminOverflowItems: NavItem[] = [
  { href: "/dashboard", label: "Trang Chủ", icon: LayoutDashboard },
  { href: "/dashboard/accounts", label: "Tài Khoản", icon: Gamepad2 },
  { href: "/dashboard/requests", label: "Tìm Acc", icon: SearchCheck },
  { href: "/dashboard/sell-requests", label: "Thu Mua", icon: Tag },
  { href: "/dashboard/emails", label: "Email", icon: Mail },
  { href: "/dashboard/profile", label: "Hồ Sơ", icon: UserCircle },
  { href: "/dashboard/guide", label: "Hướng Dẫn", icon: BookOpen },
  { href: "/dashboard/super/applications", label: "Đơn Đăng Ký", icon: UserPlus, superAdmin: true },
  { href: "/dashboard/super/settings", label: "Cài Đặt", icon: Settings, superAdmin: true },
];

interface MobileBottomNavProps {
  isSuperAdmin?: boolean;
  adminName?: string;
  adminEmail?: string;
  adminAvatarUrl?: string;
}

export function MobileBottomNav({
  isSuperAdmin = false,
  adminName = "",
  adminEmail = "",
  adminAvatarUrl = "",
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryItems = isSuperAdmin ? superAdminPrimaryItems : adminPrimaryItems;
  const overflowItems = isSuperAdmin ? superAdminOverflowItems : adminOverflowItems;

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const isMoreActive = overflowItems.some((item) => isActive(item.href)) &&
    !primaryItems.some((item) => isActive(item.href));

  const handleLogout = async () => {
    setMoreOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleNavClick = () => setMoreOpen(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 pb-safe">
        <div className="flex items-stretch">
          {primaryItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
              isMoreActive
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            }`}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>Thêm</span>
          </button>
        </div>
      </nav>

      {/* More Drawer */}
      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent>
          <DrawerTitle className="sr-only">Menu</DrawerTitle>
          <DrawerDescription className="sr-only">Các mục điều hướng thêm</DrawerDescription>

          <div className="overflow-y-auto px-3 pb-safe">
            {/* Overflow nav — compact 2-column list */}
            <div className="grid grid-cols-2 gap-1 py-2">
              {overflowItems.map((item) => {
                const active = isActive(item.href);
                const isSuperItem = item.superAdmin;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? isSuperItem
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                          : "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 ${active ? (isSuperItem ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400") : "text-slate-400 dark:text-slate-500"}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 pb-4 space-y-3">
              {/* User info */}
              <div className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${isSuperAdmin ? "bg-amber-50 dark:bg-amber-500/10" : "bg-slate-50 dark:bg-slate-800"}`}>
                {adminAvatarUrl ? (
                  <Image
                    src={adminAvatarUrl}
                    alt={adminName || adminEmail}
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-bold ${isSuperAdmin ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400"}`}>
                    {(adminName || adminEmail || "?")[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {adminName && (
                    <p className={`truncate text-xs font-semibold ${isSuperAdmin ? "text-amber-800 dark:text-amber-200" : "text-slate-800 dark:text-slate-200"}`}>
                      {adminName}
                    </p>
                  )}
                  <p className="truncate text-xs text-slate-400 dark:text-slate-500">{adminEmail}</p>
                  {isSuperAdmin && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="h-3 w-3 text-amber-500" />
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Owner</span>
                    </div>
                  )}
                </div>
                <ThemeToggle className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600" />
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <LogOut className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                Đăng Xuất
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
