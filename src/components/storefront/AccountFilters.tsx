"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { SlidersHorizontal, Search, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-9 rounded-xl border-slate-200 px-3 text-sm text-slate-700 focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30";

export function AccountFilters({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const search = searchParams.get("q") ?? "";
  const cloneOnly = searchParams.get("clone") === "1";

  const [localSearch, setLocalSearch] = useState(search);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const debouncedSearch = useDebounce(localSearch, 500);
  const debouncedMinPrice = useDebounce(localMinPrice, 600);
  const debouncedMaxPrice = useDebounce(localMaxPrice, 600);

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
  const lastDebouncedMin = useRef(debouncedMinPrice);
  const lastDebouncedMax = useRef(debouncedMaxPrice);

  useEffect(() => {
    if (debouncedSearch !== lastDebouncedSearch.current) {
      lastDebouncedSearch.current = debouncedSearch;
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

  useEffect(() => { setLocalSearch(search); }, [search]);
  useEffect(() => { setLocalMinPrice(minPrice); }, [minPrice]);
  useEffect(() => { setLocalMaxPrice(maxPrice); }, [maxPrice]);

  const hasActiveFilters = minPrice !== "" || maxPrice !== "" || search !== "" || cloneOnly;

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

        {/* Clone filter toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleClone}
          className={`h-9 rounded-xl px-3 text-sm font-medium transition-colors ${
            cloneOnly
              ? "border-violet-400 bg-violet-500 text-white hover:bg-violet-600 hover:border-violet-500"
              : "border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 hover:border-violet-300"
          }`}
        >
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Clone
        </Button>

        {/* Price range */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              placeholder="Giá từ"
              value={localMinPrice}
              min={0}
              step={1}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className={`${inputClass} w-24 sm:w-28`}
            />
            <span className="text-sm text-slate-400">—</span>
            <Input
              type="number"
              placeholder="đến"
              value={localMaxPrice}
              min={0}
              step={1}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
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
