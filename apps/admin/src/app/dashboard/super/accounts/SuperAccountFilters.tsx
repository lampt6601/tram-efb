"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { ArrowUpDown, Search, X } from "lucide-react";
import { Input } from "@thc-efb/ui/input";
import { Button } from "@thc-efb/ui/button";
import { PriceInput } from "@thc-efb/ui/price-input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@thc-efb/ui/select";

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

  const currentSort = searchParams.get("sort") ?? "newest";
  const currentStatus = searchParams.get("status") ?? "Available";
  const currentApproval = searchParams.get("approval") ?? "all";
  const currentSearch = searchParams.get("q") ?? "";
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";

  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [localMinPrice, setLocalMinPrice] = useState(currentMinPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(currentMaxPrice);
  const [localSort, setLocalSort] = useState(currentSort);
  const [localStatus, setLocalStatus] = useState(currentStatus);
  const [localApproval, setLocalApproval] = useState(currentApproval);

  useEffect(() => { setLocalSearch(currentSearch); }, [currentSearch]);
  useEffect(() => { setLocalMinPrice(currentMinPrice); }, [currentMinPrice]);
  useEffect(() => { setLocalMaxPrice(currentMaxPrice); }, [currentMaxPrice]);
  useEffect(() => { setLocalSort(currentSort); }, [currentSort]);
  useEffect(() => { setLocalStatus(currentStatus); }, [currentStatus]);
  useEffect(() => { setLocalApproval(currentApproval); }, [currentApproval]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (localSearch) params.set("q", localSearch);
    if (localMinPrice) params.set("minPrice", localMinPrice);
    if (localMaxPrice) params.set("maxPrice", localMaxPrice);
    if (localSort !== "newest") params.set("sort", localSort);
    if (localStatus !== "Available") params.set("status", localStatus);
    if (localApproval !== "all") params.set("approval", localApproval);

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }, [router, pathname, localSearch, localMinPrice, localMaxPrice, localSort, localStatus, localApproval]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applyFilters();
  };

  const hasActiveFilters =
    currentSort !== "newest" || currentStatus !== "Available" || currentApproval !== "all" ||
    currentSearch !== "" || currentMinPrice !== "" || currentMaxPrice !== "";

  const hasUnsavedChanges =
    localSearch !== currentSearch || localMinPrice !== currentMinPrice ||
    localMaxPrice !== currentMaxPrice || localSort !== currentSort ||
    localStatus !== currentStatus || localApproval !== currentApproval;

  const clearAll = () => {
    setLocalSearch("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setLocalSort("newest");
    setLocalStatus("Available");
    setLocalApproval("all");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <div className={`transition-opacity duration-200 ${isPending ? "pointer-events-none opacity-60" : "opacity-100"}`}>
      {/* Single flex-wrap container — row wrappers dissolve on desktop via md:contents */}
      <div className="flex flex-wrap items-center gap-1.5 md:flex-nowrap md:gap-2">
        {/* Mobile row 1: Search + Cần duyệt | Desktop: inline */}
        <div className="flex w-full items-center gap-1.5 md:contents">
          <div className="relative min-w-0 flex-1 md:min-w-48">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm theo tiêu đề..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ paddingLeft: '2.25rem' }}
              className="h-9 w-full rounded-lg border-slate-200 pr-3 text-sm text-slate-700 shadow-sm transition-all focus-visible:border-amber-400 focus-visible:ring-4 focus-visible:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocalApproval(localApproval === "pending" ? "all" : "pending")}
            className={`h-9 shrink-0 rounded-lg px-2.5 text-xs font-medium shadow-sm transition-all md:px-3 ${
              localApproval === "pending"
                ? "border-amber-400 bg-amber-500 text-white hover:border-amber-500 hover:bg-amber-600"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            }`}
          >
            Cần duyệt
          </Button>
        </div>

        {/* Mobile row 2: Status + Sort + Price | Desktop: inline */}
        <div className="flex w-full items-center gap-1.5 md:contents">
          <div className="shrink-0">
            <Select value={localStatus} onValueChange={(val) => { if (val !== null) setLocalStatus(val) }}>
              <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-white text-xs text-slate-700 shadow-sm md:h-9 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <SelectValue>{STATUS_OPTIONS.find((o) => o.value === localStatus)?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="shrink-0">
            <Select value={localSort} onValueChange={(val) => { if (val !== null) setLocalSort(val) }}>
              <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-white text-xs text-slate-700 shadow-sm md:h-9 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <SelectValue>
                  <ArrowUpDown className="h-3 w-3 shrink-0 text-slate-400" />
                  {SORT_OPTIONS.find((o) => o.value === localSort)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex h-8 min-w-0 flex-1 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 shadow-sm md:h-9 md:w-56 md:flex-none md:px-2.5 dark:border-slate-700 dark:bg-slate-800">
            <PriceInput
              placeholder="Giá từ"
              value={localMinPrice}
              onChange={setLocalMinPrice}
              accent="amber"
              className="h-7 w-full min-w-0 border-0 bg-transparent px-0 text-xs text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            <span className="shrink-0 text-[10px] text-slate-300 dark:text-slate-600">—</span>
            <PriceInput
              placeholder="đến"
              value={localMaxPrice}
              onChange={setLocalMaxPrice}
              accent="amber"
              className="h-7 w-full min-w-0 border-0 bg-transparent px-0 text-xs text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Apply - always visible; bottom bar has duplicate for mobile with md:hidden */}
        <Button
          size="sm"
          onClick={applyFilters}
          disabled={!hasUnsavedChanges}
          className="h-8 shrink-0 rounded-lg bg-amber-600 px-4 text-xs font-medium text-white shadow-sm hover:bg-amber-700 disabled:opacity-40 md:h-9"
        >
          <Search className="mr-1.5 h-3.5 w-3.5" />
          Lọc
        </Button>
      </div>

      {/* Bottom bar: Count + Clear + Apply (mobile) */}
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

      </div>
    </div>
  );
}
