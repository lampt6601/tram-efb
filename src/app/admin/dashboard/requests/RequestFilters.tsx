"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SEARCH_DEBOUNCE_MS = 600;

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chưa xử lý" },
  { value: "completed", label: "Đã hoàn tất" },
];

const selectClass =
  "h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-inset focus:ring-indigo-400 hover:border-slate-300 cursor-pointer";

export function RequestFilters({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";

  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, SEARCH_DEBOUNCE_MS);

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  const lastDebounced = useRef(debouncedSearch);
  useEffect(() => {
    if (debouncedSearch !== lastDebounced.current) {
      lastDebounced.current = debouncedSearch;
      if (debouncedSearch !== search) update("q", debouncedSearch);
    }
  }, [debouncedSearch, search, update]);

  useEffect(() => {
    if (!isSearchFocused) setLocalSearch(search);
  }, [search, isSearchFocused]);

  const hasActiveFilters = search !== "" || status !== "all";

  const clearAll = () => {
    setLocalSearch("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <div
      className={`transition-opacity duration-200 ${isPending ? "opacity-60 pointer-events-none" : "opacity-100"}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder="Tìm theo chi tiết, người yêu cầu..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="h-9 rounded-xl border-slate-200 pl-9 text-sm text-slate-700 focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30"
          />
        </div>

        <select
          value={status}
          onChange={(e) => update("status", e.target.value)}
          className={selectClass}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="h-9 rounded-xl border-rose-200 bg-rose-50 px-3 text-sm text-rose-600 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300"
          >
            Xoá bộ lọc
          </Button>
        )}

        <span className="ml-auto text-sm text-slate-400">
          {isPending ? "Đang lọc..." : `${totalCount} yêu cầu`}
        </span>
      </div>
    </div>
  );
}
