"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Read current URL params
  const currentSearch = searchParams.get("q") ?? "";
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";
  const currentSort = searchParams.get("sort") ?? "newest";
  const currentClone = searchParams.get("clone") === "1";
  const currentServer = searchParams.get("server") ?? "";
  const currentMinStrength = searchParams.get("minStrength") ?? "";
  const currentMinGp = searchParams.get("minGp") ?? "";

  // Local state for all inputs
  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [localMinPrice, setLocalMinPrice] = useState(currentMinPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(currentMaxPrice);
  const [localSort, setLocalSort] = useState(currentSort);
  const [localClone, setLocalClone] = useState(currentClone);
  const [localServer, setLocalServer] = useState(currentServer);
  const [localMinStrength, setLocalMinStrength] = useState(currentMinStrength);
  const [localMinGp, setLocalMinGp] = useState(currentMinGp);

  // Derive dynamic server list
  const dynamicServers =
    serverRegions && serverRegions.length > 0
      ? [
          { value: "", label: "Tất cả server" },
          ...serverRegions.map((s) => ({ value: s, label: s })),
        ]
      : SERVER_REGIONS;

  // Auto-expand advanced filters if any advanced param is active
  useEffect(() => {
    if (currentServer || currentMinStrength || currentMinGp)
      setShowAdvanced(true);
  }, [currentServer, currentMinStrength, currentMinGp]);

  // Sync local state when URL params change
  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);
  useEffect(() => {
    setLocalMinPrice(currentMinPrice);
  }, [currentMinPrice]);
  useEffect(() => {
    setLocalMaxPrice(currentMaxPrice);
  }, [currentMaxPrice]);
  useEffect(() => {
    setLocalSort(currentSort);
  }, [currentSort]);
  useEffect(() => {
    setLocalClone(currentClone);
  }, [currentClone]);
  useEffect(() => {
    setLocalServer(currentServer);
  }, [currentServer]);
  useEffect(() => {
    setLocalMinStrength(currentMinStrength);
  }, [currentMinStrength]);
  useEffect(() => {
    setLocalMinGp(currentMinGp);
  }, [currentMinGp]);

  // Apply all filters at once
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (localSearch) params.set("q", localSearch);
    if (localMinPrice) params.set("minPrice", localMinPrice);
    if (localMaxPrice) params.set("maxPrice", localMaxPrice);
    if (localSort !== "newest") params.set("sort", localSort);
    if (localClone) params.set("clone", "1");
    if (localServer) params.set("server", localServer);
    if (localMinStrength) params.set("minStrength", localMinStrength);
    if (localMinGp) params.set("minGp", localMinGp);

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }, [
    router,
    pathname,
    localSearch,
    localMinPrice,
    localMaxPrice,
    localSort,
    localClone,
    localServer,
    localMinStrength,
    localMinGp,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applyFilters();
  };

  const clearAll = () => {
    setLocalSearch("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setLocalSort("newest");
    setLocalClone(false);
    setLocalServer("");
    setLocalMinStrength("");
    setLocalMinGp("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const hasActiveFilters =
    currentSearch !== "" ||
    currentMinPrice !== "" ||
    currentMaxPrice !== "" ||
    currentSort !== "newest" ||
    currentClone ||
    currentServer !== "" ||
    currentMinStrength !== "" ||
    currentMinGp !== "";

  const advancedFilterCount = [
    currentServer,
    currentMinStrength,
    currentMinGp,
  ].filter(Boolean).length;

  const hasUnsavedChanges =
    localSearch !== currentSearch ||
    localMinPrice !== currentMinPrice ||
    localMaxPrice !== currentMaxPrice ||
    localSort !== currentSort ||
    localClone !== currentClone ||
    localServer !== currentServer ||
    localMinStrength !== currentMinStrength ||
    localMinGp !== currentMinGp;

  return (
    <div
      className={`transition-opacity duration-200 ${isPending ? "pointer-events-none opacity-60" : "opacity-100"}`}
    >
      {/* ── Desktop: single row ── */}
      <div className="hidden items-center gap-2 md:flex">
        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm tài khoản..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9 w-full rounded-lg border-slate-200 pl-9 pr-3 text-sm text-slate-700 shadow-sm transition-all focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-3 w-3 -translate-y-1/2 text-slate-400" />
          <Select
            value={localSort}
            onValueChange={(val) => {
              if (val !== null) setLocalSort(val);
            }}
          >
            <SelectTrigger className="h-9 rounded-lg border-slate-200 bg-white pl-7 pr-2 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <SelectValue>
                {SORT_OPTIONS.find((o) => o.value === localSort)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clone */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocalClone(!localClone)}
          className={`h-9 shrink-0 rounded-lg px-3 text-xs font-medium shadow-sm transition-all ${
            localClone
              ? "border-violet-400 bg-violet-500 text-white hover:border-violet-500 hover:bg-violet-600"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          }`}
        >
          <Copy className="mr-1 h-3.5 w-3.5" />
          Clone
        </Button>

        {/* Price range */}
        <div className="flex h-9 w-56 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <PriceInput
            placeholder="Giá từ"
            value={localMinPrice}
            onChange={setLocalMinPrice}
            className="h-8 w-full min-w-0 border-0 bg-transparent px-0 text-xs text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          <span className="shrink-0 text-[10px] text-slate-300 dark:text-slate-600">
            —
          </span>
          <PriceInput
            placeholder="đến"
            value={localMaxPrice}
            onChange={setLocalMaxPrice}
            className="h-8 w-full min-w-0 border-0 bg-transparent px-0 text-xs text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Advanced Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`h-9 shrink-0 rounded-lg px-3 text-xs font-medium shadow-sm transition-all ${
            showAdvanced || advancedFilterCount > 0
              ? "border-indigo-400 bg-indigo-500 text-white hover:border-indigo-500 hover:bg-indigo-600"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          }`}
        >
          <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />
          Lọc
          {advancedFilterCount > 0 && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
              {advancedFilterCount}
            </span>
          )}
          <ChevronDown
            className={`ml-0.5 h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          />
        </Button>

        {/* Apply */}
        <Button
          size="sm"
          onClick={applyFilters}
          disabled={!hasUnsavedChanges}
          className="h-9 shrink-0 rounded-lg bg-indigo-600 px-4 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40"
        >
          <Search className="mr-1.5 h-3.5 w-3.5" />
          Tìm
        </Button>
      </div>

      {/* ── Mobile: stacked rows ── */}
      <div className="flex flex-col gap-1.5 md:hidden">
        {/* Search + Clone */}
        <div className="flex items-center gap-1.5">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm tài khoản..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 w-full rounded-lg border-slate-200 pl-9 pr-3 text-sm text-slate-700 shadow-sm transition-all focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocalClone(!localClone)}
            className={`h-9 shrink-0 rounded-lg px-2.5 text-xs font-medium shadow-sm transition-all ${
              localClone
                ? "border-violet-400 bg-violet-500 text-white hover:border-violet-500 hover:bg-violet-600"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            }`}
          >
            <Copy className="mr-1 h-3 w-3" />
            Clone
          </Button>
        </div>

        {/* Sort | Price range | Filter toggle */}
        <div className="flex items-center gap-1.5">
          <div className="relative shrink-0">
            <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-3 w-3 -translate-y-1/2 text-slate-400" />
            <Select
              value={localSort}
              onValueChange={(val) => {
                if (val !== null) setLocalSort(val);
              }}
            >
              <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-white pl-7 pr-2 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <SelectValue>
                  {SORT_OPTIONS.find((o) => o.value === localSort)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex h-8 min-w-0 flex-1 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <PriceInput
              placeholder="Giá từ"
              value={localMinPrice}
              onChange={setLocalMinPrice}
              className="h-7 w-full min-w-0 border-0 bg-transparent px-0 text-xs text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            <span className="shrink-0 text-[10px] text-slate-300 dark:text-slate-600">
              —
            </span>
            <PriceInput
              placeholder="đến"
              value={localMaxPrice}
              onChange={setLocalMaxPrice}
              className="h-7 w-full min-w-0 border-0 bg-transparent px-0 text-xs text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`h-8 shrink-0 rounded-lg px-2.5 text-xs font-medium shadow-sm transition-all ${
              showAdvanced || advancedFilterCount > 0
                ? "border-indigo-400 bg-indigo-500 text-white hover:border-indigo-500 hover:bg-indigo-600"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            }`}
          >
            <SlidersHorizontal className="mr-1 h-3 w-3" />
            Lọc
            {advancedFilterCount > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                {advancedFilterCount}
              </span>
            )}
            <ChevronDown
              className={`ml-0.5 h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm duration-200 dark:border-slate-700 dark:bg-slate-800">
          <div className="grid grid-cols-2 gap-2.5 md:flex md:flex-wrap md:items-end md:gap-4">
            {/* Server Region */}
            <div className="flex flex-col gap-1 md:min-w-[150px]">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <Globe className="h-3 w-3" /> Server
              </label>
              <Select
                value={localServer || "__all__"}
                onValueChange={(val) => {
                  if (val !== null)
                    setLocalServer(val === "__all__" ? "" : val);
                }}
              >
                <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <SelectValue>
                    {
                      dynamicServers.find(
                        (s) =>
                          (s.value || "__all__") ===
                          (localServer || "__all__"),
                      )?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {dynamicServers.map((s) => (
                    <SelectItem
                      key={s.value || "__all__"}
                      value={s.value || "__all__"}
                    >
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Strength */}
            <div className="flex flex-col gap-1 md:min-w-[150px]">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <Shield className="h-3 w-3" /> Lực chiến
              </label>
              <Select
                value={localMinStrength || "__all__"}
                onValueChange={(val) => {
                  if (val !== null)
                    setLocalMinStrength(val === "__all__" ? "" : val);
                }}
              >
                <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <SelectValue>
                    {
                      TEAM_STRENGTH_PRESETS.find(
                        (s) =>
                          (s.value || "__all__") ===
                          (localMinStrength || "__all__"),
                      )?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TEAM_STRENGTH_PRESETS.map((s) => (
                    <SelectItem
                      key={s.value || "__all__"}
                      value={s.value || "__all__"}
                    >
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min GP */}
            <div className="flex flex-col gap-1 md:min-w-[130px]">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <Zap className="h-3 w-3" /> GP tối thiểu
              </label>
              <Input
                type="number"
                placeholder="VD: 50000"
                value={localMinGp}
                min={0}
                onChange={(e) => setLocalMinGp(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 rounded-lg border-slate-200 bg-slate-50 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar: Count + Clear + Apply (mobile only, desktop has Apply inline) */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {isPending ? "Đang lọc..." : `${totalCount} tài khoản`}
        </span>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <X className="h-3 w-3" />
            Xoá lọc
          </button>
        )}

        <Button
          size="sm"
          onClick={applyFilters}
          disabled={!hasUnsavedChanges}
          className="ml-auto h-8 shrink-0 rounded-lg bg-indigo-600 px-4 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40 md:hidden"
        >
          <Search className="mr-1.5 h-3.5 w-3.5" />
          Tìm
        </Button>
      </div>
    </div>
  );
}
