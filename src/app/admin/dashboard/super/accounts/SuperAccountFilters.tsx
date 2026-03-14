"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { ArrowUpDown, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PriceInput } from "@/components/ui/price-input";

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
  { value: "Sold", label: "Đã Bán" },
];

const selectClass =
  "h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-inset focus:ring-amber-400 hover:border-slate-300 cursor-pointer";

export function SuperAccountFilters({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const sort = searchParams.get("sort") ?? "newest";
  const status = searchParams.get("status") ?? "all";
  const search = searchParams.get("q") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const [localSearch, setLocalSearch] = useState(search);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const debouncedSearch = useDebounce(localSearch, 500);
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
    [router, pathname, searchParams]
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setLocalSearch(search), [search]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setLocalMinPrice(minPrice), [minPrice]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setLocalMaxPrice(maxPrice), [maxPrice]);

  const hasActiveFilters = sort !== "newest" || status !== "all" || search !== "" || minPrice !== "" || maxPrice !== "";

  return (
    <div className={`transition-opacity duration-200 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Tìm theo tiêu đề..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="h-9 rounded-xl border-slate-200 pl-9 text-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/30"
          />
        </div>
        <select value={status} onChange={(e) => update("status", e.target.value)} className={selectClass}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 shrink-0 text-slate-400" />
          <select value={sort} onChange={(e) => update("sort", e.target.value)} className={selectClass}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {/* Price range */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
          <div className="flex items-center gap-1.5">
            <PriceInput
              placeholder="Giá từ"
              value={localMinPrice}
              onChange={setLocalMinPrice}
              accent="amber"
              className="h-9 rounded-xl border-slate-200 px-3 text-sm text-slate-700 focus-visible:border-amber-400 focus-visible:ring-amber-400/30 w-24 sm:w-28"
            />
            <span className="text-sm text-slate-400">—</span>
            <PriceInput
              placeholder="đến"
              value={localMaxPrice}
              onChange={setLocalMaxPrice}
              accent="amber"
              className="h-9 rounded-xl border-slate-200 px-3 text-sm text-slate-700 focus-visible:border-amber-400 focus-visible:ring-amber-400/30 w-24 sm:w-28"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={() => { setLocalSearch(""); setLocalMinPrice(""); setLocalMaxPrice(""); startTransition(() => router.replace(pathname, { scroll: false })); }}
            className="h-9 rounded-xl border-rose-200 bg-rose-50 px-3 text-sm text-rose-600 hover:bg-rose-100 hover:border-rose-300">
            Xoá bộ lọc
          </Button>
        )}
        <span className="ml-auto text-sm text-slate-400">
          {isPending ? "Đang lọc..." : `${totalCount} tài khoản`}
        </span>
      </div>
    </div>
  );
}
