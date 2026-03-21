"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminOption {
  id: string;
  name: string;
  email: string;
}

export function AdminRevenueFilter({ admins }: { admins: AdminOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedParam = searchParams.get("admins") ?? "";
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(selectedParam ? selectedParam.split(",") : []),
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (selected.size > 0) {
      params.set("admins", Array.from(selected).join(","));
    } else {
      params.delete("admins");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clear = () => {
    setSelected(new Set());
    const params = new URLSearchParams(searchParams.toString());
    params.delete("admins");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-indigo-500" />
        <h2 className="text-lg font-semibold text-slate-900">Doanh thu theo admin</h2>
        {selected.size > 0 && (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
            {selected.size} đang chọn
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {admins.map((admin) => {
          const isActive = selected.has(admin.id);
          return (
            <button
              key={admin.id}
              onClick={() => toggle(admin.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-indigo-300 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold leading-none">
                {(admin.name || admin.email)[0].toUpperCase()}
              </span>
              {admin.name || admin.email}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          onClick={apply}
          className="h-8 bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Xem thống kê
        </Button>
        {selected.size > 0 && (
          <Button
            variant="outline"
            onClick={clear}
            className="h-8 px-4 text-xs text-slate-600"
          >
            Bỏ chọn
          </Button>
        )}
      </div>
    </div>
  );
}
