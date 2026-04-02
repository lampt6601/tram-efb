"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Currency input that works in "k" (thousands).
 *
 * - User types `130` → stored value = `130000`
 * - Displays a "k" suffix inside the input
 * - step defaults to 1 (= 1k increments)
 * - `value` and `onChange` operate in **raw VNĐ** (e.g. 130000)
 */

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  /** Raw value in VNĐ (e.g. 130000). Pass "" for empty. */
  value: string | number;
  /** Called with raw VNĐ string (e.g. "130000"). Empty string when cleared. */
  onChange: (rawValue: string) => void;
  /** Suffix label. Defaults to "k" */
  suffix?: string;
}

function toK(raw: string | number): string {
  if (raw === "" || raw == null) return "";
  const n = Number(raw);
  if (isNaN(n) || n === 0) return "";
  return String(Math.round(n / 1000));
}

function toRaw(k: string): string {
  if (k === "" || k === "-") return "";
  const n = Number(k);
  if (isNaN(n)) return "";
  return String(Math.round(n * 1000));
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, suffix = "k", className, onWheel, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() => toK(value));

    // Sync from external value changes (e.g. form reset, default values)
    React.useEffect(() => {
      const newK = toK(value);
      setDisplayValue((prev) => {
        // Don't override while user is actively typing
        if (toRaw(prev) === String(value)) return prev;
        return newK;
      });
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const k = e.target.value;
      setDisplayValue(k);
      onChange(toRaw(k));
    };

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      e.currentTarget.blur();
      onWheel?.(e);
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type="number"
          value={displayValue}
          onChange={handleChange}
          onWheel={handleWheel}
          className={cn(
            "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 pr-7 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]",
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 dark:text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";
