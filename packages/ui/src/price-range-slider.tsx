"use client";

import { useState, useCallback, useEffect } from "react";
import { Slider } from "./slider";
import { cn } from "@thc-efb/shared/utils";

const PRICE_STEPS = [
  0, 10_000, 50_000, 100_000, 150_000, 200_000, 300_000, 400_000, 500_000,
  600_000, 700_000, 800_000, 900_000, 1_000_000, 1_500_000, 2_000_000,
  3_000_000, 5_000_000, 10_000_000,
];

function priceToStep(price: number): number {
  for (let i = PRICE_STEPS.length - 1; i >= 0; i--) {
    if (price >= PRICE_STEPS[i]) return i;
  }
  return 0;
}

function stepToPrice(step: number): number {
  return PRICE_STEPS[Math.min(step, PRICE_STEPS.length - 1)] ?? 0;
}

function formatCompact(n: number): string {
  if (n === 0) return "0";
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}tr`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}k`;
  }
  return n.toString();
}

interface PriceRangeSliderProps {
  minValue: string;
  maxValue: string;
  onMinChange: (val: string) => void;
  onMaxChange: (val: string) => void;
  accent?: "indigo" | "amber";
  className?: string;
}

export function PriceRangeSlider({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  accent = "indigo",
  className,
}: PriceRangeSliderProps) {
  const maxStep = PRICE_STEPS.length - 1;

  const [steps, setSteps] = useState<number[]>([
    minValue ? priceToStep(parseInt(minValue) || 0) : 0,
    maxValue ? priceToStep(parseInt(maxValue) || 0) : maxStep,
  ]);

  useEffect(() => {
    const newMin = minValue ? priceToStep(parseInt(minValue) || 0) : 0;
    const newMax = maxValue ? priceToStep(parseInt(maxValue) || 0) : maxStep;
    setSteps([newMin, newMax]);
  }, [minValue, maxValue, maxStep]);

  const handleChange = useCallback(
    (value: number | readonly number[]) => {
      const newSteps = Array.isArray(value) ? [...value] : [value];
      setSteps(newSteps);
      const min = stepToPrice(newSteps[0]);
      const max = stepToPrice(newSteps[1]);
      onMinChange(min > 0 ? min.toString() : "");
      onMaxChange(max < PRICE_STEPS[maxStep] ? max.toString() : "");
    },
    [onMinChange, onMaxChange, maxStep],
  );

  const minDisplay = stepToPrice(steps[0]);
  const maxDisplay = stepToPrice(steps[1]);
  const isDefault = steps[0] === 0 && steps[1] === maxStep;

  const accentClasses =
    accent === "amber"
      ? "[&_[data-slot=slider-range]]:bg-amber-500 [&_[data-slot=slider-thumb]]:border-amber-500 [&_[data-slot=slider-thumb]]:ring-amber-500/40"
      : "[&_[data-slot=slider-range]]:bg-indigo-500 [&_[data-slot=slider-thumb]]:border-indigo-500 [&_[data-slot=slider-thumb]]:ring-indigo-500/40";

  return (
    <div className={cn("w-full min-w-[160px]", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {isDefault
            ? "Tất cả giá"
            : `${formatCompact(minDisplay)} — ${maxDisplay >= PRICE_STEPS[maxStep] ? "10tr+" : formatCompact(maxDisplay)}`}
        </span>
      </div>

      <div className="px-1.5">
        <Slider
          value={steps}
          onValueChange={handleChange}
          min={0}
          max={maxStep}
          step={1}
          className={accentClasses}
        />
      </div>
    </div>
  );
}
