"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chưa xử lý" },
  { value: "completed", label: "Đã hoàn tất" },
];

export function RequestFilters({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";

  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [localStatus, setLocalStatus] = useState(currentStatus);

  useEffect(() => { setLocalSearch(currentSearch); }, [currentSearch]);
  useEffect(() => { setLocalStatus(currentStatus); }, [currentStatus]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (localSearch) params.set("q", localSearch);
    if (localStatus !== "all") params.set("status", localStatus);

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }, [router, pathname, localSearch, localStatus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applyFilters();
  };

  const hasActiveFilters = currentSearch !== "" || currentStatus !== "all";
  const hasUnsavedChanges = localSearch !== currentSearch || localStatus !== currentStatus;

  const clearAll = () => {
    setLocalSearch("");
    setLocalStatus("all");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <div
      className={`transition-opacity duration-200 ${isPending ? "opacity-60 pointer-events-none" : "opacity-100"}`}
    >
      <div className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center md:gap-3">
        {/* Search */}
        <div className="relative w-full md:flex-1 md:min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder="Tìm theo chi tiết, người yêu cầu..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-10 w-full rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 pl-10 pr-4 text-sm text-slate-700 shadow-sm transition-all focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-400/20"
          />
        </div>

        {/* Status + Apply + Clear + Count */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex flex-1 md:flex-none items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 shadow-sm">
            <Select value={localStatus} onValueChange={(val) => { if (val !== null) setLocalStatus(val) }}>
              <SelectTrigger className="h-9 w-full border-0 bg-transparent text-sm text-slate-700 dark:text-slate-200 px-0 shadow-none">
                <SelectValue>{STATUS_OPTIONS.find((o) => o.value === localStatus)?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Apply */}
          <Button
            size="sm"
            onClick={applyFilters}
            disabled={!hasUnsavedChanges}
            className="h-9 shrink-0 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 shadow-sm"
          >
            <Search className="mr-1 h-3.5 w-3.5" />
            Lọc
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="h-9 shrink-0 rounded-xl border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 shadow-sm"
            >
              Xoá lọc
            </Button>
          )}

          <span className="ml-auto shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
            {isPending ? "Đang lọc..." : `${totalCount} yêu cầu`}
          </span>
        </div>
      </div>
    </div>
  );
}
