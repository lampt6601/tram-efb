"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { ArrowUpDown, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PriceInput } from "@/components/ui/price-input";

const SEARCH_DEBOUNCE_MS = 600;

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "price_asc", label: "Giá bán tăng" },
  { value: "price_desc", label: "Giá bán giảm" },
  { value: "gp_desc", label: "GP cao nhất" },
  { value: "strength_desc", label: "Lực chiến cao nhất" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "Available", label: "Sẵn Sàng" },
  { value: "Pending", label: "Đang Chờ" },
  { value: "Deposited", label: "Đang Cọc" },
  { value: "Sold", label: "Đã Bán" },
];

export function SuperAccountFilters({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const sort = searchParams.get("sort") ?? "newest";
  const status = searchParams.get("status") ?? "Available";
  const approval = searchParams.get("approval") ?? "all";
  const search = searchParams.get("q") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const [localSearch, setLocalSearch] = useState(search);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const debouncedSearch = useDebounce(localSearch, SEARCH_DEBOUNCE_MS);
  const debouncedMinPrice = useDebounce(localMinPrice, 600);
  const debouncedMaxPrice = useDebounce(localMaxPrice, 600);

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  const lastDebounced = useRef(debouncedSearch);
  const lastDebouncedMin = useRef(debouncedMinPrice);
  const lastDebouncedMax = useRef(debouncedMaxPrice);

  useEffect(() => {
    if (debouncedSearch !== lastDebounced.current) {
      lastDebounced.current = debouncedSearch;
      if (debouncedSearch !== search) update("q", debouncedSearch);
    }
  }, [debouncedSearch, search, update]);

  useEffect(() => {
    if (debouncedMinPrice !== lastDebouncedMin.current) {
      lastDebouncedMin.current = debouncedMinPrice;
      if (debouncedMinPrice !== minPrice) update("minPrice", debouncedMinPrice);
    }
  }, [debouncedMinPrice, minPrice, update]);

  useEffect(() => {
    if (debouncedMaxPrice !== lastDebouncedMax.current) {
      lastDebouncedMax.current = debouncedMaxPrice;
      if (debouncedMaxPrice !== maxPrice) update("maxPrice", debouncedMaxPrice);
    }
  }, [debouncedMaxPrice, maxPrice, update]);

  useEffect(() => {
    if (!isSearchFocused) setLocalSearch(search);
  }, [search, isSearchFocused]);
  useEffect(() => setLocalMinPrice(minPrice), [minPrice]);
  useEffect(() => setLocalMaxPrice(maxPrice), [maxPrice]);

  const hasActiveFilters =
    sort !== "newest" ||
    status !== "Available" ||
    approval !== "all" ||
    search !== "" ||
    minPrice !== "" ||
    maxPrice !== "";

  const clearAll = () => {
    setLocalSearch("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
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
            placeholder="Tìm theo tiêu đề..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="h-10 w-full rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 pl-10 pr-4 text-sm text-slate-700 shadow-sm transition-all focus-visible:border-amber-400 focus-visible:ring-4 focus-visible:ring-amber-400/20"
          />
        </div>

        {/* Status + Approval + Sort + Clear */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status */}
          <div className="flex flex-1 md:flex-none items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 shadow-sm">
            <select
              value={status}
              onChange={(e) => update("status", e.target.value)}
              className="h-9 w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Approval toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => update("approval", approval === "pending" ? "" : "pending")}
            className={`h-9 shrink-0 rounded-xl px-3 text-sm font-medium transition-all shadow-sm ${
              approval === "pending"
                ? "border-amber-400 bg-amber-500 text-white hover:bg-amber-600 hover:border-amber-500"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Cần duyệt
          </Button>

          {/* Sort */}
          <div className="flex flex-1 md:flex-none items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 shadow-sm">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <select
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
              className="h-9 w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear */}
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
        </div>

        {/* Price range + count */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 pl-2.5 shadow-sm">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
            <PriceInput
              placeholder="Giá từ"
              value={localMinPrice}
              onChange={setLocalMinPrice}
              accent="amber"
              className="h-7 w-[4.5rem] md:w-24 border-0 bg-transparent px-1.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-0 shadow-none"
            />
            <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
            <PriceInput
              placeholder="đến"
              value={localMaxPrice}
              onChange={setLocalMaxPrice}
              accent="amber"
              className="h-7 w-[4.5rem] md:w-24 border-0 bg-transparent px-1.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-0 shadow-none"
            />
          </div>

          <span className="ml-auto shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
            {isPending ? "Đang lọc..." : `${totalCount} tài khoản`}
          </span>
        </div>
      </div>
    </div>
  );
}
