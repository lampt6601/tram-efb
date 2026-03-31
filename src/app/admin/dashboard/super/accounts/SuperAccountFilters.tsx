"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { ArrowUpDown, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PriceInput } from "@/components/ui/price-input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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

  // Sync local state when URL params change
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
            onKeyDown={handleKeyDown}
            className="h-10 w-full rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 pl-10 pr-4 text-sm text-slate-700 shadow-sm transition-all focus-visible:border-amber-400 focus-visible:ring-4 focus-visible:ring-amber-400/20"
          />
        </div>

        {/* Status + Approval + Sort + Apply + Clear */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status */}
          <div className="flex flex-1 md:flex-none items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            <Select value={localStatus} onValueChange={(val) => { if (val !== null) setLocalStatus(val) }}>
              <SelectTrigger className="border-0 h-9 rounded-xl bg-transparent text-sm text-slate-700 dark:text-slate-200 w-full px-2.5">
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

          {/* Approval toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocalApproval(localApproval === "pending" ? "all" : "pending")}
            className={`h-9 shrink-0 rounded-xl px-3 text-sm font-medium transition-all shadow-sm ${
              localApproval === "pending"
                ? "border-amber-400 bg-amber-500 text-white hover:bg-amber-600 hover:border-amber-500"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Cần duyệt
          </Button>

          {/* Sort */}
          <div className="flex flex-1 md:flex-none items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 shadow-sm">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 mr-1.5" />
            <Select value={localSort} onValueChange={(val) => { if (val !== null) setLocalSort(val) }}>
              <SelectTrigger className="border-0 h-9 rounded-xl bg-transparent text-sm text-slate-700 dark:text-slate-200 w-full px-0">
                <SelectValue>{SORT_OPTIONS.find((o) => o.value === localSort)?.label}</SelectValue>
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

        {/* Price range + Apply + count */}
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

          {/* Apply button */}
          <Button
            size="sm"
            onClick={applyFilters}
            disabled={!hasUnsavedChanges}
            className="h-9 shrink-0 rounded-xl bg-amber-600 px-4 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-40 shadow-sm"
          >
            <Search className="mr-1 h-3.5 w-3.5" />
            Lọc
          </Button>

          <span className="ml-auto shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
            {isPending ? "Đang lọc..." : `${totalCount} tài khoản`}
          </span>
        </div>
      </div>
    </div>
  );
}
