"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

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
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <span className="text-5xl font-bold tabular-nums text-primary">
          {year}
        </span>
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
