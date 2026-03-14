"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";

const PERIODS = [
  { value: "", label: "Tất cả", icon: CalendarRange },
  { value: "week", label: "Theo tuần", icon: Calendar },
  { value: "month", label: "Theo tháng", icon: CalendarDays },
] as const;

export function DashboardPeriodFilter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("period") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-1">
      {PERIODS.map(({ value, label, icon: Icon }) => {
        const href = value ? `${pathname}?period=${value}` : pathname;
        const isActive = current === value;
        return (
          <Link
            key={value || "all"}
            href={href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-600 hover:bg-white/70 hover:text-slate-800"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
