"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const TIERS = [
  { label: "Ngày đầu", rate: "80%" },
  { label: "Từ 1–10 ngày", rate: "70%" },
  { label: "Từ 11–20 ngày", rate: "65%" },
  { label: "Từ 21 ngày trở đi", rate: "60%" },
];

/** Shared tier list + CTA — reused by both collapsible and inline variants */
export function BuybackPolicyContent({ tierBg = "bg-slate-50 dark:bg-slate-800/50" }: { tierBg?: string }) {
  return (
    <>
      <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">
        Mức thu lại tính theo giá bán:
      </p>
      <div className="space-y-1">
        {TIERS.map((tier) => (
          <div
            key={tier.label}
            className={cn("flex items-center justify-between rounded-lg px-3 py-1.5", tierBg)}
          >
            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              {tier.label}
            </span>
            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">
              {tier.rate}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-500/10">
        <MessageCircle className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
        <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
          Liên hệ Chủ Shop để được hỗ trợ thu lại acc
        </span>
      </div>
    </>
  );
}

/** Collapsible variant — used on account detail page */
export function BuybackPolicy() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-3 rounded-xl border border-slate-200 dark:border-slate-700">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Chính sách thu lại acc
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-200 dark:text-slate-500",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-4 pb-3 pt-2.5 dark:border-slate-700">
            <BuybackPolicyContent />
          </div>
        </div>
      </div>
    </div>
  );
}
