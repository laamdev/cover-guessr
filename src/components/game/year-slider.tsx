"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

export function YearSlider({
  onSubmit,
  disabled,
  minYear = 1950,
  maxYear = 2025,
}: {
  onSubmit: (year: number) => void;
  disabled: boolean;
  minYear?: number;
  maxYear?: number;
}) {
  const midYear = Math.round((minYear + maxYear) / 2);
  const [year, setYear] = useState(midYear);

  // Reset to midpoint when range changes
  useEffect(() => {
    setYear(Math.round((minYear + maxYear) / 2));
  }, [minYear, maxYear]);

  return (
    <div className="w-full max-w-sm space-y-4 sm:space-y-6">
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={disabled || year <= minYear}
          onClick={() => setYear((y) => Math.max(minYear, y - 1))}
          className="rounded-full p-1.5 text-muted-foreground hover:text-primary hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <ChevronDown className="size-6" />
        </button>
        <span className="text-4xl font-bold tabular-nums text-primary sm:text-5xl">
          {year}
        </span>
        <button
          type="button"
          disabled={disabled || year >= maxYear}
          onClick={() => setYear((y) => Math.min(maxYear, y + 1))}
          className="rounded-full p-1.5 text-muted-foreground hover:text-primary hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <ChevronUp className="size-6" />
        </button>
      </div>

      <Slider
        value={[year]}
        onValueChange={(v) => setYear(Array.isArray(v) ? v[0] : v)}
        min={minYear}
        max={maxYear}
        step={1}
        disabled={disabled}
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>

      <Button
        onClick={() => onSubmit(year)}
        disabled={disabled}
        className="w-full uppercase tracking-wider"
        size="lg"
      >
        Lock In Guess
      </Button>
    </div>
  );
}
