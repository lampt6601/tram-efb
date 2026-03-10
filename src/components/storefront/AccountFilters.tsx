"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { SlidersHorizontal, ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "gp_desc", label: "GP cao nhất" },
  { value: "strength_desc", label: "Lực chiến cao nhất" },
];

const selectClass =
  "h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-inset focus:ring-indigo-400 hover:border-slate-300 cursor-pointer";

const inputClass =
  "h-9 rounded-xl border-slate-200 px-3 text-sm text-slate-700 focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30";

export function AccountFilters({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const sort = searchParams.get("sort") ?? "newest";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const search = searchParams.get("q") ?? "";

  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 500);

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  const lastDebouncedSearch = useRef(debouncedSearch);

  useEffect(() => {
    if (debouncedSearch !== lastDebouncedSearch.current) {
      lastDebouncedSearch.current = debouncedSearch;
      if (debouncedSearch !== search) {
        update("q", debouncedSearch);
      }
    }
  }, [debouncedSearch, search, update]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const hasActiveFilters =
    sort !== "newest" || minPrice !== "" || maxPrice !== "" || search !== "";

  const clearAll = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <div
      className={`transition-opacity duration-200 ${isPending ? "opacity-60 pointer-events-none" : "opacity-100"}`}
    >
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[140px] sm:min-w-[200px] md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder="Tìm theo tên..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className={`${inputClass} w-full pl-9`}
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 shrink-0 text-slate-400" />
          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
            className={selectClass}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              placeholder="Giá từ"
              value={minPrice}
              min={0}
              step={10000}
              onChange={(e) => update("minPrice", e.target.value)}
              className={`${inputClass} w-24 sm:w-28`}
            />
            <span className="text-sm text-slate-400">—</span>
            <Input
              type="number"
              placeholder="đến"
              value={maxPrice}
              min={0}
              step={10000}
              onChange={(e) => update("maxPrice", e.target.value)}
              className={`${inputClass} w-24 sm:w-28`}
            />
          </div>
        </div>

        {/* Clear */}
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

        {/* Result count */}
        <span className="ml-auto text-sm text-slate-400">
          {isPending ? "Đang lọc..." : `${totalCount} tài khoản`}
        </span>
      </div>
    </div>
  );
}
