"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  SlidersHorizontal,
  Search,
  Copy,
  ArrowUpDown,
  Globe,
  Shield,
  Zap,
  ChevronDown,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PriceInput } from "@/components/ui/price-input";

const SEARCH_DEBOUNCE_MS = 600;

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "strength_desc", label: "Lực chiến cao" },
  { value: "gp_desc", label: "GP cao nhất" },
];

const SERVER_REGIONS = [
  { value: "", label: "Tất cả server" },
  { value: "Japan", label: "Japan" },
  { value: "Other", label: "Other" },
  { value: "Morocco", label: "Morocco" },
  { value: "Thailand", label: "Thailand" },
  { value: "Indonesia", label: "Indonesia" },
];

const TEAM_STRENGTH_PRESETS = [
  { value: "", label: "Tất cả" },
  { value: "3000", label: "≥ 3,000" },
  { value: "4000", label: "≥ 4,000" },
  { value: "5000", label: "≥ 5,000" },
  { value: "6000", label: "≥ 6,000" },
  { value: "7000", label: "≥ 7,000" },
];

export function AccountFilters({
  totalCount,
  serverRegions,
}: {
  totalCount: number;
  serverRegions?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const search = searchParams.get("q") ?? "";
  const cloneOnly = searchParams.get("clone") === "1";
  const sort = searchParams.get("sort") ?? "newest";
  const server = searchParams.get("server") ?? "";
  const minStrength = searchParams.get("minStrength") ?? "";
  const minGp = searchParams.get("minGp") ?? "";

  const [localSearch, setLocalSearch] = useState(search);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const debouncedSearch = useDebounce(localSearch, SEARCH_DEBOUNCE_MS);
  const debouncedMinPrice = useDebounce(localMinPrice, 2500);
  const debouncedMaxPrice = useDebounce(localMaxPrice, 2500);

  // Derive dynamic server list from props (fallback to static list)
  const dynamicServers = serverRegions && serverRegions.length > 0
    ? [{ value: "", label: "Tất cả server" }, ...serverRegions.map((s) => ({ value: s, label: s }))]
    : SERVER_REGIONS;

  // Auto-expand advanced filters if any advanced param is active
  useEffect(() => {
    if (server || minStrength || minGp) setShowAdvanced(true);
  }, [server, minStrength, minGp]);

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

  const updateMultiple = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
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
  const lastDebouncedPrices = useRef({
    min: debouncedMinPrice,
    max: debouncedMaxPrice,
  });

  useEffect(() => {
    if (debouncedSearch !== lastDebouncedSearch.current) {
      lastDebouncedSearch.current = debouncedSearch;
      if (debouncedSearch !== search) update("q", debouncedSearch);
    }
  }, [debouncedSearch, search, update]);

  useEffect(() => {
    const hasChanged =
      debouncedMinPrice !== lastDebouncedPrices.current.min ||
      debouncedMaxPrice !== lastDebouncedPrices.current.max;

    if (hasChanged) {
      lastDebouncedPrices.current = {
        min: debouncedMinPrice,
        max: debouncedMaxPrice,
      };
      if (debouncedMinPrice !== minPrice || debouncedMaxPrice !== maxPrice) {
        updatePrices(debouncedMinPrice, debouncedMaxPrice);
      }
    }
  }, [debouncedMinPrice, debouncedMaxPrice, minPrice, maxPrice, updatePrices]);

  useEffect(() => {
    if (!isSearchFocused) setLocalSearch(search);
  }, [search, isSearchFocused]);

  useEffect(() => {
    setLocalMinPrice(minPrice);
  }, [minPrice]);
  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  const hasActiveFilters =
    minPrice !== "" ||
    maxPrice !== "" ||
    search !== "" ||
    cloneOnly ||
    sort !== "newest" ||
    server !== "" ||
    minStrength !== "" ||
    minGp !== "";

  const advancedFilterCount = [server, minStrength, minGp].filter(Boolean).length;

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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder="Tìm kiếm tài khoản..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="h-10 w-full rounded-xl border-slate-200 pl-10 pr-4 text-sm text-slate-700 shadow-sm transition-all focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-400/20"
          />
        </div>

        {/* Mobile: Sort + Clone + Advanced + Clear in one row */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Sort */}
          <div className="flex flex-1 md:flex-none items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 shadow-sm">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
              className="h-9 w-full bg-transparent text-sm text-slate-700 outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clone */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleClone}
            className={`h-9 shrink-0 rounded-xl px-3 text-sm font-medium transition-all shadow-sm ${
              cloneOnly
                ? "border-violet-400 bg-violet-500 text-white hover:bg-violet-600 hover:border-violet-500"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Copy className="mr-1 h-3.5 w-3.5" />
            Clone
          </Button>

          {/* Advanced Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`h-9 shrink-0 rounded-xl px-3 text-sm font-medium transition-all shadow-sm ${
              showAdvanced || advancedFilterCount > 0
                ? "border-indigo-400 bg-indigo-500 text-white hover:bg-indigo-600 hover:border-indigo-500"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />
            Lọc
            {advancedFilterCount > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                {advancedFilterCount}
              </span>
            )}
            <ChevronDown className={`ml-0.5 h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          </Button>

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

        {/* Mobile: Price range + count in one row */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 pl-2.5 shadow-sm">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <PriceInput
              placeholder="Giá từ"
              value={localMinPrice}
              onChange={setLocalMinPrice}
              className="h-7 w-[4.5rem] md:w-24 border-0 bg-transparent px-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 shadow-none"
            />
            <span className="text-xs text-slate-300">—</span>
            <PriceInput
              placeholder="đến"
              value={localMaxPrice}
              onChange={setLocalMaxPrice}
              className="h-7 w-[4.5rem] md:w-24 border-0 bg-transparent px-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 shadow-none"
            />
          </div>

          <span className="ml-auto shrink-0 text-sm font-medium text-slate-500">
            {isPending ? "Đang lọc..." : `${totalCount} tài khoản`}
          </span>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
            {/* Server Region */}
            <div className="flex flex-col gap-1 sm:min-w-[160px]">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Globe className="h-3 w-3" /> Server
              </label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2.5">
                <select
                  value={server}
                  onChange={(e) => update("server", e.target.value)}
                  className="h-8 w-full bg-transparent text-sm text-slate-700 outline-none cursor-pointer"
                >
                  {dynamicServers.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Team Strength */}
            <div className="flex flex-col gap-1 sm:min-w-[160px]">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Shield className="h-3 w-3" /> Lực chiến tối thiểu
              </label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2.5">
                <select
                  value={minStrength}
                  onChange={(e) => update("minStrength", e.target.value)}
                  className="h-8 w-full bg-transparent text-sm text-slate-700 outline-none cursor-pointer"
                >
                  {TEAM_STRENGTH_PRESETS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Min GP */}
            <div className="flex flex-col gap-1 sm:min-w-[140px]">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Zap className="h-3 w-3" /> GP tối thiểu
              </label>
              <Input
                type="number"
                placeholder="VD: 50000"
                value={minGp}
                min={0}
                onChange={(e) => update("minGp", e.target.value)}
                className="h-8 rounded-lg border-slate-200 text-sm text-slate-700"
              />
            </div>

            {/* Clear advanced filters */}
            {advancedFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateMultiple({ server: "", minStrength: "", minGp: "" })
                }
                className="h-8 shrink-0 gap-1 px-2.5 text-xs text-slate-500 hover:text-slate-700"
              >
                <X className="h-3 w-3" />
                Xoá bộ lọc nâng cao
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
