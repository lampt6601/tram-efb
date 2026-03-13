"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";

const PRICE_SUGGESTIONS = [
  { label: "10k", value: 10_000 },
  { label: "100k", value: 100_000 },
  { label: "200k", value: 200_000 },
  { label: "300k", value: 300_000 },
  { label: "400k", value: 400_000 },
  { label: "500k", value: 500_000 },
  { label: "600k", value: 600_000 },
  { label: "700k", value: 700_000 },
  { label: "800k", value: 800_000 },
  { label: "900k", value: 900_000 },
  { label: "1M", value: 1_000_000 },
  { label: "3M", value: 3_000_000 },
  { label: "10M", value: 10_000_000 },
];

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Highlight color for selected suggestion. Defaults to indigo. */
  accent?: "indigo" | "amber";
}

export function PriceInput({
  value,
  onChange,
  placeholder,
  className,
  accent = "indigo",
}: PriceInputProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const updatePosition = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      zIndex: 9999,
    });
  };

  useEffect(() => {
    if (!open) return;
    const handleClose = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest("[data-price-dropdown]")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClose);
    return () => document.removeEventListener("mousedown", handleClose);
  }, [open]);

  const accentSelected =
    accent === "amber"
      ? "bg-amber-50 text-amber-700 font-medium"
      : "bg-indigo-50 text-indigo-700 font-medium";

  const accentHover =
    accent === "amber"
      ? "hover:bg-amber-50 hover:text-amber-700"
      : "hover:bg-indigo-50 hover:text-indigo-700";

  const dropdown = open ? (
    <div
      data-price-dropdown
      style={dropdownStyle}
      className="rounded-xl border border-slate-200 bg-white shadow-lg py-1 overflow-y-auto max-h-48 w-20"
    >
      {PRICE_SUGGESTIONS.map((s) => (
        <button
          key={s.value}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onChange(String(s.value));
            setOpen(false);
          }}
          className={`w-full px-3 py-1.5 text-left text-sm transition-colors ${
            value === String(s.value)
              ? accentSelected
              : `text-slate-600 ${accentHover}`
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <>
      <Input
        ref={inputRef}
        type="number"
        placeholder={placeholder}
        value={value}
        min={0}
        step={1}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          updatePosition();
          setOpen(true);
        }}
        className={className}
      />
      {typeof document !== "undefined" && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </>
  );
}
