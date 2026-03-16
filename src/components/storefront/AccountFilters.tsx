"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { SlidersHorizontal, Search, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PriceInput } from "@/components/ui/price-input";

/** Chỉ tìm kiếm sau khi user dừng gõ (ms). */
const SEARCH_DEBOUNCE_MS = 600;

export function AccountFilters({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const search = searchParams.get("q") ?? "";
  const cloneOnly = searchParams.get("clone") === "1";

  const [localSearch, setLocalSearch] = useState(search);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const debouncedSearch = useDebounce(localSearch, SEARCH_DEBOUNCE_MS);
  const debouncedMinPrice = useDebounce(localMinPrice, 2500);
  const debouncedMaxPrice = useDebounce(localMaxPrice, 2500);

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

  const updatePrices = useCallback(
    (min: string, max: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (min) params.set("minPrice", min);
      else params.delete("minPrice");
      
      if (max) params.set("maxPrice", max);
      else params.delete("maxPrice");
      
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  const toggleClone = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (cloneOnly) {
      params.delete("clone");
    } else {
      params.set("clone", "1");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const lastDebouncedSearch = useRef(debouncedSearch);
  const lastDebouncedPrices = useRef({ min: debouncedMinPrice, max: debouncedMaxPrice });

  useEffect(() => {
    if (debouncedSearch !== lastDebouncedSearch.current) {
      lastDebouncedSearch.current = debouncedSearch;
      if (debouncedSearch !== search) update("q", debouncedSearch);
    }
  }, [debouncedSearch, search, update]);

  // Handle prices together to prevent fetching when only one is typed but the other is being typed
  useEffect(() => {
    const hasChanged = 
      debouncedMinPrice !== lastDebouncedPrices.current.min || 
      debouncedMaxPrice !== lastDebouncedPrices.current.max;
      
    if (hasChanged) {
      lastDebouncedPrices.current = { min: debouncedMinPrice, max: debouncedMaxPrice };
      
      // Only update if they differ from URL state
      if (debouncedMinPrice !== minPrice || debouncedMaxPrice !== maxPrice) {
        updatePrices(debouncedMinPrice, debouncedMaxPrice);
      }
    }
  }, [debouncedMinPrice, debouncedMaxPrice, minPrice, maxPrice, updatePrices]);

  // Chỉ đồng bộ URL → ô tìm kiếm khi user không đang focus ô (tránh ghi đè chữ đang gõ).
  useEffect(() => {
    if (!isSearchFocused) setLocalSearch(search);
  }, [search, isSearchFocused]);

  useEffect(() => { setLocalMinPrice(minPrice); }, [minPrice]);
  useEffect(() => { setLocalMaxPrice(maxPrice); }, [maxPrice]);

  const hasActiveFilters = minPrice !== "" || maxPrice !== "" || search !== "" || cloneOnly;

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
      className={`transition-opacity duration-200 flex flex-col gap-3 md:gap-4 ${isPending ? "opacity-60 pointer-events-none" : "opacity-100"}`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        {/* Search - Full width on mobile, flexible on PC */}
        <div className="relative w-full md:max-w-xs md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder="Tìm kiếm tài khoản..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="h-11 md:h-10 w-full rounded-2xl md:rounded-xl border-slate-200 pl-10 pr-4 text-[15px] md:text-sm text-slate-700 shadow-sm transition-all focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-400/20"
          />
        </div>

        {/* Filters - Scrollable row on mobile, inline on PC */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide w-full md:w-auto">
          {/* Clone filter toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleClone}
            className={`h-9 md:h-10 shrink-0 rounded-xl md:rounded-xl px-3.5 text-sm font-medium transition-all shadow-sm ${
              cloneOnly
                ? "border-violet-400 bg-violet-500 text-white hover:bg-violet-600 hover:border-violet-500 hover:shadow-md"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Copy className="mr-1.5 h-4 w-4" />
            Clone
          </Button>

          {/* Price range */}
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 pl-3 shadow-sm transition-all hover:border-slate-300">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <div className="flex items-center gap-1">
              <PriceInput
                placeholder="Giá từ"
                value={localMinPrice}
                onChange={setLocalMinPrice}
                className="h-7 w-20 md:w-24 border-0 bg-transparent px-2 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 shadow-none"
              />
              <span className="text-sm text-slate-300">-</span>
              <PriceInput
                placeholder="đến"
                value={localMaxPrice}
                onChange={setLocalMaxPrice}
                className="h-7 w-20 md:w-24 border-0 bg-transparent px-2 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 shadow-none"
              />
            </div>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="h-9 md:h-10 shrink-0 rounded-xl border-rose-200 bg-rose-50 px-3.5 text-sm font-medium text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 shadow-sm"
            >
              Xoá lọc
            </Button>
          )}
        </div>
      </div>

      {/* Result count - Below filters */}
      <div className="text-sm font-medium text-slate-500 md:text-right px-1 md:px-0">
        {isPending ? "Đang lọc..." : `Hiển thị ${totalCount} tài khoản`}
      </div>
    </div>
  );
}
