"use client";

import { ArrowUpDown, Search, X } from "lucide-react";
import { Input } from "@thc-efb/ui/input";
import { Button } from "@thc-efb/ui/button";
import { PriceInput } from "@thc-efb/ui/price-input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@thc-efb/ui/select";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { ACCOUNT_SORT_OPTIONS, ACCOUNT_STATUS_OPTIONS } from "@/lib/filter-options";
import { useMemo } from "react";

const BASE_FILTER_FIELDS = [
  { key: "q", defaultValue: "" },
  { key: "minPrice", defaultValue: "" },
  { key: "maxPrice", defaultValue: "" },
  { key: "sort", defaultValue: "newest" },
  { key: "status", defaultValue: "Available" },
  { key: "approval", defaultValue: "all" },
];

type AdminOption = { id: string; name: string };

export function SuperAccountFilters({
  totalCount,
  admins,
}: {
  totalCount: number;
  admins?: AdminOption[];
}) {
  const filterFields = useMemo(
    () =>
      admins
        ? [...BASE_FILTER_FIELDS, { key: "admin", defaultValue: "all" }]
        : BASE_FILTER_FIELDS,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [!!admins],
  );

  const {
    values,
    setValue,
    applyFilters,
    clearAll,
    handleKeyDown,
    hasActiveFilters,
    hasUnsavedChanges,
    isPending,
  } = useUrlFilters(filterFields);

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
              value={values.q}
              onChange={(e) => setValue("q", e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ paddingLeft: '2.25rem' }}
              className="h-9 w-full rounded-lg border-slate-200 pr-3 text-sm text-slate-700 shadow-sm transition-all focus-visible:border-amber-400 focus-visible:ring-4 focus-visible:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setValue("approval", values.approval === "pending" ? "all" : "pending")}
            className={`h-9 shrink-0 rounded-lg px-2.5 text-xs font-medium shadow-sm transition-all md:px-3 ${
              values.approval === "pending"
                ? "border-amber-400 bg-amber-500 text-white hover:border-amber-500 hover:bg-amber-600"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            }`}
          >
            Cần duyệt
          </Button>
        </div>

        {/* Mobile row 2: Admin (conditional) + Status + Sort + Price | Desktop: inline */}
        <div className="flex w-full items-center gap-1.5 md:contents">
          {admins && (
            <div className="shrink-0">
              <Select value={values.admin ?? "all"} onValueChange={(val) => { if (val !== null) setValue("admin", val) }}>
                <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-white text-xs text-slate-700 shadow-sm md:h-9 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <SelectValue>
                    {values.admin && values.admin !== "all"
                      ? admins.find((a) => a.id === values.admin)?.name ?? "Admin"
                      : "Tất cả admin"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả admin</SelectItem>
                  {admins.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="shrink-0">
            <Select value={values.status} onValueChange={(val) => { if (val !== null) setValue("status", val) }}>
              <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-white text-xs text-slate-700 shadow-sm md:h-9 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <SelectValue>{ACCOUNT_STATUS_OPTIONS.find((o) => o.value === values.status)?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="shrink-0">
            <Select value={values.sort} onValueChange={(val) => { if (val !== null) setValue("sort", val) }}>
              <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-white text-xs text-slate-700 shadow-sm md:h-9 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <SelectValue>
                  <ArrowUpDown className="h-3 w-3 shrink-0 text-slate-400" />
                  {ACCOUNT_SORT_OPTIONS.find((o) => o.value === values.sort)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden sm:flex h-8 min-w-0 flex-1 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 shadow-sm md:h-9 md:w-56 md:flex-none md:px-2.5 dark:border-slate-700 dark:bg-slate-800">
            <PriceInput
              placeholder="Giá từ"
              value={values.minPrice}
              onChange={(v) => setValue("minPrice", v)}
              accent="amber"
              className="h-7 w-full min-w-0 border-0 bg-transparent px-0 text-xs text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            <span className="shrink-0 text-[10px] text-slate-300 dark:text-slate-600">—</span>
            <PriceInput
              placeholder="đến"
              value={values.maxPrice}
              onChange={(v) => setValue("maxPrice", v)}
              accent="amber"
              className="h-7 w-full min-w-0 border-0 bg-transparent px-0 text-xs text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:ring-0 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Apply - always visible */}
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

      {/* Bottom bar: Count + Clear */}
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
